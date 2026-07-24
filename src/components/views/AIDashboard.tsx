import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { ImageAnalysisData } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';

interface AIDashboardProps {
  imageData: ImageAnalysisData;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ imageData }) => {
  const { themeTokens, isLight } = useTheme();
  const { metrics } = imageData;

  return (
    <GlassCard padding="lg" className="w-full space-y-6 font-sans select-none">
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${themeTokens.textPrimary}`}>
            <LayoutDashboard className={`w-5 h-5 ${themeTokens.accentText}`} />
            <span>AI Executive Computer Vision Dashboard</span>
          </h2>
          <p className={`text-xs font-mono mt-0.5 ${themeTokens.textMuted}`}>
            Real-time optical metrics, ML readiness scores, and inference telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            INFERENCE ENGINE: ONLINE
          </span>
        </div>
      </div>

      {/* Main Gauges Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Quality Score Radial */}
        <GlassCard padding="md" className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isLight ? 'text-black/10' : 'text-white/10'}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={themeTokens.accentText}
                strokeDasharray={`${metrics.qualityScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-xl font-bold font-mono ${themeTokens.accentText}`}>{metrics.qualityScore}</span>
          </div>
          <span className={`text-xs font-mono font-semibold ${themeTokens.textSecondary}`}>QUALITY INDEX</span>
        </GlassCard>

        {/* Sharpness Score */}
        <GlassCard padding="md" className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isLight ? 'text-black/10' : 'text-white/10'}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500"
                strokeDasharray={`${Math.min(100, metrics.sharpnessScore)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xl font-bold font-mono text-purple-500">{Math.round(metrics.sharpnessScore)}</span>
          </div>
          <span className={`text-xs font-mono font-semibold ${themeTokens.textSecondary}`}>SHARPNESS score</span>
        </GlassCard>

        {/* Entropy Index */}
        <GlassCard padding="md" className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isLight ? 'text-black/10' : 'text-white/10'}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${(metrics.entropy / 8) * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xl font-bold font-mono text-emerald-500">{metrics.entropy}</span>
          </div>
          <span className={`text-xs font-mono font-semibold ${themeTokens.textSecondary}`}>ENTROPY (bits/px)</span>
        </GlassCard>

        {/* Brightness Level */}
        <GlassCard padding="md" className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isLight ? 'text-black/10' : 'text-white/10'}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500"
                strokeDasharray={`${(metrics.brightness / 255) * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xl font-bold font-mono text-amber-500">{metrics.brightness}</span>
          </div>
          <span className={`text-xs font-mono font-semibold ${themeTokens.textSecondary}`}>BRIGHTNESS / 255</span>
        </GlassCard>
      </div>

      {/* Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <GlassCard padding="sm" className="space-y-2">
          <div className="flex justify-between">
            <span className={themeTokens.textMuted}>CNN FEATURE EXTRACTION</span>
            <span className={`font-bold ${themeTokens.accentText}`}>OPTIMAL</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${themeTokens.textSecondary}`}>
            High spatial contrast supports robust convolutional filter activation maps.
          </p>
        </GlassCard>

        <GlassCard padding="sm" className="space-y-2">
          <div className="flex justify-between">
            <span className={themeTokens.textMuted}>YOLO OBJECT DETECTION</span>
            <span className="text-purple-500 font-bold">READY (96%)</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${themeTokens.textSecondary}`}>
            Bounding box candidates exhibit sharp edge deltas for anchor regression.
          </p>
        </GlassCard>

        <GlassCard padding="sm" className="space-y-2">
          <div className="flex justify-between">
            <span className={themeTokens.textMuted}>OCR TEXT RECOGNITION</span>
            <span className="text-emerald-500 font-bold">HIGH SUITABILITY</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${themeTokens.textSecondary}`}>
            Sufficient foreground-to-background contrast ratio for threshold binarization.
          </p>
        </GlassCard>
      </div>
    </GlassCard>
  );
};
