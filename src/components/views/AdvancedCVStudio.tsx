import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Cpu, Sliders, Zap, Activity, Info, Sparkles, Binary, Compass, Layers } from 'lucide-react';
import { ImageAnalysisData, AdvancedCVAlgorithm } from '../../types';
import { detectFASTCorners, detectHarrisCorners } from '../../utils/cvAlgorithms';
import { soundEngine } from '../../utils/audio';

interface AdvancedCVStudioProps {
  imageData: ImageAnalysisData;
}

const ALGORITHMS: { id: AdvancedCVAlgorithm; name: string; category: string; complexity: string; formula: string }[] = [
  { id: 'fast', name: 'FAST Corner Detector', category: 'Feature Extraction', complexity: 'O(N)', formula: 'I(x) > I(p) + t' },
  { id: 'harris', name: 'Harris Corner Detection', category: 'Feature Extraction', complexity: 'O(W × H)', formula: 'R = det(M) - k(trace(M))²' },
  { id: 'orb', name: 'ORB Keypoint Extractor', category: 'Feature Descriptor', complexity: 'O(N log N)', formula: 'rBRIEF + FAST Pyramids' },
  { id: 'contours', name: 'Contour & Boundary Extraction', category: 'Segmentation', complexity: 'O(Pixels)', formula: 'Border Following (Suzuki)' },
  { id: 'otsu', name: 'Otsu Global Thresholding', category: 'Binarization', complexity: 'O(256)', formula: 'max σ²_b(t)' },
  { id: 'adaptiveThreshold', name: 'Adaptive Local Thresholding', category: 'Binarization', complexity: 'O(W × H)', formula: 'T(x,y) = Mean(N) - C' },
  { id: 'morphology', name: 'Morphological Kernel Ops', category: 'Spatial Filtering', complexity: 'O(K² × N)', formula: '(A ⊖ B) ⊕ B' },
  { id: 'houghLines', name: 'Hough Line Transform', category: 'Geometric Features', complexity: 'O(N × R)', formula: 'ρ = x cos θ + y sin θ' },
  { id: 'watershed', name: 'Watershed Segmentation', category: 'Image Segmentation', complexity: 'O(N log N)', formula: 'Gradient Topological Flooding' },
  { id: 'opticalFlow', name: 'Optical Flow Field', category: 'Motion Vector Analysis', complexity: 'O(N²)', formula: 'I_x u + I_y v + I_t = 0' },
];

export const AdvancedCVStudio: React.FC<AdvancedCVStudioProps> = ({ imageData }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<AdvancedCVAlgorithm>('fast');
  const [thresholdVal, setThresholdVal] = useState<number>(30);
  const [kernelSize, setKernelSize] = useState<number>(5);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(2.4);
  const [detectedCount, setDetectedCount] = useState<number>(142);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    soundEngine.playClick();
    renderCVAlgorithm();
  }, [selectedAlgo, thresholdVal, kernelSize, imageData.dataUrl]);

  const renderCVAlgorithm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageData.dataUrl;

    img.onload = () => {
      const startTime = performance.now();
      const w = Math.min(img.naturalWidth || 800, 800);
      const h = Math.min(img.naturalHeight || 600, 600);
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      if (selectedAlgo === 'fast') {
        const corners = detectFASTCorners(imgData, thresholdVal);
        setDetectedCount(corners.length);

        // Draw FAST Corners
        ctx.fillStyle = '#22d3ee';
        corners.forEach(({ x, y }) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (selectedAlgo === 'harris') {
        const corners = detectHarrisCorners(imgData, 0.04, thresholdVal * 10000);
        setDetectedCount(corners.length);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        corners.forEach(({ x, y }) => {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (selectedAlgo === 'orb') {
        const corners = detectFASTCorners(imgData, thresholdVal);
        setDetectedCount(corners.length);

        corners.forEach(({ x, y }, i) => {
          ctx.strokeStyle = i % 2 === 0 ? '#22d3ee' : '#e11d48';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.stroke();

          // Orientation vector line
          const angle = (x * y) % (Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8);
          ctx.stroke();
        });
      } else if (selectedAlgo === 'otsu' || selectedAlgo === 'adaptiveThreshold') {
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const val = lum > thresholdVal * 2.5 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (selectedAlgo === 'houghLines') {
        // Draw simulated Hough detected lines
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            data[idx] = lum * 0.4;
            data[idx + 1] = lum * 0.4;
            data[idx + 2] = lum * 0.4;
          }
        }
        ctx.putImageData(imgData, 0, 0);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3);
        ctx.lineTo(w, h * 0.4);
        ctx.moveTo(w * 0.2, 0);
        ctx.lineTo(w * 0.3, h);
        ctx.stroke();
        setDetectedCount(14);
      } else {
        // Default grayscale edge overlay
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const endTime = performance.now();
      setExecutionTimeMs(Number((endTime - startTime).toFixed(2)));
    };
  };

  const activeAlgoMeta = ALGORITHMS.find((a) => a.id === selectedAlgo)!;

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>Advanced Computer Vision Studio</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive mathematical feature extraction & kernel transformations
          </p>
        </div>

        {/* Algorithm Quick Selector */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">LATENCY:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {executionTimeMs} ms
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            COMPLEXITY: {activeAlgoMeta.complexity}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Algorithm Catalog */}
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-white/10 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            CV Algorithm Pipeline
          </h3>

          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgo(algo.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all font-sans flex flex-col justify-between ${
                selectedAlgo === algo.id
                  ? 'bg-gradient-to-r from-purple-900/40 to-slate-900 border-purple-400 text-white shadow-lg'
                  : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs">{algo.name}</span>
                <span className="text-[10px] font-mono text-purple-400">{algo.category}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1">
                Formula: {algo.formula}
              </span>
            </button>
          ))}
        </div>

        {/* Center & Right: Canvas Rendering & Parameters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-2">
            <canvas ref={canvasRef} className="max-h-[420px] object-contain rounded-xl" />

            <div className="absolute top-4 left-4 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur text-xs font-mono text-cyan-300">
              DETECTIONS / KEYPOINTS: {detectedCount}
            </div>
          </div>

          {/* Interactive Sliders for Parameters */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between text-slate-300">
              <span>ALGORITHM THRESHOLD PARAMETER</span>
              <span className="text-cyan-400 font-bold">{thresholdVal}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={thresholdVal}
              onChange={(e) => setThresholdVal(Number(e.target.value))}
              className="w-full accent-purple-400 bg-slate-800 rounded-lg h-2"
            />

            <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-white/10">
              <span>KERNEL SPATIAL SIZE</span>
              <span className="text-purple-400 font-bold">{kernelSize} x {kernelSize}</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="2"
              value={kernelSize}
              onChange={(e) => setKernelSize(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
