import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, Camera, Upload, BarChart2, History, Settings, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDrawer: React.FC<KeyboardShortcutsDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', description: 'Trigger Instant Webcam Image Capture', icon: Camera },
    { key: 'Cmd / Ctrl + U', description: 'Jump to Image Upload & Presets', icon: Upload },
    { key: 'Cmd / Ctrl + A', description: 'Open Computer Vision Analysis Workbench', icon: BarChart2 },
    { key: 'Cmd / Ctrl + H', description: 'Open Saved Image History Gallery', icon: History },
    { key: 'Cmd / Ctrl + S', description: 'Save Analyzed Image to History', icon: Settings },
    { key: 'Cmd / Ctrl + E', description: 'Export Analysis Report', icon: BarChart2 },
    { key: 'Esc', description: 'Close Modals or Drawers', icon: X },
    { key: '?', description: 'Toggle Keyboard Shortcuts Helper', icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden"
        >
          {/* Top header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Keyboard Shortcuts</h3>
                <p className="text-xs text-slate-400">VisionLens macOS Quick Commands</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {shortcuts.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-medium">{s.description}</span>
                  </div>
                  <kbd className="px-2 py-1 text-[11px] font-mono font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-md shadow-sm">
                    {s.key}
                  </kbd>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
