import React, { useState, useRef } from 'react';
import { Upload, FileCode, Shield, Sparkles, Image as ImageIcon, X, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function EvidenceForm({ onSubmit, isLoading }) {
  const [symptoms, setSymptoms] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Preset Mentor Demo Scenario
  const handleLoadSampleScenario = () => {
    setSymptoms("Arduino Uno digital output to red 5mm LED circuit on breadboard does not light up at all.");
    setExpectedBehavior("LED connected through 220-ohm resistor to pin 13 should blink at 1Hz (1 second on, 1 second off).");
    setActualBehavior("The LED stays completely dark continuously. Power LED on Arduino is on.");
    setSourceCode(`// Arduino Uno LED Blink Circuit
const int LED_PIN = 12; // Configured pin in code

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}`);
    setErrorMsg('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8 MB limit.');
      return;
    }

    setErrorMsg('');
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setErrorMsg('Please describe the problem or symptoms before analyzing.');
      return;
    }
    setErrorMsg('');
    onSubmit({
      symptoms,
      expectedBehavior,
      actualBehavior,
      sourceCode,
      imageFile,
    });
  };

  return (
    <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Form Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Multimodal Diagnostic Case Submission</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide observed symptoms, source code, and an optional circuit photo for Gemini reasoning.
          </p>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleLoadSampleScenario}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 transition-all hover:scale-[1.02] shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Load Arduino LED Demo</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Symptoms / Problem Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Problem Description / Observed Symptoms <span className="text-cyan-400">*</span>
          </label>
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="E.g., Arduino Uno pin 13 LED circuit does not illuminate. Power LED is lit, but output stays dark."
            className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            required
          />
        </div>

        {/* Expected vs Actual Behavior Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Expected Behavior (Optional)
            </label>
            <input
              type="text"
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="E.g., LED blinks once per second at 1Hz"
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Actual Behavior (Optional)
            </label>
            <input
              type="text"
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              placeholder="E.g., LED stays completely dark"
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Source Code Box */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <FileCode className="w-4 h-4 text-fuchsia-400" />
              <span>Firmware / Source Code (Optional)</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">C++ / Arduino / Python</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070b12]">
            <div className="flex items-center px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block mr-1.5" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block mr-1.5" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block mr-3" />
              <span>sketch.ino</span>
            </div>
            <textarea
              rows={5}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="// Paste your Arduino sketch or embedded script here..."
              className="w-full bg-transparent px-4 py-3 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none resize-y"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Circuit Photograph Upload */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Circuit / Breadboard Photograph (Optional, Max 8MB)</span>
          </label>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-cyan-600 rounded-xl p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/40 transition-all group"
            >
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto transition-colors" />
              <p className="text-xs font-medium text-slate-300 mt-2">
                Click or drag circuit photograph here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports JPG, PNG, WEBP (Clear breadboard wiring, jumpers, or microcontroller pinouts)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-xl border border-cyan-800/80 bg-slate-950 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Circuit preview"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {imageFile?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(1)} KB • {imageFile?.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Educational Safety Banner */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">Educational Safety Note:</span> Designed for safe low-voltage electronics (&lt;24V DC). Never connect or probe exposed AC mains wiring.
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !symptoms.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 text-slate-950 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg glow-cyan transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Multimodal Gemini Reasoning in Progress...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Analyze Fault & Generate Ranked Diagnosis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
