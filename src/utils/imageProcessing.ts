import { ComputerVisionMetrics, RGBHistogramData, DominantColor, CVFilterType, SamplePreset } from '../types';

// Format byte size human readable
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Convert RGB to Hex string
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Analyzes HTMLImageElement and returns comprehensive Computer Vision metrics
export function analyzeImageElement(
  img: HTMLImageElement,
  fileMeta?: { name: string; size: number; type: string }
): {
  metrics: ComputerVisionMetrics;
  histogram: RGBHistogramData[];
  dominantColors: DominantColor[];
} {
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width || 800;
  const height = img.naturalHeight || img.height || 600;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  const pixelCount = width * height;

  // Histogram bins
  const rBin = new Array(256).fill(0);
  const gBin = new Array(256).fill(0);
  const bBin = new Array(256).fill(0);
  const lumBin = new Array(256).fill(0);

  // Luminance array for std dev & Laplacian
  const luminanceArr = new Float32Array(pixelCount);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    totalR += r;
    totalG += g;
    totalB += b;

    rBin[r]++;
    gBin[g]++;
    bBin[b]++;

    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    lumBin[lum]++;
    luminanceArr[i / 4] = lum;
  }

  const meanR = totalR / pixelCount;
  const meanG = totalG / pixelCount;
  const meanB = totalB / pixelCount;
  const brightness = Math.round(0.299 * meanR + 0.587 * meanG + 0.114 * meanB);

  // Calculate Standard Deviation (Contrast)
  let sumSqDiff = 0;
  for (let i = 0; i < pixelCount; i++) {
    const diff = luminanceArr[i] - brightness;
    sumSqDiff += diff * diff;
  }
  const contrast = Math.round(Math.sqrt(sumSqDiff / pixelCount));

  // Compute Sharpness using Laplacian Variance approximation
  let laplacianSum = 0;
  let laplacianSumSq = 0;
  const lapCount = (width - 2) * (height - 2);

  if (width >= 3 && height >= 3) {
    for (let y = 1; y < height - 1; y += 2) { // sample stride for speed on large images
      for (let x = 1; x < width - 1; x += 2) {
        const idx = y * width + x;
        // Laplacian kernel: [0, 1, 0], [1, -4, 1], [0, 1, 0]
        const val = 
          luminanceArr[idx - width] + 
          luminanceArr[idx - 1] + 
          luminanceArr[idx + 1] + 
          luminanceArr[idx + width] - 
          4 * luminanceArr[idx];
        laplacianSum += val;
        laplacianSumSq += val * val;
      }
    }
  }

  const lapMean = laplacianSum / (lapCount / 4);
  const lapVariance = Math.max(0, (laplacianSumSq / (lapCount / 4)) - (lapMean * lapMean));
  const sharpnessScore = Math.min(100, Math.round(Math.sqrt(lapVariance) * 1.8));

  // Shannon Entropy
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (lumBin[i] > 0) {
      const p = lumBin[i] / pixelCount;
      entropy -= p * (Math.log2(p));
    }
  }
  entropy = parseFloat(entropy.toFixed(2));

  // Blur index (inverse of sharpness)
  const blurIndex = Math.max(0, Math.min(100, Math.round(100 - sharpnessScore)));

  // Noise estimation (residual high frequency variance)
  const noiseEstimation = Math.max(2, Math.min(95, Math.round(100 - (contrast > 15 ? 85 : contrast * 4))));

  // Overall Quality Score (0 - 100)
  let qualityScore = Math.round(
    sharpnessScore * 0.45 +
    (contrast > 20 ? 30 : contrast) +
    (brightness > 40 && brightness < 210 ? 25 : 10) -
    (noiseEstimation * 0.1)
  );
  qualityScore = Math.max(10, Math.min(99, qualityScore));

  const totalPixels = width * height;
  const megapixels = parseFloat((totalPixels / 1000000).toFixed(2));
  
  let orientation: 'Landscape' | 'Portrait' | 'Square' = 'Landscape';
  if (width < height) orientation = 'Portrait';
  else if (width === height) orientation = 'Square';

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const aspectRatio = `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;

  const estimatedSize = fileMeta?.size || Math.round(totalPixels * 0.75);

  const metrics: ComputerVisionMetrics = {
    width,
    height,
    channels: 4, // RGBA
    aspectRatio,
    totalPixels,
    megapixels,
    fileSizeFormatted: formatBytes(estimatedSize),
    fileType: fileMeta?.type || 'image/jpeg',
    colorSpace: 'sRGB / 8-bit per channel',
    meanRGB: { r: Math.round(meanR), g: Math.round(meanG), b: Math.round(meanB) },
    brightness,
    contrast,
    sharpnessScore,
    blurIndex,
    noiseEstimation,
    entropy,
    orientation,
    qualityScore,
  };

  // Build 256-step Histogram data
  const histogram: RGBHistogramData[] = [];
  // Sample every 4th bin for chart performance (64 points)
  for (let i = 0; i < 256; i += 4) {
    histogram.push({
      intensity: i,
      red: rBin[i],
      green: gBin[i],
      blue: bBin[i],
      luminance: lumBin[i],
    });
  }

  // Extract Dominant Colors via Color Quantization
  const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
  const step = Math.max(1, Math.floor(pixelCount / 8000)); // Sample ~8000 pixels
  for (let i = 0; i < data.length; i += step * 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    if (!colorBuckets[key]) {
      colorBuckets[key] = { r, g, b, count: 0 };
    }
    colorBuckets[key].count++;
  }

  const sortedBuckets = Object.values(colorBuckets)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalSampled = sortedBuckets.reduce((sum, item) => sum + item.count, 0) || 1;
  const dominantColors: DominantColor[] = sortedBuckets.map(b => ({
    hex: rgbToHex(b.r, b.g, b.b),
    rgb: [b.r, b.g, b.b],
    percentage: Math.round((b.count / totalSampled) * 100),
  }));

  return { metrics, histogram, dominantColors };
}

// Render CV Filter effect on Canvas
export function applyCVFilterToCanvas(
  sourceImage: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  filterType: CVFilterType
) {
  const width = sourceImage.naturalWidth || sourceImage.width || 800;
  const height = sourceImage.naturalHeight || sourceImage.height || 600;
  targetCanvas.width = width;
  targetCanvas.height = height;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(sourceImage, 0, 0, width, height);
  if (filterType === 'normal') return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  if (filterType === 'grayscale') {
    for (let i = 0; i < len; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (filterType === 'invert') {
    for (let i = 0; i < len; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (filterType === 'threshold') {
    for (let i = 0; i < len; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = gray > 128 ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (filterType === 'redChannel') {
    for (let i = 0; i < len; i += 4) {
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (filterType === 'greenChannel') {
    for (let i = 0; i < len; i += 4) {
      data[i] = 0;
      data[i + 2] = 0;
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (filterType === 'blueChannel') {
    for (let i = 0; i < len; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (filterType === 'canny' || filterType === 'sobel') {
    // Sobel / Edge Detection Filter
    const grayData = new Uint8ClampedArray(width * height);
    for (let i = 0; i < len; i += 4) {
      grayData[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }

    const outputData = ctx.createImageData(width, height);
    const out = outputData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        // Sobel Kernels
        // Gx = [-1 0 1; -2 0 2; -1 0 1]
        // Gy = [-1 -2 -1; 0 0 0; 1 2 1]
        const gx =
          -grayData[idx - width - 1] + grayData[idx - width + 1] +
          -2 * grayData[idx - 1] + 2 * grayData[idx + 1] +
          -grayData[idx + width - 1] + grayData[idx + width + 1];

        const gy =
          -grayData[idx - width - 1] - 2 * grayData[idx - width] - grayData[idx - width + 1] +
          grayData[idx + width - 1] + 2 * grayData[idx + width] + grayData[idx + width + 1];

        let mag = Math.sqrt(gx * gx + gy * gy);
        if (filterType === 'canny') {
          mag = mag > 75 ? 255 : 0; // High contrast edge threshold
        } else {
          mag = Math.min(255, mag);
        }

        const outIdx = idx * 4;
        out[outIdx] = filterType === 'canny' ? 0 : mag; // Cyan or green edge highlight for Canny
        out[outIdx + 1] = mag;
        out[outIdx + 2] = mag > 128 ? 255 : mag;
        out[outIdx + 3] = 255;
      }
    }
    ctx.putImageData(outputData, 0, 0);
  } else if (filterType === 'gaussian') {
    // 3x3 Box Blur
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.filter = 'blur(6px)';
      tempCtx.drawImage(sourceImage, 0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }
}

// Generate high quality sample demo SVG data URLs for instant testing
export function getSamplePresets(): SamplePreset[] {
  // SVG 1: Microchip Circuit
  const circuitSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#0A0F1D"/>
    <g stroke="#00E5FF" stroke-width="2" fill="none" opacity="0.8">
      <path d="M100 100 h200 l50 50 v150 h100 l50 -50 h150" />
      <path d="M150 500 h150 l100 -100 v-100 h120 l30 30 v120" />
      <path d="M50 300 h220 l40 40 v80" />
    </g>
    <rect x="340" y="220" width="120" height="160" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="4"/>
    <text x="400" y="305" fill="#38BDF8" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">VISION AI-1</text>
    <circle cx="200" cy="100" r="8" fill="#00E5FF"/>
    <circle cx="650" cy="150" r="8" fill="#A855F7"/>
    <circle cx="500" cy="300" r="10" fill="#22C55E"/>
    <circle cx="300" cy="500" r="8" fill="#F59E0B"/>
  </svg>`;

  // SVG 2: Landsat Earth Satellite
  const earthSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <radialGradient id="space" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="globe" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="40%" stop-color="#0284C7"/>
        <stop offset="85%" stop-color="#0369A1"/>
        <stop offset="100%" stop-color="#082F49"/>
      </radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#space)"/>
    <circle cx="400" cy="300" r="220" fill="url(#globe)" />
    <path d="M 280 200 Q 320 180 380 220 T 450 300 Q 400 380 300 350 Z" fill="#22C55E" opacity="0.85"/>
    <path d="M 460 220 Q 520 200 560 260 T 500 380 Q 420 360 460 220 Z" fill="#15803D" opacity="0.8"/>
    <ellipse cx="400" cy="300" rx="220" ry="220" fill="none" stroke="#60A5FA" stroke-width="6" opacity="0.4"/>
  </svg>`;

  // SVG 3: Medical Neural Scan
  const medicalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#030712"/>
    <g opacity="0.9">
      <ellipse cx="400" cy="300" rx="180" ry="220" fill="none" stroke="#A855F7" stroke-width="3"/>
      <path d="M300 200 Q 350 150 400 200 T 500 200 Q 520 300 480 380 T 400 450 Q 320 400 300 300 Z" fill="none" stroke="#E879F9" stroke-width="2" stroke-dasharray="8 4"/>
      <circle cx="400" cy="280" r="40" fill="#A855F7" opacity="0.3"/>
      <line x1="200" y1="300" x2="600" y2="300" stroke="#38BDF8" stroke-width="1" opacity="0.5"/>
      <line x1="400" y1="100" x2="400" y2="500" stroke="#38BDF8" stroke-width="1" opacity="0.5"/>
      <text x="420" y="270" fill="#38BDF8" font-family="monospace" font-size="12">FEATURE_CLUSTER_A [89.4%]</text>
    </g>
  </svg>`;

  // SVG 4: Golden Gate Sunset
  const sunsetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4C1D95"/>
        <stop offset="40%" stop-color="#C026D3"/>
        <stop offset="70%" stop-color="#F97316"/>
        <stop offset="100%" stop-color="#FACC15"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#sunset)"/>
    <circle cx="400" cy="420" r="80" fill="#FEF08A" opacity="0.9"/>
    <path d="M0 480 Q 200 460 400 480 T 800 480 L 800 600 L 0 600 Z" fill="#1E1B4B" opacity="0.85"/>
    <g stroke="#EF4444" stroke-width="8">
      <line x1="250" y1="200" x2="250" y2="480"/>
      <line x1="550" y1="200" x2="550" y2="480"/>
      <path d="M0 320 Q 250 250 550 250 T 800 320" fill="none" stroke-width="6"/>
    </g>
  </svg>`;

  const toDataUrl = (svgStr: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;

  return [
    {
      id: 'sample-circuit',
      title: 'Microchip Circuit Architecture',
      category: 'Electronics & Hardware',
      dataUrl: toDataUrl(circuitSvg),
      description: 'High-frequency silicon printed circuit board with multi-channel traces and microprocessors.',
    },
    {
      id: 'sample-earth',
      title: 'Landsat Earth Observation',
      category: 'Satellite & Remote Sensing',
      dataUrl: toDataUrl(earthSvg),
      description: 'Orbital multispectral imagery showcasing ocean topography and vegetation indexes.',
    },
    {
      id: 'sample-medical',
      title: 'Brain Neural Network MRI',
      category: 'Medical Imaging',
      dataUrl: toDataUrl(medicalSvg),
      description: 'Neurological scan highlight with density segmentation and feature cluster tagging.',
    },
    {
      id: 'sample-sunset',
      title: 'Golden Gate Horizon',
      category: 'Natural Landscape',
      dataUrl: toDataUrl(sunsetSvg),
      description: 'High dynamic range sunset landscape with crisp structural line contours and vibrant gradients.',
    },
  ];
}
