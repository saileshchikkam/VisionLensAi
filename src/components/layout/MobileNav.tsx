import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Camera, 
  Upload, 
  BarChart2, 
  History, 
  Menu, 
  X, 
  Settings, 
  Info, 
  Sliders, 
  Cpu, 
  Layers, 
  Box, 
  Columns, 
  LayoutDashboard, 
  BookOpen, 
  Keyboard,
  Eye,
  Sparkles
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';

interface MobileNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenShortcuts: () => void;
  historyCount: number;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenAbout,
  onOpenShortcuts,
  historyCount,
  isDrawerOpen,
  onToggleDrawer,
  onCloseDrawer,
}) => {
  const { themeTokens, isLight } = useTheme();

  const allNavItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
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

  const primaryMobileTabs: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'upload', label: 'Import', icon: Upload },
    { id: 'analysis', label: 'Workbench', icon: BarChart2 },
    { id: 'history', label: 'History', icon: History, badge: historyCount },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t px-3 flex items-center justify-around backdrop-blur-2xl transition-colors duration-500 select-none ${themeTokens.navbarBg} ${themeTokens.cardBorder}`}>
        {primaryMobileTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                onTabChange(tab.id);
                onCloseDrawer();
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] relative transition-colors ${
                isActive ? themeTokens.accentText : themeTokens.textMuted
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className={`absolute -top-1.5 w-1.5 h-1.5 rounded-full ${themeTokens.accentBg}`}
                />
              )}
            </button>
          );
        })}

        {/* Center Floating Action Button (FAB) for Camera Acquisition */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            onClick={() => {
              soundEngine.playCameraShutter();
              onTabChange('capture');
              onCloseDrawer();
            }}
            aria-label="Quick Camera Snap"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[2px] shadow-xl shadow-cyan-500/30 active:scale-95 transition-transform flex items-center justify-center"
          >
            <div className={`w-full h-full rounded-full flex items-center justify-center ${activeTab === 'capture' ? 'bg-cyan-500 text-slate-950' : isLight ? 'bg-white text-cyan-600' : 'bg-slate-950 text-cyan-400'}`}>
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
          </button>
        </div>

        {primaryMobileTabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                onTabChange(tab.id);
                onCloseDrawer();
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] relative transition-colors ${
                isActive ? themeTokens.accentText : themeTokens.textMuted
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-mono font-bold ${themeTokens.accentBg} text-slate-950`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className={`absolute -top-1.5 w-1.5 h-1.5 rounded-full ${themeTokens.accentBg}`}
                />
              )}
            </button>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleDrawer();
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
            isDrawerOpen ? themeTokens.accentText : themeTokens.textMuted
          }`}
        >
          {isDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Full Mobile Drawer Overlay (Animated Side Sheet) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseDrawer}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Drawer Content Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`relative w-[85vw] max-w-sm h-full flex flex-col justify-between p-6 shadow-2xl backdrop-blur-3xl overflow-y-auto select-none ${themeTokens.sidebarBg} ${themeTokens.cardBorder}`}
            >
              {/* Drawer Top Bar */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${themeTokens.textPrimary}`}>VisionLens Workspace</h3>
                      <p className={`text-[11px] ${themeTokens.textMuted}`}>12 Computer Vision Modules</p>
                    </div>
                  </div>

                  <button
                    onClick={onCloseDrawer}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* All Navigation Links */}
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono block px-2 mb-2 ${themeTokens.textMuted}`}>
                    Navigation Tabs
                  </span>

                  {allNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          soundEngine.playClick();
                          onTabChange(item.id);
                          onCloseDrawer();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                          isActive
                            ? `${themeTokens.accentSoft} ${themeTokens.textPrimary} font-bold shadow-sm`
                            : `${themeTokens.textSecondary} ${themeTokens.bgHover}`
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? themeTokens.accentText : themeTokens.textMuted}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${themeTokens.accentSoft}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenSettings();
                    onCloseDrawer();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-semibold min-h-[44px] ${themeTokens.textSecondary} ${themeTokens.bgHover}`}
                >
                  <Settings className={`w-4 h-4 ${themeTokens.textMuted}`} />
                  <span>System Settings</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenShortcuts();
                    onCloseDrawer();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-semibold min-h-[44px] ${themeTokens.textSecondary} ${themeTokens.bgHover}`}
                >
                  <Keyboard className={`w-4 h-4 ${themeTokens.textMuted}`} />
                  <span>Keyboard Shortcuts</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAbout();
                    onCloseDrawer();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-semibold min-h-[44px] ${themeTokens.textSecondary} ${themeTokens.bgHover}`}
                >
                  <Info className={`w-4 h-4 ${themeTokens.textMuted}`} />
                  <span>About Architecture</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
