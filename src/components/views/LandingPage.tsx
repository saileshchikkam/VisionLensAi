import React from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Zap, 
  Cpu, 
  ArrowRight, 
  Eye, 
  Sliders 
} from 'lucide-react';
import { NavigationTab, SamplePreset } from '../../types';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAbout: () => void;
  onSelectPreset: (preset: SamplePreset) => void;
  samplePresets: SamplePreset[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAbout,
  onSelectPreset,
  samplePresets,
}) => {
  const { themeTokens, isLight } = useTheme();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-y-auto px-6 py-10 max-w-7xl mx-auto space-y-16 select-none">
      {/* Background Subtle Ambient Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 ${isLight ? 'bg-blue-200/30' : 'bg-blue-600/10'} blur-3xl pointer-events-none rounded-full`} />

      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-6">
        {/* Top macOS Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border shadow-sm ${themeTokens.accentSoft}`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${themeTokens.accentText} animate-spin`} style={{ animationDuration: '6s' }} />
          <span>Next-Generation Computer Vision Architecture</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight ${themeTokens.textPrimary}`}>
            Smart Image Acquisition & <br />
            <span className={themeTokens.accentText}>
              Information System
            </span>
          </h1>
          <p className={`max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-normal ${themeTokens.textSecondary}`}>
            Computer Vision powered image analysis workspace engineered for high-precision spatial inspection, color distribution, and neural vision synthesis.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Button
            variant="primary"
            size="lg"
            icon={Camera}
            onClick={() => onNavigate('capture')}
          >
            Capture Image
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon={Upload}
            onClick={() => onNavigate('upload')}
          >
            Upload Image
          </Button>

          <Button
            variant="ghost"
            size="lg"
            icon={Eye}
            onClick={onOpenAbout}
          >
            Documentation
          </Button>
        </motion.div>
      </section>

      {/* Floating Glass Showcase Panels */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="interactive" padding="lg" className="group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${themeTokens.accentSoft}`}>
            <Cpu className={`w-6 h-6 ${themeTokens.accentText}`} />
          </div>
          <h3 className={`text-base font-bold mb-1.5 ${themeTokens.textPrimary}`}>Pixel Math & Spatial CV</h3>
          <p className={`text-xs leading-relaxed ${themeTokens.textSecondary}`}>
            Real-time Laplacian sharpness variance, Shannon entropy, noise floor estimation, and RGB intensity distribution.
          </p>
        </GlassCard>

        <GlassCard variant="interactive" padding="lg" className="group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${themeTokens.accentSoft}`}>
            <Sparkles className={`w-6 h-6 ${themeTokens.accentText}`} />
          </div>
          <h3 className={`text-base font-bold mb-1.5 ${themeTokens.textPrimary}`}>Gemini Multimodal Vision</h3>
          <p className={`text-xs leading-relaxed ${themeTokens.textSecondary}`}>
            Automated image understanding, convolutional suitability ratings, edge recommendations, and scene classification.
          </p>
        </GlassCard>

        <GlassCard variant="interactive" padding="lg" className="group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${themeTokens.accentSoft}`}>
            <Sliders className={`w-6 h-6 ${themeTokens.accentText}`} />
          </div>
          <h3 className={`text-base font-bold mb-1.5 ${themeTokens.textPrimary}`}>Interactive Filter Studio</h3>
          <p className={`text-xs leading-relaxed ${themeTokens.textSecondary}`}>
            Canny edge detection, Sobel magnitude gradients, Gaussian blur kernels, binary thresholding, and channel isolation.
          </p>
        </GlassCard>
      </section>

      {/* Preset Demo Library - Instant 1-Click Testing */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${themeTokens.textPrimary}`}>Demo Image Presets</h2>
            <p className={`text-xs ${themeTokens.textMuted}`}>Select any pre-configured high-resolution dataset to launch analysis instantly</p>
          </div>
          <span className={`text-xs font-mono font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full ${themeTokens.accentSoft}`}>
            <Zap className="w-3.5 h-3.5" /> 1-Click Launch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {samplePresets.map((preset) => (
            <GlassCard
              key={preset.id}
              variant="interactive"
              padding="sm"
              onClick={() => {
                soundEngine.playClick();
                onSelectPreset(preset);
              }}
              className="group"
            >
              <div className={`w-full h-36 rounded-xl overflow-hidden relative mb-3 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-white/10'}`}>
                <img
                  src={preset.dataUrl}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold backdrop-blur-md border ${themeTokens.accentSoft}`}>
                  {preset.category}
                </div>
              </div>

              <h3 className={`text-sm font-bold group-hover:${themeTokens.accentTextHover} transition-colors ${themeTokens.textPrimary}`}>
                {preset.title}
              </h3>
              <p className={`text-xs mt-1 line-clamp-2 ${themeTokens.textSecondary}`}>
                {preset.description}
              </p>

              <div className={`mt-3 flex items-center justify-between text-xs font-semibold pt-2.5 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.08]'} ${themeTokens.accentText}`}>
                <span>Analyze Preset</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
};
