/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, Cpu, Shield, BookOpen, Clock, Award, Play, 
  HelpCircle, ChevronRight, Menu, X, Cpu as NpuIcon, CheckCircle 
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import AskAssistant from './components/AskAssistant';
import KnowledgeBaseBrowser from './components/KnowledgeBaseBrowser';
import PerformanceDashboard from './components/PerformanceDashboard';
import PrivacyIndicator from './components/PrivacyIndicator';
import PresentationDeck from './components/PresentationDeck';
import HistoryLog from './components/HistoryLog';

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

export default function App() {
  const [tab, setTab] = useState<'dashboard' | 'chat' | 'kb' | 'history' | 'performance' | 'privacy' | 'presentation'>('dashboard');
  const [activeBackend, setActiveBackend] = useState<'CPU' | 'GPU' | 'NPU'>('NPU');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [quickQuery, setQuickQuery] = useState<string | undefined>(undefined);

  const handleAddHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const handleTriggerAction = (action: 'text' | 'voice' | 'screenshot', prepopulateQuery?: string) => {
    if (prepopulateQuery) {
      setQuickQuery(prepopulateQuery);
    }
    setTab('chat');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Ask SnapAssist', icon: Cpu },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'history', label: 'Issue History', icon: Clock },
    { id: 'performance', label: 'Snapdragon Performance', icon: NpuIcon },
    { id: 'privacy', label: 'Privacy Center', icon: Shield },
    { id: 'presentation', label: 'Pitch & Slides', icon: Award }
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 select-none">
      
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 bg-white relative z-30 shrink-0">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1 hover:bg-zinc-100 rounded text-zinc-600 mr-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-zinc-950 p-1.5 rounded-lg">
              <Cpu className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-950">SnapAssist AI</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Muted Status Filters */}
        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono font-bold text-zinc-500 tracking-wider">
          <span>ARM64 NATIVE ARCHITECTURE</span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span>SNAPDRAGON® CO-PILOT PLATFORM</span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span>ENCRYPTED MEMORY SANDBOX</span>
        </div>

        {/* Zone 3: Interactive System Actions / Verification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700 rounded-md">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            System Secure
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-20 w-64 border-r border-zinc-200 bg-white flex flex-col justify-between p-4 transition-transform duration-300 transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-0 md:translate-x-0'}
          ${sidebarOpen ? 'block' : 'hidden md:flex'}
        `}>
          <div className="space-y-6">
            <div className="flex md:hidden items-center justify-between pb-4 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-500">Navigation</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-zinc-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer
                      ${isActive ? 'bg-zinc-950 text-white font-bold' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}
                    `}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Footer Widget */}
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5">
              <NpuIcon className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold text-zinc-800">Co-Pilot Core State</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Hexagon™ NPU is running locally in {activeBackend === 'NPU' ? 'Active QNN mode.' : 'fallback thread pool.'}
            </p>
          </div>
        </aside>

        {/* Content Container Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50">
          <div className="max-w-5xl mx-auto">
            {tab === 'dashboard' && (
              <Dashboard 
                onTriggerAction={handleTriggerAction} 
                activeBackend={activeBackend} 
              />
            )}
            {tab === 'chat' && (
              <AskAssistant 
                activeBackend={activeBackend} 
                onAddHistory={handleAddHistory}
                quickQuery={quickQuery}
                clearQuickQuery={() => setQuickQuery(undefined)}
              />
            )}
            {tab === 'kb' && <KnowledgeBaseBrowser />}
            {tab === 'history' && (
              <HistoryLog 
                history={history} 
                onSelectHistoryItem={(item) => {
                  setQuickQuery(item.query);
                  setTab('chat');
                }} 
              />
            )}
            {tab === 'performance' && (
              <PerformanceDashboard 
                activeBackend={activeBackend} 
                onChangeBackend={setActiveBackend} 
              />
            )}
            {tab === 'privacy' && <PrivacyIndicator />}
            {tab === 'presentation' && <PresentationDeck />}
          </div>
        </main>

      </div>
    </div>
  );
}
