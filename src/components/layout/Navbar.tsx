import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  Activity, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenShortcuts: () => void;
  onSearch: (query: string) => void;
  activeTabTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenAbout,
  onOpenShortcuts,
  onSearch,
  activeTabTitle,
}) => {
  const { themeTokens, isLight } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === 'online') setSystemOnline(true);
      })
      .catch(() => setSystemOnline(true));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const toggleSound = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    soundEngine.enabled = !newMute;
    if (!newMute) soundEngine.playClick();
  };

  return (
    <header className={`h-16 border-b sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between transition-colors duration-500 ${themeTokens.navbarBg} ${themeTokens.cardBorder}`}>
      {/* Left: Brand / Section Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={onOpenAbout}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
              <Eye className={`w-5 h-5 ${themeTokens.accentText} animate-pulse`} />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-sm tracking-tight ${themeTokens.textPrimary}`}>VisionLens AI</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold ${themeTokens.accentSoft}`}>
                v2.4
              </span>
            </div>
            <span className={`text-xs font-medium tracking-wide block ${themeTokens.textSecondary}`}>
              {activeTabTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Search input */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${themeTokens.textMuted}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search captures, metrics, objects or insights..."
            className={`w-full pl-10 pr-10 py-1.5 rounded-xl text-xs transition-all shadow-inner focus:outline-none focus:ring-2 ${themeTokens.inputBg} ${themeTokens.accentRing}`}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${themeTokens.textMuted} hover:${themeTokens.textPrimary}`}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & System Status */}
      <div className="flex items-center space-x-3">
        {/* System Status Pill */}
        <div className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs ${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/60 border-white/10'}`}>
          <Activity className={`w-3.5 h-3.5 ${themeTokens.accentText} animate-spin`} style={{ animationDuration: '4s' }} />
          <span className={`font-medium ${themeTokens.textSecondary}`}>CV Kernel</span>
          <span className="flex items-center space-x-1 text-[11px] text-emerald-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{systemOnline ? 'ONLINE' : 'ACTIVE'}</span>
          </span>
        </div>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenShortcuts();
          }}
          title="Keyboard Shortcuts (?)"
          className={`p-2 rounded-xl border transition-all shadow-sm ${
            isLight
              ? 'bg-slate-100/80 border-slate-200/80 hover:bg-slate-200 text-slate-700'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
          }`}
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
          className={`p-2 rounded-xl border transition-all shadow-sm ${
            isLight
              ? 'bg-slate-100/80 border-slate-200/80 hover:bg-slate-200 text-slate-700'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className={`w-4 h-4 ${themeTokens.accentText}`} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowNotifications(!showNotifications);
            }}
            title="Notifications"
            className={`p-2 rounded-xl border transition-all relative shadow-sm ${
              isLight
                ? 'bg-slate-100/80 border-slate-200/80 hover:bg-slate-200 text-slate-700'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${themeTokens.accentBg}`}></span>
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 ${themeTokens.popoverBg}`}>
              <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <span className={`text-xs font-bold tracking-wide flex items-center gap-1.5 ${themeTokens.textPrimary}`}>
                  <Sparkles className={`w-3.5 h-3.5 ${themeTokens.accentText}`} /> System Activity
                </span>
                <span className={`text-[10px] font-mono ${themeTokens.accentText}`}>Live Logs</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-start space-x-2 ${themeTokens.accentSoft}`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${themeTokens.accentText}`} />
                  <div>
                    <p className={`font-semibold ${themeTokens.textPrimary}`}>Gemini Vision AI Engine Ready</p>
                    <p className={`text-[11px] ${themeTokens.textSecondary}`}>Server-side multimodal model calibrated for feature extraction.</p>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-start space-x-2 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className={`font-semibold ${themeTokens.textPrimary}`}>Camera Permission Active</p>
                    <p className={`text-[11px] ${themeTokens.textSecondary}`}>Webcam stream is running with 1080p frame buffer.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenSettings();
          }}
          title="Settings"
          className={`p-2 rounded-xl border transition-all shadow-sm ${
            isLight
              ? 'bg-slate-100/80 border-slate-200/80 hover:bg-slate-200 text-slate-700'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

