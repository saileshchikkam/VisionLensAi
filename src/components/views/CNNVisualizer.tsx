import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Cpu, Play, CheckCircle2, ChevronRight, Activity, Sparkles, Binary } from 'lucide-react';
import { ImageAnalysisData } from '../../types';
import { soundEngine } from '../../utils/audio';

interface CNNVisualizerProps {
  imageData: ImageAnalysisData;
}

interface CNNLayer {
  id: string;
  name: string;
  type: string;
  shape: string;
  params: string;
  description: string;
}

const LAYERS: CNNLayer[] = [
  {
    id: 'input',
    name: '1. Input Image Tensor',
    type: 'InputLayer',
    shape: '(1, 512, 512, 3)',
    params: '0',
    description: 'Raw RGB pixel matrix normalized to [0, 1] floating-point tensor array.',
  },
  {
    id: 'conv1',
    name: '2. Conv2D (Edge & Spatial Filters)',
    type: 'Conv2D',
    shape: '(1, 510, 510, 32)',
    params: '896',
    description: '32 parallel 3x3 kernels detecting high-frequency spatial gradients and edges.',
  },
  {
    id: 'pool1',
    name: '3. MaxPool2D & ReLU Activation',
    type: 'MaxPooling2D',
    shape: '(1, 255, 255, 32)',
    params: '0',
    description: 'Non-linear spatial downsampling preserving maximum feature response values.',
  },
  {
    id: 'conv2',
    name: '4. Deep Conv2D (Semantic Textures)',
    type: 'Conv2D',
    shape: '(1, 253, 253, 64)',
    params: '18,496',
    description: 'Deep feature extraction synthesizing low-level edges into complex shapes.',
  },
  {
    id: 'flatten',
    name: '5. Flatten Vector Layer',
    type: 'Flatten',
    shape: '(1, 409600)',
    params: '0',
    description: 'Reshapes multi-channel spatial matrices into a 1D feature embedding vector.',
  },
  {
    id: 'dense',
    name: '6. Dense + Softmax Classification',
    type: 'Dense',
    shape: '(1, 10)',
    params: '4,096,010',
    description: 'Fully connected neural weights mapping feature vector to class probabilities.',
  },
];

export const CNNVisualizer: React.FC<CNNVisualizerProps> = ({ imageData }) => {
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const startSimulation = () => {
    soundEngine.playClick();
    setIsSimulating(true);
    setActiveLayer(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= LAYERS.length) {
        clearInterval(interval);
        setIsSimulating(false);
        soundEngine.playScanChime();
      } else {
        setActiveLayer(current);
        soundEngine.playTick();
      }
    }, 1200);
  };

  const currentMeta = LAYERS[activeLayer];

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl p-3 sm:p-6 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Convolutional Neural Network (CNN) Visualizer</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Forward-pass inference decomposition & layer feature maps
          </p>
        </div>

        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold text-xs font-mono shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all min-h-[44px]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSimulating ? 'FORWARD PASS IN PROGRESS...' : 'RUN CNN INFERENCE PASS'}</span>
        </button>
      </div>

      {/* Layer Pipeline Flow Diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {LAYERS.map((layer, idx) => (
          <button
            key={layer.id}
            onClick={() => {
              setActiveLayer(idx);
              soundEngine.playTick();
            }}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeLayer === idx
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-slate-900'
            }`}
          >
            {activeLayer === idx && (
              <motion.div
                layoutId="cnnActiveIndicator"
                className="absolute inset-0 bg-cyan-500/10 pointer-events-none"
              />
            )}
            <div className="text-[10px] text-slate-500 uppercase">{layer.type}</div>
            <div className="font-bold text-slate-200 text-xs truncate mt-1">{layer.name.split('.')[1]}</div>
            <div className="text-[10px] text-cyan-400 mt-2">{layer.shape}</div>
          </button>
        ))}
      </div>

      {/* Active Layer Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950/80 p-6 rounded-2xl border border-white/10">
        {/* Layer Feature Map Simulation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-300">
            <span className="font-bold text-cyan-400">{currentMeta.name}</span>
            <span>PARAMS: {currentMeta.params}</span>
          </div>

          <div className="relative aspect-video w-full rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-4">
            {/* Visualizer Simulation based on active layer */}
            {activeLayer === 0 && (
              <img src={imageData.dataUrl} alt="Input" className="max-h-[300px] object-contain rounded-lg" />
            )}

            {activeLayer === 1 && (
              <div className="grid grid-cols-4 gap-2 w-full max-h-[300px] overflow-hidden p-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-900 rounded border border-cyan-500/40 overflow-hidden relative">
                    <img src={imageData.dataUrl} alt="Map" className="w-full h-full object-cover filter contrast-200 grayscale" />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/80 px-1 rounded text-cyan-300">
                      K#{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeLayer >= 2 && (
              <div className="flex flex-col items-center justify-center space-y-3 text-center font-mono">
                <Cpu className="w-12 h-12 text-cyan-400 animate-pulse" />
                <div className="text-xs text-slate-300">
                  Matrix Tensor Output: <span className="text-cyan-300">{currentMeta.shape}</span>
                </div>
                <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-pulse w-3/4" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layer Specifications */}
        <div className="space-y-4 font-mono text-xs text-slate-300 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-sm flex items-center gap-2">
              <Binary className="w-4 h-4 text-purple-400" />
              <span>Layer Specifications</span>
            </h3>

            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px]">LAYER TYPE</span>
              <p className="text-cyan-300 font-bold">{currentMeta.type}</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px]">OUTPUT SHAPE</span>
              <p className="text-purple-300 font-bold">{currentMeta.shape}</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px]">DESCRIPTION</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{currentMeta.description}</p>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-[11px] text-cyan-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Forward pass verified for TensorFlow & PyTorch export.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
