import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Sparkles, 
  Calendar, 
  FileImage, 
  Sliders 
} from 'lucide-react';
import { ImageAnalysisData } from '../../types';
import { soundEngine } from '../../utils/audio';

interface HistoryPageProps {
  historyRecords: ImageAnalysisData[];
  onSelectRecord: (record: ImageAnalysisData) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  searchQuery?: string;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  historyRecords,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  searchQuery = '',
}) => {
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);

  const filtered = historyRecords.filter((rec) => {
    const q = localSearch.toLowerCase();
    return (
      rec.title.toLowerCase().includes(q) ||
      rec.savedPath.toLowerCase().includes(q) ||
      rec.capturedAt.toLowerCase().includes(q) ||
      rec.metrics.qualityScore.toString().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Saved Analyses History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Access previous computer vision inspection logs and export reports
          </p>
        </div>

        {historyRecords.length > 0 && (
          <button
            onClick={() => {
              soundEngine.playClick();
              if (confirm('Clear all saved analysis records?')) {
                onClearAll();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-all flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by title, quality score, or date..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-white/10 text-center space-y-3 backdrop-blur-xl">
          <FileImage className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Analysis Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {historyRecords.length === 0
              ? 'Capture or upload an image to save your first computer vision inspection report.'
              : 'No records matched your search query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4 group transition-all"
              >
                <div>
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-white/5 relative mb-3">
                    <img
                      src={record.dataUrl}
                      alt={record.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-xs font-mono font-bold text-cyan-300 border border-cyan-500/30">
                      Score: {record.metrics.qualityScore}%
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {record.title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate">
                    CapturedImages/{record.savedPath}
                  </span>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Res</span>
                      <span>{record.metrics.width}×{record.metrics.height}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Date</span>
                      <span className="truncate block">{record.capturedAt.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectRecord(record);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Analyze</span>
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onDeleteRecord(record.id);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
