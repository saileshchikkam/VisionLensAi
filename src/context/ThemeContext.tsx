import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS, getThemeTokens } from '../utils/themeTokens';
import { soundEngine } from '../utils/audio';

interface ThemeContextType {
  settings: AppSettings;
  effectiveAppearance: 'dark' | 'light';
  isLight: boolean;
  themeTokens: ReturnType<typeof getThemeTokens>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  applySettings: (newSettings: AppSettings) => void;
  restoreDefaults: () => void;
}

const STORAGE_KEY = 'visionlens_app_settings_v3';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen for OS system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveAppearance: 'dark' | 'light' =
    settings.appearance === 'system'
      ? systemIsDark ? 'dark' : 'light'
      : settings.appearance;

  const isLight = effectiveAppearance === 'light';

  // Apply root document class & data attribute dynamically
  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }

    const themeTokens = getThemeTokens(settings, effectiveAppearance);
    root.style.setProperty('--color-accent', themeTokens.accentHex);
    
    soundEngine.enabled = settings.audioFeedback;
  }, [settings, effectiveAppearance, isLight]);

  const applySettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
      }
      return next;
    });
  }, []);

  const restoreDefaults = useCallback(() => {
    applySettings(DEFAULT_SETTINGS);
  }, [applySettings]);

  const themeTokens = getThemeTokens(settings, effectiveAppearance);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        effectiveAppearance,
        isLight,
        themeTokens,
        updateSettings,
        applySettings,
        restoreDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
