import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Sparkles,
  Sliders,
  Volume2,
  Video,
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  CheckCircle2,
  Zap,
  Cpu,
  Globe,
  HardDrive,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { AppSettings } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ACCENT_COLOR_MAP, WALLPAPER_PRESETS } from '../../utils/themeTokens';
import { soundEngine } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

type SettingsSection = 'appearance' | 'glass' | 'audio' | 'ai';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { settings, applySettings, restoreDefaults, isLight, themeTokens } = useTheme();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Synchronize local settings with global theme whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setIsSaved(false);
      setShowResetConfirm(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const updateField = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    soundEngine.playClick();
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    // Realtime live preview update
    applySettings(updated);
  };

  const handleApply = () => {
    soundEngine.playStartupChime();
    applySettings(localSettings);
    setIsSaved(true);
    onShowToast('System Settings Applied', 'All visual and hardware configurations updated globally.', 'success');
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  const handleRestoreDefaults = () => {
    soundEngine.playScanChime();
    restoreDefaults();
    setLocalSettings(useTheme().settings);
    setShowResetConfirm(false);
    onShowToast('Factory Reset Complete', 'System settings restored to macOS default parameters.', 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans ${themeTokens.modalBg}`}
        >
          {/* Top Title Bar (macOS Sonoma System Settings style) */}
          <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200/80 bg-slate-100/70' : 'border-white/10 bg-slate-950/60'}`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl ${themeTokens.accentSoft}`}>
                <Settings className={`w-5 h-5 ${themeTokens.accentText}`} />
              </div>
              <div>
                <h2 className={`text-base font-bold ${themeTokens.textPrimary}`}>System Settings & Aesthetics</h2>
                <p className={`text-xs ${themeTokens.textSecondary}`}>
                  Configure macOS global theme parameters, glass intensity, and AI hardware
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isLight
                    ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Defaults</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isLight ? 'hover:bg-slate-200/80 text-slate-500' : 'hover:bg-white/10 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body: macOS Settings Side Navigation + Content Pane */}
          <div className="flex flex-1 overflow-hidden min-h-[460px]">
            {/* Sidebar Navigation */}
            <div className={`w-56 p-3 border-r flex flex-col space-y-1 select-none ${isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-white/10 bg-slate-950/40'}`}>
              {[
                { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
                { id: 'glass', label: 'Glass & Wallpapers', icon: Sliders },
                { id: 'audio', label: 'Audio & Hardware', icon: Volume2 },
                { id: 'ai', label: 'AI Engine & Locale', icon: Cpu },
              ].map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveSection(section.id as SettingsSection);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? `${themeTokens.accentBg} shadow-md`
                        : `${themeTokens.textSecondary} ${themeTokens.bgHover}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}

              {/* Live Preview Card Widget */}
              <div className="mt-auto pt-4">
                <div className={`p-3.5 rounded-2xl border ${themeTokens.cardBg} ${themeTokens.cardBorder} space-y-2`}>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={themeTokens.textPrimary}>Glass Preview</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono capitalize ${themeTokens.accentSoft}`}>
                      {localSettings.glassIntensity}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${themeTokens.accentBg}`} style={{ width: '75%' }} />
                  </div>
                  <p className={`text-[10px] ${themeTokens.textMuted}`}>
                    {localSettings.appearance.toUpperCase()} MODE ACTIVE
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* SECTION 1: APPEARANCE */}
              {activeSection === 'appearance' && (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* Appearance Switcher */}
                  <div className="space-y-3">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      System Appearance Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Deep slate glass canvas' },
                        { id: 'light', label: 'Light Mode', icon: Sun, desc: 'macOS Sonoma frosted light' },
                        { id: 'system', label: 'Auto System', icon: Laptop, desc: 'Match OS dark/light' },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = localSettings.appearance === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => updateField('appearance', mode.id as any)}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all relative ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft} ring-2 ${themeTokens.accentRing}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <Icon className={`w-5 h-5 ${isSelected ? themeTokens.accentText : themeTokens.textSecondary}`} />
                              {isSelected && <Check className={`w-4 h-4 ${themeTokens.accentText}`} />}
                            </div>
                            <div>
                              <span className={`text-xs font-bold block ${themeTokens.textPrimary}`}>{mode.label}</span>
                              <span className={`text-[10px] ${themeTokens.textMuted}`}>{mode.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accent Color Palette */}
                  <div className="space-y-3 pt-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      Accent Color Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(ACCENT_COLOR_MAP).map(([key, color]) => {
                        const isSelected = localSettings.accentColor === key;
                        return (
                          <button
                            key={key}
                            onClick={() => updateField('accentColor', key as any)}
                            className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all ${
                              isSelected
                                ? `border-slate-400 dark:border-white/40 ring-2 ${color.ring} ${isLight ? 'bg-slate-100' : 'bg-white/10'}`
                                : `${isLight ? 'bg-slate-100/60 border-slate-200 hover:bg-slate-200/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full shadow-md flex items-center justify-center shrink-0"
                              style={{ backgroundColor: color.hex }}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </span>
                            <span className={`text-xs font-bold ${themeTokens.textPrimary}`}>{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION 2: GLASS & WALLPAPERS */}
              {activeSection === 'glass' && (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* Ambient Wallpaper Selection */}
                  <div className="space-y-3">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      Ambient Wallpaper Canvas
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(WALLPAPER_PRESETS).map(([key, wall]) => {
                        const isSelected = localSettings.themeWallpaper === key;
                        return (
                          <button
                            key={key}
                            onClick={() => updateField('themeWallpaper', key as any)}
                            className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft} ring-2 ${themeTokens.accentRing}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`
                            }`}
                          >
                            <div
                              className="w-10 h-10 rounded-xl shadow-inner border border-white/20 shrink-0"
                              style={{
                                background: isLight ? `linear-gradient(135deg, ${wall.previewLight}, #ffffff)` : `linear-gradient(135deg, ${wall.previewDark}, #000000)`,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-bold block truncate ${themeTokens.textPrimary}`}>{wall.name}</span>
                              <span className={`text-[10px] block ${themeTokens.textMuted}`}>Light & Dark Adaptive</span>
                            </div>
                            {isSelected && <CheckCircle2 className={`w-4 h-4 ${themeTokens.accentText}`} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Glass Intensity Selector */}
                  <div className="space-y-3 pt-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      Glassmorphism Backdrop Blur
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'low', name: 'Low (8px)', desc: 'Clear glass visibility' },
                        { id: 'medium', name: 'Medium (16px)', desc: 'Balanced macOS frost' },
                        { id: 'high', name: 'High (30px)', desc: 'Heavy Sonoma frosted' },
                      ].map((glass) => {
                        const isSelected = localSettings.glassIntensity === glass.id;
                        return (
                          <button
                            key={glass.id}
                            onClick={() => updateField('glassIntensity', glass.id as any)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft} ring-2 ${themeTokens.accentRing}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`
                            }`}
                          >
                            <span className={`text-xs font-bold block ${themeTokens.textPrimary}`}>{glass.name}</span>
                            <span className={`text-[10px] block ${themeTokens.textMuted}`}>{glass.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Animation Motion Easing */}
                  <div className="space-y-3 pt-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      UI Transition Easing & Motion
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'snappy', name: 'Snappy (200ms)' },
                        { id: 'spring', name: 'Spring Physics' },
                        { id: 'cinematic', name: 'Cinematic (700ms)' },
                      ].map((speed) => {
                        const isSelected = localSettings.animationSpeed === speed.id;
                        return (
                          <button
                            key={speed.id}
                            onClick={() => updateField('animationSpeed', speed.id as any)}
                            className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/5'}`
                            }`}
                          >
                            <span className={themeTokens.textPrimary}>{speed.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION 3: AUDIO & HARDWARE */}
              {activeSection === 'audio' && (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  {/* Audio Feedback */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center space-x-3">
                      <Volume2 className={`w-5 h-5 ${themeTokens.accentText}`} />
                      <div>
                        <span className={`font-bold text-xs block ${themeTokens.textPrimary}`}>Synthesized Audio Feedback</span>
                        <span className={`text-[11px] ${themeTokens.textSecondary}`}>Camera shutter clicks, scanner chimes & UI ticks</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.audioFeedback}
                      onChange={(e) => updateField('audioFeedback', e.target.checked)}
                      className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Camera Hardware Resolution */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      Webcam Hardware Acquisition Target
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: '720p', name: '720p HD', desc: 'Standard webcam feed' },
                        { id: '1080p', name: '1080p Full HD', desc: 'High sharpness & OCR' },
                        { id: '4k', name: '4K Ultra HD', desc: 'Max spatial resolution' },
                      ].map((res) => {
                        const isSelected = localSettings.cameraResolution === res.id;
                        return (
                          <button
                            key={res.id}
                            onClick={() => updateField('cameraResolution', res.id as any)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/5'}`
                            }`}
                          >
                            <span className={`text-xs font-bold block ${themeTokens.textPrimary}`}>{res.name}</span>
                            <span className={`text-[10px] block ${themeTokens.textMuted}`}>{res.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auto-Save Captured Images */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center space-x-3">
                      <HardDrive className={`w-5 h-5 ${themeTokens.accentText}`} />
                      <div>
                        <span className={`font-bold text-xs block ${themeTokens.textPrimary}`}>Auto-Save Image Captures</span>
                        <span className={`text-[11px] ${themeTokens.textSecondary}`}>Automatically store acquired images in history</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.autoSaveCaptured}
                      onChange={(e) => updateField('autoSaveCaptured', e.target.checked)}
                      className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}

              {/* SECTION 4: AI ENGINE & LOCALE */}
              {activeSection === 'ai' && (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  {/* AI Inference Mode */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      Gemini Vision Inference Engine Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'fast', name: 'Fast Latency', desc: 'Quick spatial analysis' },
                        { id: 'balanced', name: 'Balanced', desc: 'Optimal OCR & YOLO' },
                        { id: 'deep', name: 'Deep Vision', desc: 'Max ML readiness detail' },
                      ].map((mode) => {
                        const isSelected = localSettings.aiQualityMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => updateField('aiQualityMode', mode.id as any)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/5'}`
                            }`}
                          >
                            <span className={`text-xs font-bold block ${themeTokens.textPrimary}`}>{mode.name}</span>
                            <span className={`text-[10px] block ${themeTokens.textMuted}`}>{mode.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* UI Language Selection */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeTokens.textSecondary}`}>
                      Application Interface Language
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { id: 'en', name: 'English (US)' },
                        { id: 'es', name: 'Español' },
                        { id: 'ja', name: '日本語 (Japanese)' },
                        { id: 'de', name: 'Deutsch' },
                        { id: 'fr', name: 'Français' },
                      ].map((lang) => {
                        const isSelected = localSettings.language === lang.id;
                        return (
                          <button
                            key={lang.id}
                            onClick={() => updateField('language', lang.id as any)}
                            className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                              isSelected
                                ? `${themeTokens.accentBorder} ${themeTokens.accentSoft}`
                                : `${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-white/5 border-white/5'}`
                            }`}
                          >
                            <span className={themeTokens.textPrimary}>{lang.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer Bar: Action Buttons */}
          <div className={`p-4 border-t flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-100/80' : 'border-white/10 bg-slate-950/80'}`}>
            <span className={`text-xs font-mono ${themeTokens.textMuted}`}>
              Changes apply globally in real-time
            </span>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-200'
                    : 'border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center space-x-1.5 ${themeTokens.accentBg}`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{isSaved ? 'Applied!' : 'Apply Settings'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog for Restore Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`p-6 rounded-3xl max-w-sm w-full border space-y-4 font-sans ${themeTokens.modalBg}`}>
            <div className="flex items-center space-x-3 text-amber-500">
              <ShieldAlert className="w-6 h-6" />
              <h3 className={`text-base font-bold ${themeTokens.textPrimary}`}>Restore System Defaults?</h3>
            </div>
            <p className={`text-xs ${themeTokens.textSecondary}`}>
              This will reset all theme wallpapers, light/dark appearance, audio feedback, and hardware parameters to initial factory defaults.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isLight ? 'border-slate-300 text-slate-700' : 'border-white/10 text-slate-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-400"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
