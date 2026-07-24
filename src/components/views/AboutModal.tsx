import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Cpu, ShieldCheck, Sparkles, Terminal, Code } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-slate-100 space-y-5 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">VisionLens AI System Architecture</h3>
                <p className="text-xs text-slate-400">Smart Image Acquisition & Information System v2.4</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Tech Stack Highlights */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                Engine & Algorithmic Foundations
              </span>
              <p className="text-slate-300 leading-relaxed">
                VisionLens AI maps OpenCV / NumPy computer vision primitives directly to high-throughput client-side Canvas and server-side Gemini 3.6 Multimodal models.
              </p>
            </div>

            {/* OpenCV Equivalencies */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 font-mono text-[11px]">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block font-sans">
                OpenCV Python Function Mapping
              </span>
              <div className="space-y-1 text-slate-300">
                <div><span className="text-cyan-300">cv2.Laplacian()</span> → Spatial Sharpness Variance</div>
                <div><span className="text-cyan-300">cv2.Canny()</span> → Dual-Threshold Edge Detection</div>
                <div><span className="text-cyan-300">cv2.Sobel()</span> → Directional Gradient Magnitude</div>
                <div><span className="text-cyan-300">cv2.calcHist()</span> → 256-Bin RGB Channel Distribution</div>
                <div><span className="text-cyan-300">scipy.stats.entropy</span> → Shannon Spatial Entropy</div>
              </div>
            </div>

            {/* Neural Insights */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                Multimodal Neural Pipeline
              </span>
              <p className="text-slate-300 leading-relaxed">
                Integrated server-side Gemini Vision API evaluates spatial quality, convolutional feature density, object classification, and preprocessing suggestions.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              Close Technical Specs
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
