import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HypothesisCard({ hypothesis }) {
  const { id, rank, title, description, likelihood, confidence_score, supporting_evidence, status, status_reason } = hypothesis;

  const confidencePct = Math.round((confidence_score || 0.5) * 100);

  // Status Styling
  const renderStatusBadge = () => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Supported</span>
          </span>
        );
      case 'WEAKENED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-400">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>Weakened</span>
          </span>
        );
      case 'ELIMINATED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 line-through">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Eliminated</span>
          </span>
        );
      case 'UNRESOLVED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-400">
            <Minus className="w-3 h-3 text-amber-400" />
            <span>Unresolved</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
            <span>Rank #{rank}</span>
          </span>
        );
    }
  };

  // Likelihood Badge
  const likelihoodColor = {
    HIGH: 'text-rose-400 border-rose-800/80 bg-rose-950/40',
    MEDIUM: 'text-amber-400 border-amber-800/80 bg-amber-950/40',
    LOW: 'text-slate-400 border-slate-700 bg-slate-900/40',
  }[likelihood] || 'text-cyan-400 border-cyan-800 bg-cyan-950/40';

  return (
    <div className={`rounded-xl border p-5 transition-all ${
      rank === 1
        ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg glow-cyan'
        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
    }`}>
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-xs font-mono font-bold text-cyan-400 border border-slate-700">
            #{rank}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
            <span className="text-[10px] font-mono text-slate-500">{id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderStatusBadge()}
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${likelihoodColor}`}>
            {likelihood}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
        {description}
      </p>

      {/* Status Reason / Delta Callout if available */}
      {status_reason && (
        <div className="mt-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-cyan-300 font-mono">
          <span className="text-slate-400 font-sans">Observation impact:</span> {status_reason}
        </div>
      )}

      {/* Confidence Meter */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
          <span className="text-slate-400">Model Confidence</span>
          <span className="text-cyan-400 font-bold">{confidencePct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              confidencePct >= 70
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                : confidencePct >= 40
                ? 'bg-gradient-to-r from-cyan-500 to-amber-400'
                : 'bg-slate-500'
            }`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Supporting Evidence Chips */}
      {supporting_evidence?.length > 0 && (
        <div className="mt-3.5 space-y-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Supporting Evidence:
          </span>
          <div className="space-y-1">
            {supporting_evidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
