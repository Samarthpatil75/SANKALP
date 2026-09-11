import React from 'react';
import {
  ShieldAlert,
  BarChart3,
  MapPin,
  Sliders,
  RefreshCw,
  Cpu,
  Activity,
  AlertCircle,
  History,
  FileSpreadsheet,
  ExternalLink,
  Bot,
  Sparkles,
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onRefresh, loading, onOpenAssistant }) {
  return (
    <header className="border-b border-slate-800 bg-[#07172c] text-white sticky top-0 z-40 shadow-xl">
      {/* 1. Official National Tricolor Accent Bar */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* 2. Official Government of India & MoSPI Identity Bar */}
      <div className="bg-[#040e1b] px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Ashoka Emblem Motif */}
          <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-serif font-black text-amber-300 text-xs">
              🏛️
            </div>
            <div>
              <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                भारत सरकार | GOVERNMENT OF INDIA
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI)
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Project Monitoring Division (IPM)</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Central Sector Projects (₹150 Cr & Above)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800/60 font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PAIMANA LIVE FEED
          </span>
          <span className="text-slate-400 hidden sm:inline">Quarterly Epoch: Q2-2026</span>
          <a
            href="https://paimana-proj.mospi.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline text-[10px]"
            title="Official Ministry Portal"
          >
            <span>ipm.mospi.gov.in</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* 3. Main PAIMANA + InfraSankalp Brand Header & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Logos & Acronym */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-sky-600 to-blue-800 p-0.5 shadow-md flex items-center justify-center ring-2 ring-amber-400/30 shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#091b33] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-baseline gap-1.5">
                <span>PAIMANA</span>
                <span className="text-slate-500 text-lg font-bold">•</span>
                <span className="text-amber-400 text-lg sm:text-xl font-extrabold tracking-tight">InfraSankalp</span>
                <span className="text-[12px] font-hindi text-slate-300 font-normal hidden sm:inline">(इन्फ्रासंकल्प)</span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30">
                XAI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              <strong>P</strong>roject <strong>A</strong>ssessment, <strong>I</strong>nfrastructure <strong>M</strong>onitoring, and <strong>A</strong>nalytics for <strong>NA</strong>tion-Building
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-1 bg-[#051121] p-1.5 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300/50 hover:scale-[1.02] active:scale-[0.98]"
            title="Open InfraSankalp AI Assistant Copilot"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            <span>AI Copilot</span>
            <span className="bg-slate-950/20 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-black">
              Ask
            </span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Flash Report & Map</span>
          </button>

          <button
            onClick={() => setActiveTab('historical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'historical'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>PAIMANA Past Data (2020–2026)</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'directory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>Project Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('ml-analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ml-analytics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>ML vs Rule Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Risk Simulator</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh portal data"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 ml-0.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Mandatory MoSPI Calibration & Transparency Disclosure Banner */}
      <div className="bg-amber-950/40 border-t border-b border-amber-500/30 px-4 py-1.5 text-[11px] text-amber-200/90 flex items-center justify-center text-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-300">Official MoSPI / PAIMANA Transparency Notice:</strong>{' '}
          Synthetic portfolio calibrated against published Ministry aggregate flash reports (2020–2026) — granular per-project row ledgers remain restricted under statutory departmental governance.
        </span>
      </div>
    </header>
  );
}
