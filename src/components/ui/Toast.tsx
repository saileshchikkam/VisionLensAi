import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { NotificationItem } from '../../types';

interface ToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 left-3 md:left-auto z-50 flex flex-col space-y-3 max-w-sm w-[calc(100vw-1.5rem)] md:w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          let Icon = Info;
          let iconColor = 'text-cyan-400';
          let borderColor = 'border-cyan-500/30';
          let glowColor = 'shadow-[0_0_20px_rgba(6,182,212,0.2)]';

          if (n.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
            borderColor = 'border-emerald-500/30';
            glowColor = 'shadow-[0_0_20px_rgba(16,185,129,0.2)]';
          } else if (n.type === 'warning') {
            Icon = AlertCircle;
            iconColor = 'text-amber-400';
            borderColor = 'border-amber-500/30';
            glowColor = 'shadow-[0_0_20px_rgba(245,158,11,0.2)]';
          } else if (n.type === 'error') {
            Icon = XCircle;
            iconColor = 'text-rose-400';
            borderColor = 'border-rose-500/30';
            glowColor = 'shadow-[0_0_20px_rgba(244,63,94,0.2)]';
          }

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`pointer-events-auto p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border ${borderColor} ${glowColor} text-slate-100 flex items-start space-x-3 relative overflow-hidden`}
            >
              <div className="pt-0.5 shrink-0">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>

              <div className="flex-1 pr-4">
                <h4 className="text-sm font-semibold text-white tracking-wide">{n.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
              </div>

              <button
                onClick={() => onDismiss(n.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
