import React, { useState } from 'react';
import { Wrench, CheckCircle2, XCircle, HelpCircle, Save, Check } from 'lucide-react';

export default function RepairSection({ session, onRecordRepair, isLoading }) {
  const [repairDescription, setRepairDescription] = useState('');
  const [observedBehavior, setObservedBehavior] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('VERIFIED_RESOLVED');
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const latestRepair = session?.repairs?.[session.repairs.length - 1];
  const isResolved = session?.status === 'RESOLVED' || latestRepair?.verification_status === 'VERIFIED_RESOLVED';

  const handlePreFillFix = () => {
    setRepairDescription("Corrected sketch source code: updated pinMode and digitalWrite pin from 12 to 13 to match physical breadboard wiring.");
    setObservedBehavior("Upon re-flashing sketch, the LED now blinks steadily at 1Hz as expected.");
    setVerificationStatus('VERIFIED_RESOLVED');
    setNotes("Problem verified as resolved after firmware fix.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repairDescription.trim() || !observedBehavior.trim()) return;

    await onRecordRepair({
      repairDescription,
      observedBehavior,
      verificationStatus,
      notes,
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
      isResolved
        ? 'bg-[#061814]/90 border-emerald-500/60 shadow-xl glow-emerald'
        : 'bg-[#0f172a]/90 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isResolved ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-cyan-400'}`}>
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Repair Attempt & Verification Closure</span>
              {isResolved && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono">
                  Verified Resolved
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Record physical circuit or code adjustments and document user-verified behavior.
            </p>
          </div>
        </div>

        {!isResolved && (
          <button
            type="button"
            onClick={handlePreFillFix}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60 transition-colors self-start sm:self-auto"
          >
            Pre-fill Arduino Pin Fix
          </button>
        )}
      </div>

      {/* Resolution Badge if already resolved */}
      {isResolved && latestRepair && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/70 text-emerald-200">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Circuit Operation Verified & Resolved</span>
          </div>
          <div className="mt-2 text-xs space-y-1">
            <p><span className="text-emerald-400 font-semibold">Repair Applied:</span> {latestRepair.repair_description}</p>
            <p><span className="text-emerald-400 font-semibold">Observed Outcome:</span> {latestRepair.observed_behavior}</p>
          </div>
        </div>
      )}

      {/* Repair Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Repair Action Taken
          </label>
          <input
            type="text"
            value={repairDescription}
            onChange={(e) => setRepairDescription(e.target.value)}
            placeholder="E.g., Reseated loose jumper wire into pin 13 header / fixed pin assignment in code"
            className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Post-Repair Observed Behavior
          </label>
          <input
            type="text"
            value={observedBehavior}
            onChange={(e) => setObservedBehavior(e.target.value)}
            placeholder="E.g., LED now blinks continuously every 1s as intended"
            className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {/* Verification Status Radio Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Verification Outcome
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setVerificationStatus('VERIFIED_RESOLVED')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                verificationStatus === 'VERIFIED_RESOLVED'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Resolved</span>
            </button>

            <button
              type="button"
              onClick={() => setVerificationStatus('UNRESOLVED')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                verificationStatus === 'UNRESOLVED'
                  ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Unresolved</span>
            </button>

            <button
              type="button"
              onClick={() => setVerificationStatus('INCONCLUSIVE')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                verificationStatus === 'INCONCLUSIVE'
                  ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Inconclusive</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading || !repairDescription.trim() || !observedBehavior.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Record Verification Status</span>
          </button>

          {showSuccessToast && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Repair outcome recorded!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
