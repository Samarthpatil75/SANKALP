import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Building2,
  FileText,
  MapPin,
  TrendingUp,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Inspect project INFR-RT0002',
  'What are the top critical high-risk projects?',
  'Why are infrastructure projects delayed in India?',
  'Tell me about Maharashtra infrastructure portfolio',
  'Show projects with highest cost overruns',
  'Compare Road Transport vs Railway projects',
];

export default function AIAssistantModal({ isOpen, onClose, onSelectProject }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `### 🏛️ Welcome to **InfraSankalp AI Copilot**\n\nI am your intelligent assistant for monitoring India's **Central Sector Infrastructure Projects** (calibrated against MoSPI PAIMANA reports).\n\nYou can query me to:\n- 📋 **Retrieve any Project Dossier** by ID (e.g. \`INFR-RT0002\`) or project name\n- ⚠️ **Explain risk attributions** and root-cause clearance bottlenecks\n- 📍 **Analyze state portfolios** (e.g. *Maharashtra*, *Uttar Pradesh*, *Gujarat*)\n- 🏗️ **Review sector escalations** (*Roads*, *Railways*, *Power*, *Petroleum*)\n- 🛑 **Inspect statutory MoSPI delay causes** (Land acquisition, Forest clearances, Contractor distress)`,
      relevant_projects: [],
      suggested_followups: [
        'Inspect project INFR-RT0002',
        'Top 5 critical high-risk projects',
        'Why are projects delayed in India?',
      ],
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const q = (textToSend || query).trim();
    if (!q || loading) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('https://infrasankalp-api.onrender.com/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botMsg = {
        sender: 'assistant',
        text: data.response || 'No response generated.',
        relevant_projects: data.relevant_projects || [],
        suggested_followups: data.suggested_followups || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ **Request Error**: Unable to process query right now. Please check your connectivity or try asking with a specific Project ID like \`INFR-RT0002\`.`,
          relevant_projects: [],
          suggested_followups: ['Inspect project INFR-RT0002', 'Show all high-risk projects'],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        sender: 'assistant',
        text: `### 🏛️ InfraSankalp Assistant Reset\n\nHow can I help you analyze national infrastructure projects today? You can search by project name, project ID, state, sector, or root-cause delays.`,
        relevant_projects: [],
        suggested_followups: [
          'Inspect project INFR-RT0002',
          'What are the top critical high-risk projects?',
          'Why are infrastructure projects delayed in India?',
        ],
        timestamp: new Date(),
      },
    ]);
  };

  // Simple Markdown-to-HTML parser for rich executive briefings
  const renderMarkdown = (md) => {
    if (!md) return null;

    const lines = md.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 my-2 text-slate-200">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3
            key={idx}
            className="text-base font-bold text-amber-300 mt-3 mb-1 border-b border-slate-700/50 pb-1"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('### ', '')) }}
          />
        );
      } else if (trimmed.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4
            key={idx}
            className="text-sm font-semibold text-sky-300 mt-2 mb-1"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('#### ', '')) }}
          />
        );
      } else if (trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(formatInline(trimmed.replace('- ', '')));
      } else if (trimmed === '') {
        flushList();
      } else {
        flushList();
        elements.push(
          <p
            key={idx}
            className="text-xs sm:text-sm text-slate-200 my-1.5 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-amber-200 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700">$1</code>');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#08172c] border border-slate-700 rounded-2xl w-full max-w-4xl h-[90vh] sm:h-[84vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#051020] px-4 sm:px-6 py-3.5 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-sky-600 to-blue-700 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#07172c] flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  InfraSankalp AI Copilot
                </h2>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  XAI Reasoning
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Natural Language Intelligence for India's 450+ Central Sector Projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
              title="Reset conversation"
            >
              Clear Chat
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggested Prompts Bar */}
        <div className="bg-[#040e1b] px-4 py-2 border-b border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-[11px] font-medium whitespace-nowrap bg-slate-800/80 hover:bg-blue-900/60 hover:border-blue-500/60 text-slate-200 px-3 py-1 rounded-full border border-slate-700 transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#08172c] to-[#040e1b]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'InfraSankalp Copilot'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#091d38] text-slate-100 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                ) : (
                  <div>{renderMarkdown(msg.text)}</div>
                )}

                {/* Relevant Project Cards if matched */}
                {msg.relevant_projects && msg.relevant_projects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60">
                    <div className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Matching Projects ({msg.relevant_projects.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.relevant_projects.map((proj) => (
                        <div
                          key={proj.project_id}
                          className="bg-[#051121] border border-slate-700 hover:border-sky-500/70 p-3 rounded-xl transition-all hover:shadow-lg group text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold bg-slate-800 text-sky-300 px-2 py-0.5 rounded border border-slate-700">
                              {proj.project_id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                proj.rule_risk_tier === 'High'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                  : proj.rule_risk_tier === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              Risk: {proj.rule_risk_score}/100
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-100 mt-1.5 line-clamp-1 group-hover:text-sky-300 transition-colors">
                            {proj.project_name}
                          </div>

                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>{proj.state}</span>
                            <span>•</span>
                            <span>{proj.sector}</span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">
                              ₹{Math.round(proj.revised_cost_cr).toLocaleString()} Cr
                            </span>
                            <button
                              onClick={() => {
                                onSelectProject(proj);
                              }}
                              className="text-sky-400 hover:text-sky-200 font-bold flex items-center gap-1 hover:underline"
                            >
                              <span>Dossier</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 mr-1">Follow up:</span>
                    {msg.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f)}
                        disabled={loading}
                        className="text-[10px] bg-slate-800/90 hover:bg-sky-900/60 hover:text-sky-200 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-4 bg-[#091d38] border border-slate-700/80 rounded-2xl rounded-tl-none w-fit text-slate-300 text-xs shadow-md">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Analyzing portfolio data across 450 projects & MoSPI reports...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#051020] p-3 sm:p-4 border-t border-slate-700 shrink-0">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: e.g. 'Project INFR-RT0002', 'Why are railways delayed?', 'Top projects in Maharashtra'..."
              className="w-full bg-[#081a33] text-white text-xs sm:text-sm pl-4 pr-24 py-3 rounded-xl border border-slate-600/80 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-slate-400 shadow-inner"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!query.trim() || loading}
              className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Press Enter to query • Semantic Search & Risk Explanations</span>
            <span className="hidden sm:inline">Calibrated with MoSPI PAIMANA Epochs (2020–2026)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
