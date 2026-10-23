import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EvidenceForm from './components/EvidenceForm';
import DiagnosisView from './components/DiagnosisView';
import HistorySidebar from './components/HistorySidebar';
import { 
  fetchHealth, 
  createDiagnosis, 
  fetchSessions, 
  fetchSession, 
  submitObservation, 
  recordRepair 
} from './api';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [isRecordingRepair, setIsRecordingRepair] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    loadHealth();
    loadSessions();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend health check unavailable:', err);
    }
  };

  const loadSessions = async () => {
    try {
      const list = await fetchSessions();
      setSessions(list);
    } catch (err) {
      console.warn('Failed to load sessions:', err);
    }
  };

  // Submit New Diagnostic Case
  const handleCreateCase = async (formData) => {
    setIsAnalyzing(true);
    setErrorMessage('');
    try {
      const sessionDetail = await createDiagnosis(formData);
      setActiveSession(sessionDetail);
      await loadSessions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to analyze circuit fault.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Test Observation
  const handleSubmitObservation = async (payload) => {
    if (!activeSession) return;
    setIsReevaluating(true);
    setErrorMessage('');
    try {
      const updated = await submitObservation(activeSession.id, payload);
      setActiveSession(updated);
      await loadSessions();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit test observation.');
    } finally {
      setIsReevaluating(false);
    }
  };

  // Record Repair Attempt
  const handleRecordRepair = async (payload) => {
    if (!activeSession) return;
    setIsRecordingRepair(true);
    setErrorMessage('');
    try {
      const updated = await recordRepair(activeSession.id, payload);
      setActiveSession(updated);
      await loadSessions();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to record repair verification.');
    } finally {
      setIsRecordingRepair(false);
    }
  };

  // Select Session from History
  const handleSelectSession = async (sessionId) => {
    setErrorMessage('');
    try {
      const detail = await fetchSession(sessionId);
      setActiveSession(detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to open session.');
    }
  };

  const handleNewCase = () => {
    setActiveSession(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Header
        health={health}
        onNewCase={handleNewCase}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        isHistoryOpen={isHistoryOpen}
        activeSessionCount={sessions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-xs text-rose-400 hover:text-white underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic View: Active Diagnosis or New Case Form */}
        {activeSession ? (
          <DiagnosisView
            session={activeSession}
            onSubmitObservation={handleSubmitObservation}
            onRecordRepair={handleRecordRepair}
            isReevaluating={isReevaluating}
            isRecordingRepair={isRecordingRepair}
          />
        ) : (
          <div className="space-y-6">
            {/* Hero / Value Proposition Intro */}
            <div className="text-center max-w-3xl mx-auto py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multimodal Engineering Troubleshooting & Education</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Diagnose circuits <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">scientifically</span> with Gemini.
              </h1>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Upload your circuit photo, paste your code, and describe symptoms. Receive ranked hypotheses, 
                targeted safe tests, and iterate with real observations to verify repairs.
              </p>
            </div>

            {/* Evidence Submission Form */}
            <EvidenceForm
              onSubmit={handleCreateCase}
              isLoading={isAnalyzing}
            />
          </div>
        )}
      </main>

      {/* History Slide-out Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={activeSession?.id}
        onSelectSession={handleSelectSession}
        onNewCase={handleNewCase}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a10] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">FaultForge AI</span>
            <span>•</span>
            <span>Google Gemini Hackathon (Education & Skills Track)</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Built by <span className="text-cyan-400 font-semibold">Team Glitch Mob</span> (BIT, Durg)
          </div>
        </div>
      </footer>
    </div>
  );
}
