import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Cpu, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface SplashScreenProps {
  onComplete: () => void;
}

const steps = [
  { text: 'Initializing Vision Engine...', icon: Eye },
  { text: 'Loading OpenCV Kernels...', icon: Cpu },
  { text: 'Initializing Gemini AI Models...', icon: Zap },
  { text: 'Preparing Computer Vision Matrix...', icon: Sparkles },
  { text: 'VisionLens Ready.', icon: CheckCircle2 },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    soundEngine.playStartupChime();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIdx = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));
    if (stepIdx !== currentStep) {
      setCurrentStep(stepIdx);
      soundEngine.playTick();
    }
  }, [progress]);

  const StepIcon = steps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-sans select-none"
    >
      {/* Ambient Neural Particle Nodes */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Animated Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-8 text-center">
        {/* Animated Logo with Laser Sweep */}
        <div className="relative mb-8 group">
          <div className="relative w-28 h-28 rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden backdrop-blur-2xl">
            {/* Glowing Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 opacity-80" />
            
            {/* Eye Icon */}
            <Eye className="w-14 h-14 text-cyan-400 z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

            {/* Scanning Laser Beam */}
            <motion.div
              animate={{ y: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] z-20"
            />
          </div>

          {/* Corner Brackets */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br" />
        </div>

        {/* Branding Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            VisionLens <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">AI</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">
            Next-Gen Computer Vision Studio
          </p>
        </motion.div>

        {/* Loading Progress Bar */}
        <div className="w-full mt-10 space-y-3">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Status Step Text */}
          <div className="h-6 flex items-center justify-center gap-2 text-xs font-mono text-cyan-300/90">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <StepIcon className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
                <span>{steps[currentStep].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 text-[10px] font-mono text-slate-500 flex items-center justify-center gap-3">
          <span>OPENCV CORE</span>
          <span>•</span>
          <span>GEMINI MULTIMODAL</span>
          <span>•</span>
          <span>NEURAL PIPELINE</span>
        </div>
      </div>
    </motion.div>
  );
};
