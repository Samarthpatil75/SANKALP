import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  IndianRupee,
  Cpu,
  Layers,
  FileText,
  AlertCircle,
  BarChart2,
  ArrowRight,
  LandPlot,
  Trees,
  Briefcase,
  Zap,
  Calendar,
  Share2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ProjectDetailModal({ project, onClose }) {
  const [modalTab, setModalTab] = useState('xai'); // 'xai', 'financials', 'milestones', 'mitigations'

  if (!project) return null;

  const {
    project_id,
    project_name,
    sector,
    ministry,
    implementing_agency,
    state,
    original_cost_cr,
    revised_cost_cr,
    cumulative_expenditure_cr,
    cost_overrun_pct,
    cost_overrun_cr,
    planned_start_date,
    planned_end_date,
    actual_progress_pct,
    financial_progress_pct,
    milestone_count,
    milestones_missed,
    last_milestone_delay_days,
    status,
    rule_risk_score,
    rule_risk_tier,
    explanation,
    components,
    mitigations,
    ml_risk_score,
    ml_risk_tier,
    ml_probability,
  } = project;

  const costChartData = [
    { name: 'Original Sanction', amount: original_cost_cr, fill: '#64748b' },
    { name: 'Revised Sanction', amount: revised_cost_cr, fill: cost_overrun_pct > 0 ? '#ef4444' : '#3b82f6' },
    { name: 'Cumulative Disbursed', amount: cumulative_expenditure_cr, fill: '#10b981' },
  ];

  const progressGap = (financial_progress_pct - actual_progress_pct).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Official PAIMANA Project Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#081b33] text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-blue-600/30 text-sky-300 px-2.5 py-0.5 rounded text-xs font-mono font-bold border border-sky-400/40">
                  {project_id}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {ministry}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    status === 'Delayed'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {status}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-white leading-snug">
                {project_name}
              </h2>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Agency: <strong className="text-white">{implementing_agency}</strong></span>
                <span>•</span>
                <span>State: <strong className="text-white">{state}</strong></span>
                <span>•</span>
                <span>Sector: <strong className="text-white">{sector}</strong></span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Internal Navigation Tabs */}
          <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-wrap gap-1 text-xs font-semibold">
            <button
              onClick={() => setModalTab('xai')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                modalTab === 'xai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Explainable Risk (XAI)</span>
            </button>
            <button
              onClick={() => setModalTab('financials')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                modalTab === 'financials'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Cost & Outlay Dynamics</span>
            </button>
            <button
              onClick={() => setModalTab('milestones')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                modalTab === 'milestones'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline & Bottlenecks</span>
            </button>
            <button
              onClick={() => setModalTab('mitigations')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                modalTab === 'mitigations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Governance Protocols</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* TAB 1: EXPLAINABLE RISK ATTRIBUTION */}
          {modalTab === 'xai' && (
            <div className="space-y-4">
              {/* Plain-Language Hero Diagnostic */}
              <div
                className={`p-4 rounded-xl border ${
                  rule_risk_tier === 'High'
                    ? 'bg-red-50/90 border-red-200 text-red-950'
                    : rule_risk_tier === 'Medium'
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/90 shrink-0 shadow-xs">
                    {rule_risk_tier === 'High' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : rule_risk_tier === 'Medium' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Explainable Risk Diagnostic Analysis
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-current">
                        {rule_risk_tier} Risk ({rule_risk_score}/100)
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual-Engine Scoring Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <ShieldAlert className="w-4 h-4 text-blue-600" />
                      Rule-Based Composite Engine
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rule_risk_tier === 'High'
                          ? 'bg-red-100 text-red-800'
                          : rule_risk_tier === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {rule_risk_tier}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{rule_risk_score}</span>
                    <span className="text-slate-500 font-medium text-xs">/ 100 points</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Deterministic weighted formulation across cost variance (35%), schedule slippage (25%), financial gap (25%), and milestone delays (15%).
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      Scikit-Learn ML Model (Random Forest)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ml_risk_tier === 'High'
                          ? 'bg-red-100 text-red-800'
                          : ml_risk_tier === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ml_risk_tier}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{ml_risk_score}</span>
                    <span className="text-slate-500 font-medium text-xs">/ 100 (Prob: {(ml_probability * 100).toFixed(1)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Predictive classifier trained on early project features. Concordance: <strong>{rule_risk_tier === ml_risk_tier ? 'Agreement' : 'Divergence (Nonlinear signal)'}</strong>.
                  </p>
                </div>
              </div>

              {/* Granular Component Attribution Bars */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    Component Attribution Breakdown (Weight Sum = 1.0)
                  </h3>
                  <span className="text-[11px] text-slate-500">Total Contribution: <strong>{rule_risk_score} pts</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {Object.entries(components || {}).map(([key, comp]) => {
                    const maxPossible = Math.round(comp.weight * 100);
                    const percentOfMax = (comp.contribution_pts / maxPossible) * 100;
                    const barColor =
                      percentOfMax >= 60
                        ? 'bg-red-500'
                        : percentOfMax >= 30
                        ? 'bg-amber-500'
                        : 'bg-emerald-500';

                    return (
                      <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{comp.name}</span>
                          <span className="font-mono font-bold text-slate-900">
                            +{comp.contribution_pts} pts <span className="text-slate-400 font-normal">/ {maxPossible}</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor}`}
                            style={{ width: `${Math.min(100, percentOfMax)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Observed: <strong>{comp.raw_value}</strong></span>
                          <span>Score: {comp.score_out_of_100}/100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & OUTLAY DYNAMICS */}
          {modalTab === 'financials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cost Chart */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Original Sanction vs Anticipated Cost vs Cumulative Spent
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                        <Tooltip
                          formatter={(val) => [`₹${Number(val).toLocaleString()} Cr`, 'Amount']}
                          contentStyle={{ backgroundColor: '#1e293b', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                          {costChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Financial Health Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                      Capital Expenditure & Escalation Summary
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Original Sanctioned Cost:</span>
                        <strong className="text-slate-900 font-mono">₹{original_cost_cr.toLocaleString()} Cr</strong>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Latest Anticipated Cost:</span>
                        <strong className="text-slate-900 font-mono">₹{revised_cost_cr.toLocaleString()} Cr</strong>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Cumulative Disbursed:</span>
                        <strong className="text-emerald-700 font-mono">₹{cumulative_expenditure_cr.toLocaleString()} Cr</strong>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Cost Escalation:</span>
                        <strong className={cost_overrun_pct > 0 ? 'text-red-600' : 'text-slate-800'}>
                          +{cost_overrun_pct}% (+₹{cost_overrun_cr.toLocaleString()} Cr)
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Financial Burn Ratio:</span>
                        <strong className="text-slate-800">{financial_progress_pct}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical vs Financial Progress Gap */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Physical Output vs Financial Disbursement Gap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-blue-700">Physical Deliverables: {actual_progress_pct}%</span>
                      <span className="text-slate-500 font-mono">Site Verification</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${actual_progress_pct}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-indigo-700">Financial Disbursement: {financial_progress_pct}%</span>
                      <span className="text-slate-500 font-mono">Treasury Drawdown</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${financial_progress_pct}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-center justify-between border border-slate-200">
                  <span>Variance Analysis:</span>
                  <span className={`font-bold ${Number(progressGap) > 15 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {Number(progressGap) > 0 ? `+${progressGap}pp Financial Advance Lead` : `${progressGap}pp Lag`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES & BOTTLECK ANALYZER */}
          {modalTab === 'milestones' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Planned Start</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{planned_start_date}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Anticipated Completion</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{planned_end_date}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Milestones Missed</div>
                  <div className="font-bold text-amber-700 text-sm mt-0.5">{milestones_missed} / {milestone_count}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Latest Milestone Delay</div>
                  <div className="font-bold text-red-600 text-sm mt-0.5">{last_milestone_delay_days} days</div>
                </div>
              </div>

              {/* MoSPI Delay Bottlenecks */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Statutory Clearance & Bottleneck Assessment (MoSPI PAIMANA Framework)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <LandPlot className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Land Acquisition & RoW</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {status === 'Delayed' ? 'Acquisition ongoing with pending district revenue notifications.' : 'Nominal alignment acquired.'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <Trees className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Forest & Wildlife Clearances</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {last_milestone_delay_days > 90 ? 'Stage-II MoEF&CC approval under inter-ministerial review.' : 'Statutory clearances secured.'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Utility Shifting</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Coordination with State Transco and local water works for corridor diversion.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Contractor Liquidity</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {cost_overrun_pct > 20 ? 'Price variation claim submitted to Revised Cost Committee (RCC).' : 'Standard contract mobilization.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMINISTRATIVE GOVERNANCE PROTOCOLS */}
          {modalTab === 'mitigations' && (
            <div className="space-y-4">
              <div className="bg-blue-50/90 p-5 rounded-xl border border-blue-200 text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-blue-950 uppercase tracking-wider">
                    Recommended Executive Mitigation Protocol (Cabinet / PMG Review)
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Based on the mathematical diagnostic triggers of project <strong>{project_id}</strong>, the following statutory interventions are prescribed under MoSPI and Department of Expenditure guidelines:
                </p>

                <ul className="space-y-2 pt-1">
                  {(mitigations || []).map((m, idx) => (
                    <li key={idx} className="p-3 bg-white rounded-lg border border-blue-200/80 flex items-start gap-2 text-slate-900 font-medium">
                      <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">PAIMANA Sector Code: {project_id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
}
