import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight, 
  Activity, 
  FlaskConical, 
  FileCode, 
  Clock,
  Layers,
  Send
} from 'lucide-react';
import HypothesisCard from './HypothesisCard';
import RepairSection from './RepairSection';

export default function DiagnosisView({ 
  session, 
  onSubmitObservation, 
  onRecordRepair, 
  isReevaluating, 
  isRecordingRepair 
}) {
  const [userObservation, setUserObservation] = useState('');
  const [conductedTest, setConductedTest] = useState('');

  const latestSnapshot = session?.latest_snapshot;
  const isDemoFallback = latestSnapshot?.is_demo_fallback;
  const iteration = latestSnapshot?.iteration_number || 1;
  const hypotheses = latestSnapshot?.hypotheses || [];

  // Preset Observations for quick mentor demonstration
  const handleQuickObservation = (text) => {
    setUserObservation(text);
    if (!conductedTest) {
      setConductedTest(latestSnapshot?.recommended_test || 'Tested LED orientation and pin voltage');
    }
  };

  const handleObservationSubmit = async (e) => {
    e.preventDefault();
    if (!userObservation.trim()) return;

    await onSubmitObservation({
      userObservation,
      recommendedTest: conductedTest || latestSnapshot?.recommended_test,
      hypothesisId: hypotheses[0]?.id || 'H1',
    });

    setUserObservation('');
  };

  return (
    <div className="space-y-6">
      {/* Session Title & Metadata Header */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Session ID: {session?.id?.slice(0, 8)}...
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                Iteration {iteration}
              </span>
              {isDemoFallback ? (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 font-bold">
                  DEMO SAMPLE DATA (No API Key Configured)
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-700 text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Powered by Google Gemini</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {session?.title || 'Circuit Diagnostic Session'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Started {new Date(session?.created_at).toLocaleTimeString()} • {session?.symptoms}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              session?.status === 'RESOLVED'
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : session?.status === 'REEVALUATED'
                ? 'bg-fuchsia-950 border-fuchsia-600 text-fuchsia-300'
                : 'bg-cyan-950 border-cyan-700 text-cyan-300'
            }`}>
              Status: {session?.status}
            </span>
          </div>
        </div>

        {/* Safety Warning Banner if present */}
        {latestSnapshot?.safety_warning && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/60 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-300 block">Safety Advisory:</span>
              <p className="text-xs text-amber-200/90 leading-relaxed mt-0.5">
                {latestSnapshot.safety_warning}
              </p>
            </div>
          </div>
        )}

        {/* Delta Explanation Banner (When Iteration > 1) */}
        {latestSnapshot?.delta_explanation && iteration > 1 && (
          <div className="mt-4 p-4 rounded-xl bg-fuchsia-950/40 border border-fuchsia-700/60 flex items-start gap-3">
            <Activity className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-fuchsia-300 block uppercase tracking-wider">
                Hypothesis Reevaluation Delta (Iteration {iteration}):
              </span>
              <p className="text-xs text-fuchsia-100 leading-relaxed mt-1">
                {latestSnapshot.delta_explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Problem Summary & Ranked Hypotheses Section */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              <span>Ranked Fault Hypotheses</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulated from multimodal evidence analysis and ordered by likelihood.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {hypotheses.length} Hypotheses Formulated
          </span>
        </div>

        {/* Problem Summary Box */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <span className="font-semibold text-cyan-400">Problem Summary:</span> {latestSnapshot?.summary}
        </div>

        {/* Cards Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hypotheses.map((hypo) => (
            <HypothesisCard key={hypo.id || hypo.rank} hypothesis={hypo} />
          ))}
        </div>
      </div>

      {/* Recommended Diagnostic Test Card */}
      <div className="bg-[#0f172a]/90 border border-cyan-500/50 rounded-2xl p-6 backdrop-blur-md shadow-xl glow-cyan">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Recommended Safe Diagnostic Test</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
                Actionable Verification
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-cyan-300 leading-relaxed">
              {latestSnapshot?.recommended_test}
            </p>

            {/* Expected Observation */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Expected Observation to Distinguish Faults:
              </span>
              <p className="text-xs text-slate-200">
                {latestSnapshot?.expected_observation}
              </p>
            </div>

            {/* Additional Checks if any */}
            {latestSnapshot?.additional_checks?.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Additional Secondary Checks:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                  {latestSnapshot.additional_checks.map((chk, i) => (
                    <li key={i}>{chk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evidence-Based Observation Submission & Reevaluation Console */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 text-fuchsia-400 ${isReevaluating ? 'animate-spin' : ''}`} />
              <span>Submit Test Observation & Reevaluate</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Report the empirical measurement or visual result of your test to refine hypotheses.
            </p>
          </div>

          <span className="text-xs font-mono text-fuchsia-400">
            Iterative Diagnostic Loop
          </span>
        </div>

        {/* Quick Observation Demo Presets */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Mentor Demo Observations:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickObservation("Reversed LED legs on breadboard: LED remains dark; measured 0V at pin 13 with multimeter.")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
            >
              "Reversed LED: Still dark, 0V at Pin 13"
            </button>
            <button
              type="button"
              onClick={() => handleQuickObservation("Measured voltage between digital pin 13 and GND: reads 0.0V continuously.")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
            >
              "Measured pin voltage: reads 0.0V"
            </button>
            <button
              type="button"
              onClick={() => handleQuickObservation("Checked ground jumper continuity: ground rail connects properly to Arduino GND.")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
            >
              "GND continuity confirmed"
            </button>
          </div>
        </div>

        <form onSubmit={handleObservationSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Conducted Test (Optional)
            </label>
            <input
              type="text"
              value={conductedTest}
              onChange={(e) => setConductedTest(e.target.value)}
              placeholder={latestSnapshot?.recommended_test || "Describe the test performed"}
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Your Observed Result / Measurement <span className="text-fuchsia-400">*</span>
            </label>
            <textarea
              rows={3}
              value={userObservation}
              onChange={(e) => setUserObservation(e.target.value)}
              placeholder="E.g., Swapped LED orientation on the breadboard, but LED still did not illuminate. Multimeter on Pin 13 measures 0.0V."
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Gemini will re-score hypotheses and identify supported/weakened causes.
            </span>

            <button
              type="submit"
              disabled={isReevaluating || !userObservation.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white hover:from-fuchsia-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md glow-magenta transition-all"
            >
              {isReevaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reevaluating Hypotheses...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Observation & Update Ranks</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Repair Verification Closure Section */}
      <RepairSection
        session={session}
        onRecordRepair={onRecordRepair}
        isLoading={isRecordingRepair}
      />
    </div>
  );
}
