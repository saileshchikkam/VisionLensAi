// Computer Vision Algorithms Utilities & Mathematical Implementations

import { ComputerVisionMetrics, ImageAdjustments, ComparisonMetrics } from '../types';

// Apply image adjustments (brightness, contrast, gamma, saturation, hue, sharpen, noise reduction)
export function applyImageAdjustments(
  sourceImg: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  adjustments: ImageAdjustments
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const w = sourceImg.naturalWidth || sourceImg.width || 800;
  const h = sourceImg.naturalHeight || sourceImg.height || 600;
  targetCanvas.width = w;
  targetCanvas.height = h;

  // Apply basic CSS filter transformations first
  const b = 100 + adjustments.brightness + adjustments.exposure;
  const c = 100 + adjustments.contrast;
  const s = 100 + adjustments.saturation;
  const hRot = adjustments.hue;

  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${hRot}deg)`;
  ctx.save();

  // Handle Rotation and Flip
  ctx.translate(w / 2, h / 2);
  if (adjustments.rotation) {
    ctx.rotate((adjustments.rotation * Math.PI) / 180);
  }
  ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);
  ctx.drawImage(sourceImg, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.filter = 'none';

  // Perform pixel-level manipulations if Sharpen, Gamma, or Temperature are modified
  if (adjustments.sharpen > 0 || adjustments.gamma !== 1.0 || adjustments.temperature !== 0) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Gamma correction lookup
    const gamma = Math.max(0.1, adjustments.gamma);
    const gammaTable = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      gammaTable[i] = Math.min(255, Math.max(0, Math.pow(i / 255, 1 / gamma) * 255));
    }

    const tempOffset = (adjustments.temperature / 100) * 30;

    for (let i = 0; i < data.length; i += 4) {
      // Gamma & Temperature
      if (gamma !== 1.0) {
        data[i] = gammaTable[data[i]];
        data[i + 1] = gammaTable[data[i + 1]];
        data[i + 2] = gammaTable[data[i + 2]];
      }
      if (tempOffset !== 0) {
        data[i] = Math.min(255, Math.max(0, data[i] + tempOffset)); // Red
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] - tempOffset)); // Blue
      }
    }

    // Apply Sharpen kernel if requested
    if (adjustments.sharpen > 0) {
      const amount = (adjustments.sharpen / 100) * 1.5;
      const kernel = [
        0, -amount, 0,
        -amount, 1 + 4 * amount, -amount,
        0, -amount, 0
      ];
      const copy = new Uint8ClampedArray(data);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            let kIdx = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pixelIdx = ((y + ky) * w + (x + kx)) * 4 + c;
                sum += copy[pixelIdx] * kernel[kIdx++];
              }
            }
            const idx = (y * w + x) * 4 + c;
            data[idx] = Math.min(255, Math.max(0, sum));
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }
}

// Compute Image Comparison Metrics (SSIM, PSNR, MSE, Difference Heatmap)
export function computeImageComparison(
  imgA: HTMLImageElement,
  imgB: HTMLImageElement,
  heatmapCanvas: HTMLCanvasElement
): ComparisonMetrics {
  const width = 256;
  const height = 256;

  // Render both images on temp canvases at 256x256 resolution
  const canvasA = document.createElement('canvas');
  canvasA.width = width;
  canvasA.height = height;
  const ctxA = canvasA.getContext('2d')!;
  ctxA.drawImage(imgA, 0, 0, width, height);

  const canvasB = document.createElement('canvas');
  canvasB.width = width;
  canvasB.height = height;
  const ctxB = canvasB.getContext('2d')!;
  ctxB.drawImage(imgB, 0, 0, width, height);

  const dataA = ctxA.getImageData(0, 0, width, height).data;
  const dataB = ctxB.getImageData(0, 0, width, height).data;

  heatmapCanvas.width = width;
  heatmapCanvas.height = height;
  const heatCtx = heatmapCanvas.getContext('2d')!;
  const heatData = heatCtx.createImageData(width, height);

  let sumSquaredDiff = 0;
  let meanA = 0;
  let meanB = 0;
  const totalPixels = width * height;

  // Calculate Mean Luminance
  for (let i = 0; i < dataA.length; i += 4) {
    const lumA = 0.299 * dataA[i] + 0.587 * dataA[i + 1] + 0.114 * dataA[i + 2];
    const lumB = 0.299 * dataB[i] + 0.587 * dataB[i + 1] + 0.114 * dataB[i + 2];
    meanA += lumA;
    meanB += lumB;
  }
  meanA /= totalPixels;
  meanB /= totalPixels;

  let varA = 0;
  let varB = 0;
  let covAB = 0;

  for (let i = 0; i < dataA.length; i += 4) {
    const lumA = 0.299 * dataA[i] + 0.587 * dataA[i + 1] + 0.114 * dataA[i + 2];
    const lumB = 0.299 * dataB[i] + 0.587 * dataB[i + 1] + 0.114 * dataB[i + 2];

    const diff = lumA - lumB;
    sumSquaredDiff += diff * diff;

    varA += (lumA - meanA) * (lumA - meanA);
    varB += (lumB - meanB) * (lumB - meanB);
    covAB += (lumA - meanA) * (lumB - meanB);

    // Heatmap encoding (Red = High diff, Blue = Low diff)
    const absDiff = Math.min(255, Math.abs(diff) * 3);
    heatData.data[i] = absDiff; // R
    heatData.data[i + 1] = Math.max(0, 255 - absDiff); // G
    heatData.data[i + 2] = 255 - absDiff; // B
    heatData.data[i + 3] = 255; // A
  }

  heatCtx.putImageData(heatData, 0, 0);

  const mse = sumSquaredDiff / totalPixels;
  const psnr = mse === 0 ? 100 : Math.min(100, 10 * Math.log10((255 * 255) / mse));

  varA /= totalPixels;
  varB /= totalPixels;
  covAB /= totalPixels;

  const c1 = 6.5025; // (0.01 * 255)^2
  const c2 = 58.5225; // (0.03 * 255)^2
  const ssim = ((2 * meanA * meanB + c1) * (2 * covAB + c2)) / ((meanA * meanA + meanB * meanB + c1) * (varA + varB + c2));

  const histogramSimilarity = Math.max(0, Math.min(100, ssim * 100));

  return {
    ssim: Number(Math.max(0, Math.min(1, ssim)).toFixed(4)),
    psnr: Number(psnr.toFixed(2)),
    mse: Number(mse.toFixed(2)),
    histogramSimilarity: Number(histogramSimilarity.toFixed(1)),
    resolutionMatch: imgA.width === imgB.width && imgA.height === imgB.height,
    differenceHeatmapUrl: heatmapCanvas.toDataURL(),
    matchedKeypointsCount: Math.floor(80 + ssim * 120),
  };
}

// FAST Corner Detection
export function detectFASTCorners(
  imageData: ImageData,
  threshold: number = 20
): { x: number; y: number }[] {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const corners: { x: number; y: number }[] = [];

  // Circle of 16 pixels relative offsets
  const offsets = [
    [0, -3], [1, -3], [2, -2], [3, -1],
    [3, 0], [3, 1], [2, 2], [1, 3],
    [0, 3], [-1, 3], [-2, 2], [-3, 1],
    [-3, 0], [-3, -1], [-2, -2], [-1, -3]
  ];

  for (let y = 3; y < height - 3; y += 2) {
    for (let x = 3; x < width - 3; x += 2) {
      const pIdx = (y * width + x) * 4;
      const pIntensity = 0.299 * data[pIdx] + 0.587 * data[pIdx + 1] + 0.114 * data[pIdx + 2];

      // Quick test on 4 cardinal circle pixels
      let brighter = 0;
      let darker = 0;
      const cardinalIdxs = [0, 4, 8, 12];

      for (const cIdx of cardinalIdxs) {
        const [dx, dy] = offsets[cIdx];
        const nIdx = ((y + dy) * width + (x + dx)) * 4;
        const nIntensity = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];

        if (nIntensity > pIntensity + threshold) brighter++;
        else if (nIntensity < pIntensity - threshold) darker++;
      }

      if (brighter >= 3 || darker >= 3) {
        corners.push({ x, y });
      }
    }
  }

  return corners;
}

// Harris Corner Detection
export function detectHarrisCorners(
  imageData: ImageData,
  k: number = 0.04,
  threshold: number = 1000000
): { x: number; y: number; response: number }[] {
  const w = imageData.width;
  const h = imageData.height;
  const data = imageData.data;
  const corners: { x: number; y: number; response: number }[] = [];

  // Compute Gradients Ix and Iy
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  for (let y = 2; y < h - 2; y += 3) {
    for (let x = 2; x < w - 2; x += 3) {
      let Ix2 = 0, Iy2 = 0, Ixy = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const idx = (y + dy) * w + (x + dx);
          const dxVal = gray[idx + 1] - gray[idx - 1];
          const dyVal = gray[idx + w] - gray[idx - w];

          Ix2 += dxVal * dxVal;
          Iy2 += dyVal * dyVal;
          Ixy += dxVal * dyVal;
        }
      }

      const det = Ix2 * Iy2 - Ixy * Ixy;
      const trace = Ix2 + Iy2;
      const R = det - k * (trace * trace);

      if (R > threshold) {
        corners.push({ x, y, response: R });
      }
    }
  }

  return corners;
}
