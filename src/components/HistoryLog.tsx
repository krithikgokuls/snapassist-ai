import React from 'react';
import { Clock, Cpu, ShieldCheck, ChevronRight, FileText, CheckCircle } from 'lucide-react';

interface RecommendedStep {
  step: string;
  cmd?: string;
}

interface DiagnosticResult {
  status: string;
  likelyCause: string;
  evidence: string;
  recommendedSteps: RecommendedStep[];
  confidence: number;
  analysis: string;
}

interface PerformanceMetrics {
  model: string;
  backend: string;
  totalLatencyMs: number;
}

interface HistoryItem {
  query: string;
  isVoice: boolean;
  hasImage: boolean;
  timestamp: string;
  diagnostic: DiagnosticResult;
  performance: PerformanceMetrics;
}

interface HistoryLogProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export default function HistoryLog({ history, onSelectHistoryItem }: HistoryLogProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-100">
        <h2 className="text-xl font-semibold text-zinc-900">Troubleshooting History</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Review and audit previous technical diagnostics compiled during the active sandboxed session.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center bg-zinc-50 border border-zinc-100 rounded-lg space-y-2">
          <Clock className="w-8 h-8 text-zinc-300 mx-auto" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-zinc-700">No session history recorded yet</h4>
            <p className="text-[11px] text-zinc-400">Run a diagnostic in 'Ask SnapAssist' to populate the local session ledger.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div 
              key={index}
              className="p-4 bg-white border border-zinc-100 hover:border-zinc-200 transition-colors rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                  <span>{item.timestamp}</span>
                  <span>·</span>
                  <span>{item.diagnostic.status}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Encrypted Logs
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 leading-snug">"{item.query}"</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-800">Diagnosis:</span>
                  <span>{item.diagnostic.likelyCause}</span>
                  <span aria-hidden="true" className="text-zinc-300">·</span>
                  <span className="font-mono text-[10px] bg-zinc-50 px-1.5 py-0.5 border border-zinc-100 rounded text-zinc-600">
                    {item.performance.backend} ({item.performance.totalLatencyMs.toFixed(0)}ms)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Report
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
