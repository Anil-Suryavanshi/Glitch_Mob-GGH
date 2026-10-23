import React from 'react';
import { X, Clock, Layers, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export default function HistorySidebar({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewCase 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#0b111e]/98 border-l border-slate-800 shadow-2xl z-50 flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-fuchsia-400" />
          <h3 className="font-bold text-sm text-white">Diagnostic Sessions</h3>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {sessions.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Session Button */}
      <div className="p-3 border-b border-slate-800/80">
        <button
          onClick={() => {
            onNewCase();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Start New Diagnostic Case</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No diagnostic sessions saved yet. Start by analyzing a circuit!
          </div>
        ) : (
          sessions.map((s) => {
            const isSelected = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSession(s.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-md glow-cyan'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{s.title}</h4>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                </div>

                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                  {s.symptoms}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      Iter {s.iteration_count}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      s.status === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-400'
                        : s.status === 'REEVALUATED'
                        ? 'bg-fuchsia-950 text-fuchsia-400'
                        : 'bg-cyan-950 text-cyan-400'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
