import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Calendar,
  LandPlot,
  Trees,
  Briefcase,
  Zap,
  ShieldCheck,
  Download,
  Info,
  ChevronRight,
  IndianRupee,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function PaimanaHistoricalView({ historicalData }) {
  const [activeSubTab, setActiveSubTab] = useState('cost_trends'); // 'cost_trends', 'delays', 'causes', 'sectors'

  if (!historicalData || !historicalData.time_series) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 animate-pulse">
        Loading official PAIMANA / MoSPI historical archives (2020–2026)...
      </div>
    );
  }

  const { time_series, delay_causes, sector_benchmarks, latest_snapshot } = historicalData;

  const getCauseIcon = (iconName) => {
    switch (iconName) {
      case 'LandPlot':
        return <LandPlot className="w-5 h-5 text-amber-600" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-emerald-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-purple-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  const COLORS = ['#d97706', '#059669', '#2563eb', '#9333ea', '#475569'];

  return (
    <div className="space-y-6">
      {/* Official MoSPI Flash Report Banner */}
      <div className="bg-gradient-to-r from-[#0a2540] via-[#103b68] to-[#0c1e36] text-white rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <History className="w-4 h-4" />
              <span>Official MoSPI / PAIMANA Historical Flash Report Archives</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Central Sector Projects Multi-Year Monitoring Data (2020 – 2026)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Official quarterly and annual data tracking cost escalation, completion delays, and statutory clearance bottlenecks across 1,700–1,980 central sector infrastructure projects (costing ₹150 Cr and above) under the Ministry of Statistics and Programme Implementation.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-600/80 p-4 rounded-xl text-left sm:text-right shrink-0">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Latest Flash Report Epoch</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{latest_snapshot.label}</div>
            <div className="text-xs text-slate-300 mt-1">
              Active Monitored: <strong className="text-white">{latest_snapshot.total_projects} projects</strong>
            </div>
            <div className="text-xs text-amber-400 font-semibold mt-0.5">
              Cost Overrun: ₹{latest_snapshot.cost_overrun_lakh_cr}L Cr (+{latest_snapshot.cost_overrun_pct}%)
            </div>
          </div>
        </div>

        {/* Sub-Navigation Ribbon */}
        <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('cost_trends')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'cost_trends'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Cost Escalation Trajectory (2020–2026)
          </button>

          <button
            onClick={() => setActiveSubTab('delays')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'delays'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Project Delays & Slippage Curve
          </button>

          <button
            onClick={() => setActiveSubTab('causes')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'causes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Official MoSPI Delay Root Causes
          </button>

          <button
            onClick={() => setActiveSubTab('sectors')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'sectors'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Sector Multi-Year Benchmarks
          </button>
        </div>
      </div>

      {/* SubTab 1: Cost Escalation Trajectory */}
      {activeSubTab === 'cost_trends' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Original Sanction vs Anticipated Cost Over Time (₹ Lakh Crore)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracks the steady expansion of India's central infrastructure pipeline from ₹20.6L Cr (2020) to ₹42.8L Cr (2026).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span> Original Sanction
                </span>
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span> Anticipated Cost
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Overrun Gap
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={time_series} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAnticipated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="L Cr" />
                  <Tooltip
                    formatter={(val) => [`₹${val} Lakh Crore`, 'Cost']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="anticipated_cost_lakh_cr"
                    name="Anticipated Cost"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAnticipated)"
                  />
                  <Area
                    type="monotone"
                    dataKey="original_cost_lakh_cr"
                    name="Original Sanctioned Cost"
                    stroke="#64748b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOriginal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                MoSPI Monthly Flash Report Historical Archive (13 Epochs)
              </span>
              <span className="text-xs text-slate-500 font-mono">ipm.mospi.gov.in Official Record</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Report Epoch</th>
                    <th className="py-2.5 px-3 text-center">Projects Monitored</th>
                    <th className="py-2.5 px-3 text-right">Original Sanction</th>
                    <th className="py-2.5 px-3 text-right">Anticipated Cost</th>
                    <th className="py-2.5 px-3 text-right">Cost Overrun</th>
                    <th className="py-2.5 px-3 text-center">Overrun %</th>
                    <th className="py-2.5 px-3 text-center">Delayed Proj.</th>
                    <th className="py-2.5 px-3 text-right">Expenditure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {time_series.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.label}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">{row.total_projects}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">₹{row.original_cost_lakh_cr}L Cr</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{row.anticipated_cost_lakh_cr}L Cr</td>
                      <td className="py-2.5 px-3 text-right text-red-600 font-semibold">₹{row.cost_overrun_lakh_cr}L Cr</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          +{row.cost_overrun_pct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-amber-700">
                        {row.delayed_projects} ({row.delayed_pct}%)
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                        ₹{row.expenditure_lakh_cr}L Cr ({row.expenditure_ratio_pct}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Project Delays & Slippage Curve */}
      {activeSubTab === 'delays' && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Evolution of Delayed Central Sector Projects (2020 – 2026)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Number and proportion of infrastructure projects running behind schedule across reporting periods.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={time_series} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  formatter={(val, name) => [name === 'Delayed Projects' ? `${val} Projects` : `${val}%`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="delayed_projects" name="Delayed Projects" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Info className="w-4 h-4 text-amber-600" />
              <span>MoSPI Analytical Finding on Time Overruns</span>
            </div>
            <p className="leading-relaxed text-amber-900">
              The proportion of delayed infrastructure projects rose from <strong>28.6% in 2020</strong> to a plateau of <strong>42.6%–45.0% between 2023 and 2026</strong>. However, total cost escalation has moderated from ~21.7% in 2021 to <strong>15.2% in 2026</strong> due to GatiShakti inter-ministerial coordination and PRAGATI digital monitoring.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 3: Official MoSPI Delay Root Causes */}
      {activeSubTab === 'causes' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Primary Bottlenecks Causing Schedule & Cost Overruns (MoSPI Categorization)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of factors officially cited by administrative ministries in monthly Flash Reports.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Pie / Donut Chart */}
              <div className="lg:col-span-5 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={delay_causes}
                      dataKey="percentage"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {delay_causes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val}% of Bottlenecks`, 'Share']}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Cause Details Grid */}
              <div className="lg:col-span-7 space-y-2.5">
                {delay_causes.map((cause, idx) => (
                  <div
                    key={cause.category}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all flex items-start gap-3 text-xs"
                  >
                    <div className="p-2 bg-white rounded-md shadow-2xs shrink-0 mt-0.5">
                      {getCauseIcon(cause.icon)}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{cause.category}</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cause.percentage}% ({cause.affected_projects} proj)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {cause.description}
                      </p>
                      <div className="text-[10px] text-amber-700 font-semibold pt-0.5">
                        Average duration of delay induced: ~{cause.avg_delay_months} months
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Sector Multi-Year Benchmarks */}
      {activeSubTab === 'sectors' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              MoSPI Sectoral Flash Report Multi-Year Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Capital exposure, cost overruns, and average delay severity across the 8 key central sectors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Infrastructure Sector</th>
                  <th className="py-2.5 px-3">Nodal Ministry</th>
                  <th className="py-2.5 px-3 text-center">Active Projects</th>
                  <th className="py-2.5 px-3 text-right">Anticipated Cost</th>
                  <th className="py-2.5 px-3 text-right">Cost Overrun</th>
                  <th className="py-2.5 px-3 text-center">Overrun Rate</th>
                  <th className="py-2.5 px-3 text-center">Delayed Count</th>
                  <th className="py-2.5 px-3 text-center">Avg Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sector_benchmarks.map((sec) => (
                  <tr key={sec.sector} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{sec.sector}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{sec.ministry}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{sec.active_projects}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">₹{sec.anticipated_cost_lakh_cr}L Cr</td>
                    <td className="py-3 px-3 text-right text-red-600 font-semibold">₹{sec.overrun_lakh_cr}L Cr</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        +{sec.overrun_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700">{sec.delayed_count}</td>
                    <td className="py-3 px-3 text-center text-slate-700 font-medium">~{sec.avg_delay_months} mos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
