import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: 'system',
  glassIntensity: 'medium',
  themeWallpaper: 'mac-sonoma',
  accentColor: 'blue',
  animationSpeed: 'spring',
  cameraResolution: '1080p',
  audioFeedback: true,
  autoSaveCaptured: true,
  aiQualityMode: 'balanced',
  language: 'en',
};

export const WALLPAPER_PRESETS = {
  'mac-sonoma': {
    name: 'macOS Sonoma Blue',
    darkBg: 'from-[#0A0D14] via-[#101828] to-[#0A0D14]',
    lightBg: 'from-[#F5F5F7] via-[#E8EFFE] to-[#F5F5F7]',
    previewDark: '#101828',
    previewLight: '#e8effe',
  },
  'golden-gate': {
    name: 'Golden Gate Dusk',
    darkBg: 'from-[#0F0B0E] via-[#1F1218] to-[#0F0B0E]',
    lightBg: 'from-[#FBF5F2] via-[#FCEEE9] to-[#FBF5F2]',
    previewDark: '#1f1218',
    previewLight: '#fceee9',
  },
  'cyber-midnight': {
    name: 'Cyber Midnight',
    darkBg: 'from-[#07090E] via-[#0E1525] to-[#07090E]',
    lightBg: 'from-[#F0F4F9] via-[#E2EBF5] to-[#F0F4F9]',
    previewDark: '#0e1525',
    previewLight: '#e2ebf5',
  },
  'deep-space': {
    name: 'Deep Space Emerald',
    darkBg: 'from-[#060D0B] via-[#0D1E19] to-[#060D0B]',
    lightBg: 'from-[#F0F7F4] via-[#E1F0EB] to-[#F0F7F4]',
    previewDark: '#0d1e19',
    previewLight: '#e1f0eb',
  },
  'monterey': {
    name: 'macOS Monterey Purple',
    darkBg: 'from-[#0C0814] via-[#1A122B] to-[#0C0814]',
    lightBg: 'from-[#FAF5FF] via-[#F3E8FF] to-[#FAF5FF]',
    previewDark: '#1a122b',
    previewLight: '#f3e8ff',
  },
};

export const ACCENT_COLOR_MAP = {
  blue: {
    name: 'macOS Blue',
    hex: '#0071e3',
    text: 'text-blue-600 dark:text-blue-400',
    textHover: 'hover:text-blue-500 dark:hover:text-blue-300',
    bg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20',
    bgLightText: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
    softBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
    border: 'border-blue-500/50',
    ring: 'ring-blue-500/40',
    shadow: 'shadow-blue-500/20',
  },
  cyan: {
    name: 'Cyan Electric',
    hex: '#06b6d4',
    text: 'text-cyan-600 dark:text-cyan-400',
    textHover: 'hover:text-cyan-500 dark:hover:text-cyan-300',
    bg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm shadow-cyan-500/20',
    bgLightText: 'bg-cyan-500 text-slate-950 dark:bg-cyan-400 dark:text-slate-950',
    softBg: 'bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/20',
    border: 'border-cyan-500/50',
    ring: 'ring-cyan-500/40',
    shadow: 'shadow-cyan-500/20',
  },
  purple: {
    name: 'Purple Velvet',
    hex: '#a855f7',
    text: 'text-purple-600 dark:text-purple-400',
    textHover: 'hover:text-purple-500 dark:hover:text-purple-300',
    bg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-500/20',
    bgLightText: 'bg-purple-600 text-white dark:bg-purple-400 dark:text-slate-950',
    softBg: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/20',
    border: 'border-purple-500/50',
    ring: 'ring-purple-500/40',
    shadow: 'shadow-purple-500/20',
  },
  emerald: {
    name: 'Emerald Mint',
    hex: '#10b981',
    text: 'text-emerald-600 dark:text-emerald-400',
    textHover: 'hover:text-emerald-500 dark:hover:text-emerald-300',
    bg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
    bgLightText: 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950',
    softBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20',
    border: 'border-emerald-500/50',
    ring: 'ring-emerald-500/40',
    shadow: 'shadow-emerald-500/20',
  },
  amber: {
    name: 'Amber Solar',
    hex: '#f59e0b',
    text: 'text-amber-600 dark:text-amber-400',
    textHover: 'hover:text-amber-500 dark:hover:text-amber-300',
    bg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm shadow-amber-500/20',
    bgLightText: 'bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950',
    softBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20',
    border: 'border-amber-500/50',
    ring: 'ring-amber-500/40',
    shadow: 'shadow-amber-500/20',
  },
  rose: {
    name: 'Rose Sunset',
    hex: '#f43f5e',
    text: 'text-rose-600 dark:text-rose-400',
    textHover: 'hover:text-rose-500 dark:hover:text-rose-300',
    bg: 'bg-rose-500 hover:bg-rose-400 text-white shadow-sm shadow-rose-500/20',
    bgLightText: 'bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-950',
    softBg: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20',
    border: 'border-rose-500/50',
    ring: 'ring-rose-500/40',
    shadow: 'shadow-rose-500/20',
  },
};

export function getThemeTokens(settings: AppSettings, effectiveAppearance: 'dark' | 'light') {
  const isLight = effectiveAppearance === 'light';
  const accent = ACCENT_COLOR_MAP[settings.accentColor] || ACCENT_COLOR_MAP.blue;
  const wallpaper = WALLPAPER_PRESETS[settings.themeWallpaper] || WALLPAPER_PRESETS['mac-sonoma'];

  // Refined Apple/macOS Glass Intensity
  let blurClass = 'backdrop-blur-xl';
  let cardBgClass = isLight
    ? 'bg-white/75 shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
    : 'bg-[#121216]/75 shadow-[0_8px_32px_rgba(0,0,0,0.4)]';
  let cardBorderClass = isLight
    ? 'border border-black/[0.08]'
    : 'border border-white/[0.1]';

  if (settings.glassIntensity === 'low') {
    blurClass = 'backdrop-blur-md';
    cardBgClass = isLight
      ? 'bg-white/88 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
      : 'bg-[#18181c]/88 shadow-[0_4px_20px_rgba(0,0,0,0.3)]';
    cardBorderClass = isLight
      ? 'border border-black/[0.06]'
      : 'border border-white/[0.08]';
  } else if (settings.glassIntensity === 'high') {
    blurClass = 'backdrop-blur-2xl';
    cardBgClass = isLight
      ? 'bg-white/60 shadow-[0_8px_36px_rgba(0,0,0,0.06)]'
      : 'bg-[#0e0e12]/65 shadow-[0_12px_48px_rgba(0,0,0,0.5)]';
    cardBorderClass = isLight
      ? 'border border-black/[0.1]'
      : 'border border-white/[0.14]';
  }

  return {
    isLight,
    effectiveAppearance,
    pageBg: isLight ? wallpaper.lightBg : wallpaper.darkBg,
    cardBg: `${cardBgClass} ${blurClass}`,
    cardBorder: cardBorderClass,
    textPrimary: isLight ? 'text-[#1D1D1F]' : 'text-[#F5F5F7]',
    textSecondary: isLight ? 'text-[#6E6E73]' : 'text-[#A1A1A6]',
    textMuted: isLight ? 'text-[#86868B]' : 'text-[#6E6E73]',
    bgHover: isLight ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.06]',
    inputBg: isLight
      ? 'bg-black/[0.03] border-black/[0.1] text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:border-blue-500/80'
      : 'bg-white/[0.05] border-white/[0.12] text-[#F5F5F7] placeholder:text-[#6E6E73] focus:bg-white/[0.08] focus:border-blue-400/80',
    modalBg: isLight
      ? 'bg-white/92 text-[#1D1D1F] border-black/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.12)] backdrop-blur-3xl'
      : 'bg-[#141418]/92 text-[#F5F5F7] border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-3xl',
    popoverBg: isLight
      ? 'bg-white/95 border-black/[0.1] shadow-2xl text-[#1D1D1F] backdrop-blur-xl'
      : 'bg-[#18181c]/95 border-white/[0.12] shadow-2xl text-[#F5F5F7] backdrop-blur-xl',
    sidebarBg: isLight
      ? 'bg-[#F2F2F7]/80 border-black/[0.08] backdrop-blur-2xl'
      : 'bg-[#0E0E12]/80 border-white/[0.08] backdrop-blur-2xl',
    navbarBg: isLight
      ? 'bg-[#F5F5F7]/80 border-black/[0.08] backdrop-blur-2xl'
      : 'bg-[#0A0A0C]/80 border-white/[0.08] backdrop-blur-2xl',
    accentText: accent.text,
    accentTextHover: accent.textHover,
    accentBg: accent.bg,
    accentSoft: accent.softBg,
    accentBorder: accent.border,
    accentRing: accent.ring,
    accentShadow: accent.shadow,
    accentHex: accent.hex,
    accent: accent,
    blurClass,
  };
}
