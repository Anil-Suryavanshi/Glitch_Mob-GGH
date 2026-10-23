import React from 'react';
import { Cpu, Zap, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Header({ health, onNewCase, onToggleHistory, isHistoryOpen, activeSessionCount }) {
  const isHealthy = health?.status === 'healthy';
  const isGeminiActive = health?.gemini_configured;

  return (
    <header className="border-b border-slate-800 bg-[#0b111e]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Team Identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewCase}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-600 p-[1px] glow-cyan">
            <div className="w-full h-full bg-[#0a0e17] rounded-[7px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                FaultForge AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-mono">
                MVP v1.0
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>Google Gemini Hackathon</span>
              <span>•</span>
              <span className="text-fuchsia-400 font-medium">Glitch Mob (BIT Durg)</span>
            </div>
          </div>
        </div>

        {/* System Health Indicators & Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Health Pills */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-slate-300">API:</span>
              <span className={isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
                {isHealthy ? 'Online' : 'Degraded'}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">AI:</span>
              <span className={isGeminiActive ? 'text-cyan-400' : 'text-amber-400'}>
                {isGeminiActive ? (health?.gemini_model || 'Gemini 2.5') : 'Demo Mode'}
              </span>
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={onToggleHistory}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isHistoryOpen
                ? 'bg-fuchsia-950/70 text-fuchsia-300 border border-fuchsia-700'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="View past diagnostic sessions"
          >
            <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>History</span>
            {activeSessionCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                {activeSessionCount}
              </span>
            )}
          </button>

          {/* New Case Button */}
          <button
            onClick={onNewCase}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>New Case</span>
          </button>
        </div>
      </div>
    </header>
  );
}
