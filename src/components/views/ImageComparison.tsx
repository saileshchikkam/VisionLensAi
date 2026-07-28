import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Columns, Upload, Zap, ArrowRightLeft, Sparkles, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { ImageAnalysisData, ComparisonMetrics } from '../../types';
import { computeImageComparison } from '../../utils/cvAlgorithms';
import { soundEngine } from '../../utils/audio';

interface ImageComparisonProps {
  currentImage: ImageAnalysisData;
  historyImages: ImageAnalysisData[];
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ currentImage, historyImages }) => {
  const [imageA, setImageA] = useState<ImageAnalysisData>(currentImage);
  const [imageB, setImageB] = useState<ImageAnalysisData>(
    historyImages.length > 1 ? historyImages[1] : currentImage
  );

  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const heatmapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    runComparison();
  }, [imageA.dataUrl, imageB.dataUrl]);

  const runComparison = () => {
    soundEngine.playClick();
    if (!heatmapRef.current) return;

    const img1 = new Image();
    const img2 = new Image();
    img1.crossOrigin = 'anonymous';
    img2.crossOrigin = 'anonymous';
    img1.src = imageA.dataUrl;
    img2.src = imageB.dataUrl;

    let loaded = 0;
    const onImgLoad = () => {
      loaded++;
      if (loaded === 2 && heatmapRef.current) {
        const res = computeImageComparison(img1, img2, heatmapRef.current);
        setMetrics(res);
      }
    };

    img1.onload = onImgLoad;
    img2.onload = onImgLoad;
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl p-3 sm:p-6 text-slate-100 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Columns className="w-5 h-5 text-cyan-400" />
            <span>Dual Image Structural Comparison</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Mathematical SSIM, PSNR, MSE calculation & difference heatmap
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            SSIM SCORE: {metrics ? (metrics.ssim * 100).toFixed(1) : '--'}%
          </span>
        </div>
      </div>

      {/* Selectors for Image A & Image B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image A Selector */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-cyan-400 font-bold">IMAGE A (REFERENCE)</span>
            <span className="text-slate-400">{imageA.metrics.width}x{imageA.metrics.height}</span>
          </div>

          <div className="aspect-video w-full rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
            <img src={imageA.dataUrl} alt="Image A" className="max-h-[220px] object-contain" />
          </div>

          {historyImages.length > 0 && (
            <select
              value={imageA.id}
              onChange={(e) => {
                const found = historyImages.find((i) => i.id === e.target.value);
                if (found) setImageA(found);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            >
              {historyImages.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.title} ({img.metrics.width}x{img.metrics.height})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Image B Selector */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-purple-400 font-bold">IMAGE B (TARGET)</span>
            <span className="text-slate-400">{imageB.metrics.width}x{imageB.metrics.height}</span>
          </div>

          <div className="aspect-video w-full rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
            <img src={imageB.dataUrl} alt="Image B" className="max-h-[220px] object-contain" />
          </div>

          {historyImages.length > 0 && (
            <select
              value={imageB.id}
              onChange={(e) => {
                const found = historyImages.find((i) => i.id === e.target.value);
                if (found) setImageB(found);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            >
              {historyImages.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.title} ({img.metrics.width}x{img.metrics.height})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Difference Heatmap & Mathematical Metrics Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950/80 p-6 rounded-2xl border border-white/10">
        <div className="lg:col-span-1 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Difference Heatmap (Red = Diff)
          </span>
          <div className="aspect-square w-full rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-2">
            <canvas ref={heatmapRef} className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px]">SSIM INDEX</span>
            <div className="text-2xl font-bold text-cyan-400">
              {metrics ? metrics.ssim : '--'}
            </div>
            <p className="text-[10px] text-slate-400">Structural Similarity Index (0.0 to 1.0)</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px]">PSNR (PEAK SIGNAL-TO-NOISE)</span>
            <div className="text-2xl font-bold text-purple-400">
              {metrics ? metrics.psnr : '--'} dB
            </div>
            <p className="text-[10px] text-slate-400">Noise quality ratio in decibels</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px]">MEAN SQUARED ERROR (MSE)</span>
            <div className="text-2xl font-bold text-emerald-400">
              {metrics ? metrics.mse : '--'}
            </div>
            <p className="text-[10px] text-slate-400">Average squared pixel variance</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px]">MATCHED KEYPOINTS</span>
            <div className="text-2xl font-bold text-amber-400">
              {metrics ? metrics.matchedKeypointsCount : '--'}
            </div>
            <p className="text-[10px] text-slate-400">SIFT/ORB feature point correspondences</p>
          </div>
        </div>
      </div>
    </div>
  );
};
