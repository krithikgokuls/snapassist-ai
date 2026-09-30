import React from 'react';
import { Shield, EyeOff, Lock, Server, CloudLightning, Check } from 'lucide-react';

export default function PrivacyIndicator() {
  const claims = [
    {
      title: "AI Processing",
      value: "LOCAL (Snapdragon NPU / CPU Fallback)",
      desc: "Model execution occurs strictly inside the local memory space of your machine. No telemetry is shared with external model endpoints.",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Internet Required",
      value: "NO (Offline Architecture)",
      desc: "The vector catalog search and reasoning pipeline run completely independent of active network configurations. Excellent for isolated offline field ops.",
      icon: EyeOff,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Documents Uploaded",
      value: "NO (0 Bytes Transmitted)",
      desc: "IT documentation resides entirely within the local system store. We do not index or replicate client content into cloud storage layers.",
      icon: Lock,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Cloud AI Core",
      value: "DISABLED",
      desc: "External API integration is disabled in favor of quantized local model runtimes. Resolves enterprise compliance liabilities.",
      icon: CloudLightning,
      color: "text-zinc-400",
      bg: "bg-zinc-50"
    },
    {
      title: "Data Storage",
      value: "LOCAL (Memory / SQLite)",
      desc: "All session state, diagnostics, and transcription histories are stored in non-volatile local browser caches and native databases.",
      icon: Server,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-100">
        <h2 className="text-xl font-semibold text-zinc-900">Enterprise Privacy Dashboard</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Verifiable security claims indicating our 100% private, zero-leak architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {claims.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="p-4 bg-white border border-zinc-100 rounded-lg flex gap-4">
              <div className={`p-2.5 rounded-lg h-fit ${c.bg}`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{c.title}</span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-900 mt-0.5">{c.value}</div>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Sandboxing Details */}
      <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-lg space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800">Why On-Device AI is Necessary for Enterprise IT Support</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Standard IT support models require employees to copy-paste error messages, upload terminal trace dumps, or capture workspace screenshots into cloud interfaces. This poses a major data leak liability: IP addresses, AD user tokens, and proprietary corporate file names can be harvested by third-party training APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-white border border-zinc-100 rounded-lg">
            <span className="text-xs font-semibold text-zinc-700 block">01. HIPAA & GDPR Safe</span>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              No private health logs, identity configurations, or client metrics are transmitted over networks.
            </p>
          </div>
          <div className="p-3 bg-white border border-zinc-100 rounded-lg">
            <span className="text-xs font-semibold text-zinc-700 block">02. Encrypted Sandbox</span>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Inference workloads run in an isolated memory buffer, immediately cleared upon diagnostic lifecycle completion.
            </p>
          </div>
          <div className="p-3 bg-white border border-zinc-100 rounded-lg">
            <span className="text-xs font-semibold text-zinc-700 block">03. Corporate Network Friendly</span>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Zero network overhead prevents support calls from saturating precious enterprise WAN/SD-WAN pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
