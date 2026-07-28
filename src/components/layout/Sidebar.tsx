import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Camera, 
  Upload, 
  BarChart2, 
  History, 
  Settings, 
  Info, 
  Sparkles,
  Sliders,
  Cpu,
  Layers,
  Box,
  Columns,
  LayoutDashboard,
  BookOpen
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenAbout,
  historyCount,
}) => {
  const { themeTokens, isLight } = useTheme();

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number; category?: string }[] = [
    { id: 'home', label: 'Home Overview', icon: Home },
    { id: 'capture', label: 'Live AI Camera', icon: Camera },
    { id: 'upload', label: 'Import Dataset', icon: Upload },
    { id: 'analysis', label: 'CV Workbench', icon: BarChart2 },
    { id: 'inspector', label: 'Image Inspector', icon: Sliders },
    { id: 'cv-studio', label: 'Advanced CV Studio', icon: Cpu },
    { id: 'cnn-visualizer', label: 'CNN Neural Map', icon: Layers },
    { id: '3d-cube', label: '3D RGB Color Cube', icon: Box },
    { id: 'comparison', label: 'Image Comparison', icon: Columns },
    { id: 'dashboard', label: 'AI Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Saved History', icon: History, badge: historyCount },
    { id: 'documentation', label: 'Dev Docs & Specs', icon: BookOpen },
  ];

  return (
    <aside className={`hidden md:flex w-56 lg:w-64 xl:w-72 border-r flex-col justify-between py-6 px-3 z-30 shrink-0 transition-colors duration-500 ${themeTokens.sidebarBg} ${themeTokens.cardBorder}`}>
      {/* Navigation Links */}
      <div className="space-y-6">
        <div className="hidden md:flex items-center px-3 space-x-2">
          <Sparkles className={`w-4 h-4 ${themeTokens.accentText}`} />
          <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${themeTokens.textMuted}`}>
            Workspace
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  onTabChange(item.id);
                }}
                className={`w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all relative group ${
                  isActive
                    ? `${themeTokens.accentSoft} ${themeTokens.textPrimary} font-bold shadow-md`
                    : `${themeTokens.textSecondary} ${themeTokens.bgHover}`
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full ${themeTokens.accentBg}`}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 ${isActive ? themeTokens.accentText : themeTokens.textMuted}`} />

                <span className="hidden md:inline font-medium tracking-wide">{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`hidden md:inline-flex ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${themeTokens.accentSoft}`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                <div className={`md:hidden absolute left-full ml-2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl ${themeTokens.popoverBg}`}>
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Secondary Menu */}
      <div className={`space-y-1.5 border-t pt-4 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenSettings();
          }}
          className={`w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all group ${themeTokens.textSecondary} ${themeTokens.bgHover}`}
        >
          <Settings className={`w-4 h-4 shrink-0 ${themeTokens.textMuted} group-hover:${themeTokens.accentText}`} />
          <span className="hidden md:inline">Settings</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenAbout();
          }}
          className={`w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all group ${themeTokens.textSecondary} ${themeTokens.bgHover}`}
        >
          <Info className={`w-4 h-4 shrink-0 ${themeTokens.textMuted} group-hover:${themeTokens.accentText}`} />
          <span className="hidden md:inline">About System</span>
        </button>
      </div>
    </aside>
  );
};

