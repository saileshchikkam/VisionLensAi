import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sliders, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2, Eye, Sun, Contrast, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ImageAnalysisData, ImageAdjustments } from '../../types';
import { applyImageAdjustments } from '../../utils/cvAlgorithms';
import { soundEngine } from '../../utils/audio';

interface ImageInspectorProps {
  imageData: ImageAnalysisData;
  onUpdateAdjustments: (adjustments: ImageAdjustments) => void;
}

const defaultAdjustments: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  gamma: 1.0,
  saturation: 0,
  hue: 0,
  sharpen: 0,
  noiseReduction: 0,
  exposure: 0,
  temperature: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
};

export const ImageInspector: React.FC<ImageInspectorProps> = ({ imageData, onUpdateAdjustments }) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(imageData.adjustments || defaultAdjustments);
  const [history, setHistory] = useState<ImageAdjustments[]>([imageData.adjustments || defaultAdjustments]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percentage

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load Image and Apply Adjustments
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageData.dataUrl;
    img.onload = () => {
      imgRef.current = img;
      if (canvasRef.current) {
        applyImageAdjustments(img, canvasRef.current, adjustments);
      }
    };
  }, [imageData.dataUrl, adjustments]);

  const updateParam = (key: keyof ImageAdjustments, value: any) => {
    soundEngine.playTick();
    const next = { ...adjustments, [key]: value };
    setAdjustments(next);

    // Push to history
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(next);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);

    onUpdateAdjustments(next);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      soundEngine.playClick();
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setAdjustments(prev);
      onUpdateAdjustments(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      soundEngine.playClick();
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setAdjustments(next);
      onUpdateAdjustments(next);
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    setAdjustments(defaultAdjustments);
    setHistory([defaultAdjustments]);
    setHistoryIndex(0);
    setZoom(1);
    onUpdateAdjustments(defaultAdjustments);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 text-slate-100 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Image Inspector & Precision Editor</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Non-destructive pixel adjustments & spectral filtering
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-2 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-40 transition-all text-slate-300"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-40 transition-all text-slate-300"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 transition-all text-slate-300"
            title="Reset All Adjustments"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all flex items-center gap-1.5 ${
              showBeforeAfter
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-slate-800 border-white/10 text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showBeforeAfter ? 'Split View: ON' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport + Slider Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Display Viewport */}
        <div className="lg:col-span-2 relative aspect-video rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center p-4">
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {showBeforeAfter ? (
              <div className="relative overflow-hidden max-h-[450px]">
                {/* Modified Canvas */}
                <canvas ref={canvasRef} className="max-h-[450px] object-contain rounded-xl" />

                {/* Original Overlay */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400 shadow-[0_0_15px_#22d3ee]"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={imageData.dataUrl}
                    alt="Original"
                    className="max-h-[450px] object-contain"
                  />
                </div>

                {/* Split Control Line */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(Number(e.target.value))}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full opacity-0 cursor-ew-resize z-20"
                />
              </div>
            ) : (
              <canvas ref={canvasRef} className="max-h-[450px] object-contain rounded-xl shadow-2xl" />
            )}
          </div>

          {/* Zoom Toolbar */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur flex items-center gap-2 text-xs font-mono text-slate-300">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Adjustments Controls Side Panel */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10 font-mono text-xs max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-cyan-400" />
            <span>Tone & Lighting</span>
          </h3>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Brightness</span>
              <span>{adjustments.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.brightness}
              onChange={(e) => updateParam('brightness', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-1.5"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Contrast</span>
              <span>{adjustments.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.contrast}
              onChange={(e) => updateParam('contrast', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-1.5"
            />
          </div>

          {/* Gamma */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Gamma Curve</span>
              <span>{adjustments.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={adjustments.gamma}
              onChange={(e) => updateParam('gamma', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-1.5"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Saturation</span>
              <span>{adjustments.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.saturation}
              onChange={(e) => updateParam('saturation', Number(e.target.value))}
              className="w-full accent-purple-400 bg-slate-800 rounded-lg h-1.5"
            />
          </div>

          {/* Sharpen */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Unsharp Mask</span>
              <span>{adjustments.sharpen}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.sharpen}
              onChange={(e) => updateParam('sharpen', Number(e.target.value))}
              className="w-full accent-purple-400 bg-slate-800 rounded-lg h-1.5"
            />
          </div>

          {/* Transformations */}
          <h3 className="font-bold text-slate-200 uppercase tracking-wider pt-3 border-t border-white/10 flex items-center gap-1.5">
            <RotateCw className="w-4 h-4 text-emerald-400" />
            <span>Transform & Orient</span>
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateParam('rotation', (adjustments.rotation + 90) % 360)}
              className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px]">Rotate 90°</span>
            </button>
            <button
              onClick={() => updateParam('flipH', !adjustments.flipH)}
              className={`py-2 rounded-xl border flex flex-col items-center gap-1 ${
                adjustments.flipH
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span className="text-[10px]">Flip Horiz</span>
            </button>
            <button
              onClick={() => updateParam('flipV', !adjustments.flipV)}
              className={`py-2 rounded-xl border flex flex-col items-center gap-1 ${
                adjustments.flipV
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span className="text-[10px]">Flip Vert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
