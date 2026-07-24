import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Code, Cpu, Layers, GitBranch, Terminal, BookOpen, CheckCircle2, Download } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'arch' | 'python' | 'api' | 'components'>('arch');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>VisionLens AI Architecture & Developer Documentation</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Production engineering specs, OpenCV Python equivalents, and component tree
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-mono hover:bg-slate-700 transition-all"
          >
            Close Document
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/60 px-6 font-mono text-xs gap-4">
          <button
            onClick={() => setActiveSubTab('arch')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'arch' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            1. System Architecture
          </button>
          <button
            onClick={() => setActiveSubTab('python')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'python' ? 'border-purple-400 text-purple-300 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            2. OpenCV Python Code Specs
          </button>
          <button
            onClick={() => setActiveSubTab('api')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'api' ? 'border-emerald-400 text-emerald-300 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            3. Server API Reference
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          {activeSubTab === 'arch' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">
                Full-Stack Pipeline Architecture
              </h3>

              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-2 text-slate-300">
                <p>Client Browser (React 19 + HTML5 Canvas)</p>
                <p className="text-cyan-400">├── Frame Acquisition & WebRTC Stream</p>
                <p className="text-purple-400">├── High-Performance CV Kernel Transformations (FAST, Harris, ORB)</p>
                <p className="text-emerald-400">├── Three.js 3D Spatial RGB Matrix</p>
                <p className="text-amber-400">└── Express / Gemini 3.6 Multimodal AI Proxy Server (/api/vision/analyze)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-slate-500">RUNTIME ENVIRONMENT</span>
                  <p className="text-slate-200 font-bold">Node.js ES Module + Express + Vite + Tailwind</p>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-slate-500">AI MULTIMODAL MODEL</span>
                  <p className="text-slate-200 font-bold">Gemini 3.6 Flash Vision SDK</p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'python' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-purple-300 uppercase tracking-wider">
                OpenCV Python Production Code Equivalency
              </h3>

              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                <p className="text-slate-500"># Equivalent OpenCV Python Implementation</p>
                <p><span className="text-purple-400">import</span> cv2</p>
                <p><span className="text-purple-400">import</span> numpy <span className="text-purple-400">as</span> np</p>
                <br />
                <p>image = cv2.imread(<span className="text-emerald-300">'input.jpg'</span>)</p>
                <p>gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)</p>
                <br />
                <p><span className="text-slate-500"># 1. FAST Corner Detection</span></p>
                <p>fast = cv2.FastFeatureDetector_create(threshold=30)</p>
                <p>keypoints = fast.detect(gray, None)</p>
                <p>fast_image = cv2.drawKeypoints(image, keypoints, None, color=(255,0,0))</p>
                <br />
                <p><span className="text-slate-500"># 2. ORB Keypoint & Descriptor Extraction</span></p>
                <p>orb = cv2.ORB_create(nfeatures=500)</p>
                <p>kp, des = orb.detectAndCompute(gray, None)</p>
                <br />
                <p><span className="text-slate-500"># 3. Laplacian Variance Sharpness Score</span></p>
                <p>sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()</p>
              </div>
            </div>
          )}

          {activeSubTab === 'api' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-emerald-300 uppercase tracking-wider">
                Backend Express API Specifications
              </h3>

              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">POST</span>
                  <span className="ml-2 font-bold text-slate-200">/api/vision/analyze</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Proxies image base64 payload securely to Google Gemini Multimodal Vision API, returning structured JSON metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
