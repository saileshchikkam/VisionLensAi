import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';

interface MLAnalysisPanelProps {
  isAnalyzing: boolean;
  onAnalysisComplete: () => void;
}

export const MLAnalysisPanel: React.FC<MLAnalysisPanelProps> = ({
  isAnalyzing,
  onAnalysisComplete,
}) => {
  const { themeTokens, isLight } = useTheme();
  const [progress, setProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    'Decoding Spatial Pixel Matrix (Width x Height)',
    'sRGB Color Space Conversion & Luminance Mapping',
    'Laplacian Matrix Kernel Convolution (Sharpness Variance)',
    'Edge Extraction & Noise Floor Estimation',
    'Shannon Entropy & RGB Histogram Binning',
    'Gemini Vision Multimodal Neural Synthesis',
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(100);
      return;
    }

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    const currentStageIdx = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));
    setActiveStage(currentStageIdx);

    if (progress >= 100 && isAnalyzing) {
      soundEngine.playScanChime();
      onAnalysisComplete();
    }
  }, [progress, stages.length, isAnalyzing, onAnalysisComplete]);

  return (
    <GlassCard padding="lg" className="space-y-6 select-none">
      {/* Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-black/10' : 'border-white/10'}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl ${themeTokens.accentSoft}`}>
            <Cpu className={`w-5 h-5 animate-pulse ${themeTokens.accentText}`} />
          </div>
          <div>
            <h3 className={`text-base font-bold tracking-wide ${themeTokens.textPrimary}`}>Computer Vision ML Pipeline</h3>
            <p className={`text-xs ${themeTokens.textMuted}`}>Real-Time Algorithmic Analysis & Neural Extraction</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className={`font-bold ${themeTokens.accentText}`}>{progress}%</span>
          {progress < 100 ? (
            <Loader2 className={`w-4 h-4 animate-spin ${themeTokens.accentText}`} />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${isLight ? 'bg-black/5 border-black/10' : 'bg-black/40 border-white/10'}`}>
        <motion.div
          className={`h-full rounded-full ${themeTokens.accent.bg}`}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {/* Pipeline Stage List */}
      <div className="space-y-2.5">
        {stages.map((stageText, idx) => {
          const isDone = idx < activeStage || progress === 100;
          const isCurrent = idx === activeStage && progress < 100;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                isCurrent
                  ? `${themeTokens.accentSoft} ${themeTokens.accentBorder} font-bold`
                  : isDone
                  ? isLight ? 'bg-black/[0.02] border-black/[0.05]' : 'bg-white/[0.04] border-white/[0.06]'
                  : isLight ? 'bg-black/[0.01] border-transparent text-slate-400 opacity-60' : 'bg-black/[0.2] border-transparent text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-5 h-5 rounded-lg border flex items-center justify-center font-mono text-[10px] ${isLight ? 'bg-white border-black/10 text-slate-600' : 'bg-black/60 border-white/10 text-slate-400'}`}>
                  0{idx + 1}
                </span>
                <span className={`font-medium tracking-wide ${isCurrent ? themeTokens.accentText : isDone ? themeTokens.textPrimary : themeTokens.textMuted}`}>{stageText}</span>
              </div>

              <div>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {isCurrent && <Loader2 className={`w-4 h-4 animate-spin ${themeTokens.accentText}`} />}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
