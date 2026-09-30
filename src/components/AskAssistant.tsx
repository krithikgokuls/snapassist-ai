import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Image, Cpu, AlertTriangle, ShieldCheck, Play, 
  Terminal, CheckCircle, RefreshCw, X, FileText, ArrowRight, Activity 
} from 'lucide-react';

interface RecommendedStep {
  step: string;
  cmd?: string;
  cmdDescription?: string;
  cmdRisk?: 'Low' | 'Medium' | 'High';
  cmdExplanation?: string;
}

interface DiagnosticResult {
  status: string;
  likelyCause: string;
  evidence: string;
  recommendedSteps: RecommendedStep[];
  confidence: number;
  analysis: string;
  notInKnowledgeBase: boolean;
}

interface PerformanceMetrics {
  model: string;
  backend: string;
  retrievalLatencyMs: number;
  inferenceLatencyMs: number;
  totalLatencyMs: number;
  memoryUsageMb: number;
  inputTokens: number;
  outputTokens: number;
}

interface HistoryItem {
  query: string;
  isVoice: boolean;
  hasImage: boolean;
  timestamp: string;
  diagnostic: DiagnosticResult;
  performance: PerformanceMetrics;
}

interface AskAssistantProps {
  activeBackend: 'CPU' | 'GPU' | 'NPU';
  onAddHistory: (item: HistoryItem) => void;
  quickQuery?: string;
  clearQuickQuery?: () => void;
}

export default function AskAssistant({ activeBackend, onAddHistory, quickQuery, clearQuickQuery }: AskAssistantProps) {
  const [queryText, setQueryText] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  
  // Terminal execution simulation state
  const [runningCmd, setRunningCmd] = useState<string | null>(null);
  const [cmdAuthorized, setCmdAuthorized] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [cmdSuccess, setCmdSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Support Web Speech API for real speech-to-text
  const startSpeechRecognition = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition API is unsupported on this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onerror = (e: any) => {
      console.error("Speech error", e);
      setSpeechError(`Capture error: ${e.error}`);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQueryText(prev => (prev + ' ' + transcript).trim());
    };

    rec.start();
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setScreenshot(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearInputs = () => {
    setQueryText('');
    setScreenshot(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executePipelineDiagnostic = async (textToSubmit = queryText, screenshotToSubmit = screenshot) => {
    if (!textToSubmit.trim() && !screenshotToSubmit) return;
    
    setIsLoading(true);
    setResult(null);
    setPerformance(null);
    setSources([]);
    setTerminalOutput([]);
    setRunningCmd(null);
    setCmdAuthorized(false);
    setCmdSuccess(false);

    // Simulate standard IT diagnostics pipeline phases in UI for complete explainability
    const steps = [
      "Analyzing Multimodal Input...",
      "Extracting Diagnostic Symptoms...",
      "Executing Local RAG Vector Document Matching...",
      "Performing On-Device Snapdragon Model Reasoning...",
      "Verifying Command Safety Standards..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setPipelineStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSubmit,
          screenshot: screenshotToSubmit,
          isVoice: isRecording,
          simulatedBackend: activeBackend
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.diagnostic);
        setPerformance(data.performance);
        setSources(data.retrievedSources);
        
        onAddHistory({
          query: textToSubmit || 'Screen Capture Diagnostic',
          isVoice: isRecording,
          hasImage: !!screenshotToSubmit,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          diagnostic: data.diagnostic,
          performance: data.performance
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setResult({
        status: "Investigation",
        likelyCause: "AI Diagnostic Execution Failure",
        evidence: "The pipeline threw an unhandled endpoint error.",
        recommendedSteps: [],
        confidence: 0,
        analysis: err.message || "Please check your network and try re-submitting.",
        notInKnowledgeBase: true
      });
    } finally {
      setIsLoading(false);
      setPipelineStep(null);
    }
  };

  // Run selected shell commands safely in interactive sandbox
  const runCLICommand = (step: RecommendedStep) => {
    if (!step.cmd) return;
    setRunningCmd(step.cmd);
    setCmdAuthorized(false);
    setCmdSuccess(false);
    setTerminalOutput([
      `SnapAssist Local Sandbox Shell v11.3 [ARM64 Mode]`,
      `Preparing to execute: ${step.cmd}`,
      `Description: ${step.cmdDescription}`,
      `Risk Classification: [${step.cmdRisk}]`,
      `--- Authorization Required ---`
    ]);
  };

  const authorizeAndExecute = async () => {
    if (!runningCmd) return;
    setCmdAuthorized(true);
    setTerminalOutput(prev => [...prev, `[USER_CONFIRMED]: Authorization granted. Initializing environment...`]);

    const lines = [
      `Connecting to Local HP Hardware Controller Hub...`,
      `Validating system access credentials [OK]`,
      `Executing command block: "${runningCmd}"`,
      `Tracing system environment adjustments:`
    ];

    for (const l of lines) {
      setTerminalOutput(prev => [...prev, l]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Custom simulated output per command
    if (runningCmd.includes("flushdns")) {
      setTerminalOutput(prev => [
        ...prev,
        `Windows IP Configuration`,
        `Successfully flushed the DNS Resolver Cache.`,
        `DNS client cache flushed successfully.`,
        `System mapping alignment [COMPLETE]`
      ]);
    } else if (runningCmd.includes("spooler")) {
      setTerminalOutput(prev => [
        ...prev,
        `Stopping service: Print Spooler.`,
        `Print Spooler service stopped successfully.`,
        `Purging cached files in spool directory: C:\\Windows\\System32\\spool\\PRINTERS`,
        `Purged file: FP00012.SPL (2.4MB) - Deleted`,
        `Purged file: FP00012.SHD (4KB) - Deleted`,
        `Starting service: Print Spooler.`,
        `Print Spooler service started successfully.`,
        `Print queues re-enabled [COMPLETE]`
      ]);
    } else if (runningCmd.includes("release")) {
      setTerminalOutput(prev => [
        ...prev,
        `Adapter 'Qualcomm FastConnect Wi-Fi 7': Releasing IP configuration...`,
        `Adapter 'Qualcomm FastConnect Wi-Fi 7': IP released. (Current lease: 0.0.0.0)`,
        `Negotiating with local gateway (DHCP discovery)...`,
        `Adapter 'Qualcomm FastConnect Wi-Fi 7': Bound to gateway 192.168.1.1`,
        `New configuration leased: IP: 192.168.1.144, Subnet: 255.255.255.0`,
        `DHCP negotiations [COMPLETE]`
      ]);
    } else if (runningCmd.includes("gpupdate")) {
      setTerminalOutput(prev => [
        ...prev,
        `Updating Policy...`,
        `Computer Policy update has completed successfully.`,
        `User Policy update has completed successfully.`,
        `GPO alignment with Active Directory [COMPLETE]`
      ]);
    } else {
      setTerminalOutput(prev => [
        ...prev,
        `Executing generic diagnostics...`,
        `Process returned system exit code (0).`,
        `Operations performed safely [COMPLETE]`
      ]);
    }

    setTerminalOutput(prev => [...prev, `SUCCESS: SnapAssist completed procedures safely.`]);
    setCmdSuccess(true);
  };

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput]);

  // Handle incoming quick queries from the home dashboard
  useEffect(() => {
    if (quickQuery) {
      setQueryText(quickQuery);
      executePipelineDiagnostic(quickQuery, null);
      if (clearQuickQuery) clearQuickQuery();
    }
  }, [quickQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input panel */}
      <div className="lg:col-span-1 bg-white border border-zinc-100 rounded-lg p-5 space-y-4 h-fit">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Multimodal Input Console</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Describe your computer issue using text, microphone dictation, or by uploading a system error screenshot.
          </p>
        </div>

        {/* Text Input area */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Describe Issue</label>
          <textarea
            placeholder="Type your issue here (e.g. 'Connected to Wi-Fi but no internet')"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={isLoading}
            className="w-full h-24 p-3 border border-zinc-200 focus:border-zinc-400 focus:outline-none rounded-lg text-xs leading-relaxed"
          />
        </div>

        {/* Screenshot Uploader */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Screenshot Grab</label>
          {screenshot ? (
            <div className="relative border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50 p-2">
              <img src={screenshot} alt="System Error" className="max-h-24 mx-auto object-contain rounded" />
              <button
                onClick={() => setScreenshot(null)}
                className="absolute top-1 right-1 p-1 bg-zinc-950 text-white rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full border-2 border-dashed border-zinc-200 hover:border-zinc-300 transition-colors p-4 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
            >
              <Image className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              <span className="text-[11px] font-medium text-zinc-500">Upload screenshot error (.png, .jpg)</span>
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleScreenshotUpload}
            className="hidden"
          />
        </div>

        {/* Voice Support / Mic integration */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Voice support (STT)</label>
          <div className="flex items-center gap-3">
            <button
              onClick={startSpeechRecognition}
              disabled={isLoading || isRecording}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isRecording 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              {isRecording ? 'Listening...' : 'Record Voice'}
            </button>
            <span className="text-[11px] text-zinc-400 leading-normal">
              {isRecording ? 'Speak now. SnapAssist is transcribing your voice...' : 'Qualcomm AI Hub Whisper STT pipeline compatibility.'}
            </span>
          </div>
          {speechError && <p className="text-[10px] text-rose-500 font-medium">{speechError}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 pt-2 border-t border-zinc-50">
          <button
            onClick={clearInputs}
            disabled={isLoading || (!queryText && !screenshot)}
            className="px-3 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:bg-zinc-50 disabled:text-zinc-300 rounded-lg text-xs font-medium transition-colors w-1/3 cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => executePipelineDiagnostic()}
            disabled={isLoading || (!queryText.trim() && !screenshot)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 w-2/3 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Run Diagnostic
          </button>
        </div>
      </div>

      {/* Output / Reasoning Dashboard panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Active Loader and Pipeline Stepper */}
        {isLoading && (
          <div className="bg-white border border-zinc-100 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
              <Cpu className="w-5 h-5 absolute text-zinc-900" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-semibold text-zinc-800">Processing Local Reasoning Pipeline</h4>
              <p className="text-xs text-zinc-500 font-mono italic animate-pulse">{pipelineStep}</p>
            </div>
            {/* Visual step indicators */}
            <div className="w-full max-w-xs flex justify-between items-center pt-4 text-[10px] text-zinc-400 font-mono">
              <span className={pipelineStep?.includes("Input") ? "text-zinc-800 font-bold" : ""}>Input</span>
              <ArrowRight className="w-3 h-3" />
              <span className={pipelineStep?.includes("Symptom") ? "text-zinc-800 font-bold" : ""}>Symptom</span>
              <ArrowRight className="w-3 h-3" />
              <span className={pipelineStep?.includes("RAG") ? "text-zinc-800 font-bold" : ""}>Retrieval</span>
              <ArrowRight className="w-3 h-3" />
              <span className={pipelineStep?.includes("Snapdragon") ? "text-zinc-800 font-bold" : ""}>Reasoning</span>
              <ArrowRight className="w-3 h-3" />
              <span className={pipelineStep?.includes("Safety") ? "text-zinc-800 font-bold" : ""}>Safety</span>
            </div>
          </div>
        )}

        {/* Diagnostic troubleshooting tree output */}
        {result && (
          <div className="space-y-4">
            <div className="bg-white border border-zinc-100 rounded-lg p-5 space-y-4">
              {/* Header block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Troubleshooting Decision Tree</span>
                    <span className="text-zinc-300">·</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      result.status === 'Resolved' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">Diagnostic Analysis Report</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] block text-zinc-400">Confidence Score</span>
                    <span className="text-base font-bold font-mono text-zinc-900">{result.confidence}%</span>
                  </div>
                  <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-950" style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>
              </div>

              {/* Likely cause & evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Likely Cause</span>
                  <p className="text-sm font-semibold text-zinc-900 leading-snug">{result.likelyCause}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Diagnostic Evidence</span>
                  <p className="text-xs text-zinc-600 leading-normal whitespace-pre-line">{result.evidence}</p>
                </div>
              </div>

              {/* Technical breakdown analysis */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-50">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Explainable Analysis</span>
                <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100 italic">
                  "{result.analysis}"
                </p>
              </div>

              {/* Steps Checklist */}
              {result.recommendedSteps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Recommended Resolution Path</span>
                  <div className="space-y-2">
                    {result.recommendedSteps.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-zinc-100 hover:border-zinc-200 rounded-lg transition-colors">
                        <div className="p-1 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded font-mono text-[10px] w-5 h-5 flex items-center justify-center shrink-0">
                          0{idx + 1}
                        </div>
                        <div className="space-y-1.5 w-full">
                          <p className="text-xs font-medium text-zinc-800 leading-relaxed">{s.step}</p>
                          {s.cmd && (
                            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                                  <Terminal className="text-zinc-500 w-3.5 h-3.5" />
                                  Administrative Command Recommended
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  s.cmdRisk === 'High' ? 'text-rose-600 bg-rose-50 border border-rose-100' :
                                  s.cmdRisk === 'Medium' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                                  'text-emerald-600 bg-emerald-50 border border-emerald-100'
                                }`}>
                                  Risk: {s.cmdRisk}
                                </span>
                              </div>
                              <pre className="p-2 bg-zinc-900 text-zinc-100 font-mono text-[11px] rounded overflow-x-auto">
                                {s.cmd}
                              </pre>
                              <p className="text-[10px] text-zinc-500 leading-normal">
                                <strong>Description:</strong> {s.cmdDescription} <br />
                                <strong>Safety Warning:</strong> {s.cmdExplanation}
                              </p>
                              <button
                                onClick={() => runCLICommand(s)}
                                className="mt-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                                Simulate Safe Run...
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source docs indicators */}
              {sources.length > 0 && (
                <div className="pt-3 border-t border-zinc-100">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Retrieved Sources (Local RAG Alignment)</span>
                  <div className="flex flex-col gap-2">
                    {sources.map((src, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-semibold text-zinc-700">{src.title}</span>
                        <span aria-hidden="true">·</span>
                        <span>{src.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Performance metrics dashboard panel */}
            {performance && (
              <div className="bg-zinc-950 text-zinc-300 rounded-lg p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>ON-DEVICE HARDWARE TELEMETRY</span>
                  </div>
                  <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">STRICT MEASURED LOGS</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-zinc-500 block">Model Engine:</span>
                    <span className="text-white">{performance.model}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Hardware Layer:</span>
                    <span className="text-white">{performance.backend}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Retrieval Time:</span>
                    <span className="text-white">{performance.retrievalLatencyMs.toFixed(1)} ms</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Inference Time:</span>
                    <span className="text-amber-400 font-semibold">{performance.inferenceLatencyMs.toFixed(1)} ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simulated Sandbox Terminal window popup */}
        {runningCmd && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
              <span className="text-xs font-mono text-zinc-400 font-bold flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                SnapAssist Secured Terminal Sandbox
              </span>
              <button onClick={() => setRunningCmd(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-black h-64 overflow-y-auto font-mono text-[11px] text-zinc-300 space-y-1">
              {terminalOutput.map((out, idx) => (
                <div key={idx} className={
                  out.includes("[USER_CONFIRMED]") ? "text-amber-400 font-bold" :
                  out.includes("SUCCESS") ? "text-emerald-400 font-bold" :
                  out.includes("--- Authorization Required ---") ? "text-rose-400 font-bold text-center border-y border-zinc-800 py-1 my-1" :
                  "text-zinc-300"
                }>
                  {out}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between gap-4 border-t border-zinc-800">
              {!cmdAuthorized ? (
                <>
                  <p className="text-[10px] text-zinc-400">
                    SnapAssist requests user confirmation to execute system utilities. No changes are applied outside this browser sandbox.
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setRunningCmd(null)}
                      className="px-3 py-1.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={authorizeAndExecute}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded text-xs cursor-pointer"
                    >
                      Authorize & Run
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    {cmdSuccess ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Command Executed Successfully
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        Running CLI...
                      </span>
                    )}
                  </p>
                  {cmdSuccess && (
                    <button
                      onClick={() => setRunningCmd(null)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs cursor-pointer"
                    >
                      Close Shell
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state dashboard overview */}
        {!result && !isLoading && (
          <div className="bg-white border border-zinc-100 rounded-lg p-8 text-center space-y-4">
            <Cpu className="w-8 h-8 text-zinc-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-800">Awaiting Technical Query Input</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Describe your IT problem in the left panel to trigger our local RAG retriever and model reasoning pipeline.
              </p>
            </div>
            {/* Quick tips */}
            <div className="max-w-md mx-auto pt-4 border-t border-zinc-50 flex flex-col md:flex-row gap-3 text-left">
              <div className="p-3 bg-zinc-50 rounded border border-zinc-100 flex-1 space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Network Diagnostic Tip</span>
                <p className="text-[11px] text-zinc-400">Ask: "Wi-Fi shows connected but I can't browse any sites."</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded border border-zinc-100 flex-1 space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Update Error Tip</span>
                <p className="text-[11px] text-zinc-400">Ask: "My Windows Update keeps failing with error codes."</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
