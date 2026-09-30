import React from 'react';
import { 
  Mic, Image, Edit3, Wifi, Printer, AlertTriangle, 
  HelpCircle, RefreshCw, Cpu, ShieldCheck 
} from 'lucide-react';

interface DashboardProps {
  onTriggerAction: (action: 'text' | 'voice' | 'screenshot', prepopulateQuery?: string) => void;
  activeBackend: 'CPU' | 'GPU' | 'NPU';
}

export default function Dashboard({ onTriggerAction, activeBackend }: DashboardProps) {
  const quickFixes = [
    {
      title: "Wi-Fi Connectivity Issue",
      desc: "Connected to local Wi-Fi but external sites fail to open.",
      query: "My laptop is connected to Wi-Fi but websites are not opening.",
      icon: Wifi,
      category: "Network troubleshooting"
    },
    {
      title: "Print Spooler Error",
      desc: "HP Smart Printer shows offline or documents frozen in queue.",
      query: "HP printer is offline and jobs are stuck in queue with deleting status.",
      icon: Printer,
      category: "Printer troubleshooting"
    },
    {
      title: "Windows Update Freeze",
      desc: "Patch installs hanging at 0% with active error codes.",
      query: "Windows Update fails to install patches and shows error code 0x80240020.",
      icon: RefreshCw,
      category: "Windows Update troubleshooting"
    },
    {
      title: "AD Trust Relationship Failure",
      desc: "Workstation cannot authenticate against corporate Domain Controller.",
      query: "Trust relationship between workstation and primary domain failed on domain login.",
      icon: AlertTriangle,
      category: "Basic Active Directory concepts"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 bg-zinc-950 text-white rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[180px]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="space-y-1.5 relative z-10">
          <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">Qualcomm® Snapdragon® Native IT Companion</span>
          <h1 className="text-2xl font-bold tracking-tight">How can I help you today?</h1>
          <p className="text-zinc-400 text-xs max-w-xl">
            Diagnose technical system faults, repair driver metrics, and configure local routing protocols privately on-device.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4 text-xs font-mono text-zinc-400 relative z-10">
          <div className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            <span>Active: {activeBackend === 'NPU' ? 'Snapdragon® Hexagon™ NPU' : activeBackend === 'GPU' ? 'Qualcomm® Adreno™ GPU' : 'ARM64 Client CPU'}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Enterprise Sandbox Enabled</span>
          </div>
        </div>
      </div>

      {/* Main Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onTriggerAction('voice')}
          className="p-5 bg-white border border-zinc-100 hover:border-zinc-300 transition-all rounded-lg text-left space-y-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-zinc-50 rounded-lg w-fit group-hover:bg-zinc-100 transition-colors">
            <Mic className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Speak Issue</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-normal">
              Dictate your symptom natively. Transcribes local Whisper parameters on-device.
            </p>
          </div>
        </button>

        <button
          onClick={() => onTriggerAction('screenshot')}
          className="p-5 bg-white border border-zinc-100 hover:border-zinc-300 transition-all rounded-lg text-left space-y-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-zinc-50 rounded-lg w-fit group-hover:bg-zinc-100 transition-colors">
            <Image className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Analyze Screenshot</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-normal">
              Grab a screenshot of error codes. Local ViT OCR identifies system faults instantly.
            </p>
          </div>
        </button>

        <button
          onClick={() => onTriggerAction('text')}
          className="p-5 bg-white border border-zinc-100 hover:border-zinc-300 transition-all rounded-lg text-left space-y-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-zinc-50 rounded-lg w-fit group-hover:bg-zinc-100 transition-colors">
            <Edit3 className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Ask Question</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-normal">
              Type custom questions to match local document segments via offline vector matching.
            </p>
          </div>
        </button>
      </div>

      {/* Demo Scenarios / Recent Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Immediate Demo Scenarios</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Click any case below to trigger the entire diagnostic pipeline instantly.</p>
          </div>
          <HelpCircle className="w-4 h-4 text-zinc-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickFixes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onTriggerAction('text', item.query)}
                className="p-4 bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-all rounded-lg text-left flex gap-4 cursor-pointer group"
              >
                <div className="p-2.5 bg-zinc-50 group-hover:bg-white rounded-lg h-fit border border-zinc-100">
                  <Icon className="w-4 h-4 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  {/* Clean unboxed category metadata */}
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{item.category}</span>
                  <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-950">{item.title}</h4>
                  <p className="text-xs text-zinc-400 leading-normal">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
