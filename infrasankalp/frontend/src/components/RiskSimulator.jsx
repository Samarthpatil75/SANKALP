import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Cpu,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function RiskSimulator() {
  const [formData, setFormData] = useState({
    project_name: 'Western Dedicated Freight Corridor Package-3',
    sector: 'Railways',
    original_cost_cr: 3200,
    revised_cost_cr: 4950,
    planned_start_date: '2023-01-15',
    planned_end_date: '2026-06-30',
    actual_progress_pct: 42.0,
    financial_progress_pct: 71.5,
    milestone_count: 12,
    milestones_missed: 3,
    last_milestone_delay_days: 140,
    status: 'Delayed',
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Apply Presets
  const applyPreset = (presetType) => {
    if (presetType === 'critical') {
      setFormData({
        project_name: 'High-Speed Elevated Ringway Package-A',
        sector: 'Road Transport',
        original_cost_cr: 4000,
        revised_cost_cr: 6600, // 65% overrun
        planned_start_date: '2022-06-01',
        planned_end_date: '2025-12-31',
        actual_progress_pct: 38.0,
        financial_progress_pct: 76.0,
        milestone_count: 14,
        milestones_missed: 5,
        last_milestone_delay_days: 210,
        status: 'Delayed',
      });
    } else if (presetType === 'healthy') {
      setFormData({
        project_name: 'Vande Bharat Route Modernization & 3rd Line',
        sector: 'Railways',
        original_cost_cr: 2400,
        revised_cost_cr: 2400, // 0% overrun
        planned_start_date: '2023-03-01',
        planned_end_date: '2026-10-31',
        actual_progress_pct: 88.0,
        financial_progress_pct: 82.0,
        milestone_count: 10,
        milestones_missed: 0,
        last_milestone_delay_days: 0,
        status: 'Ongoing',
      });
    } else if (presetType === 'premature_spend') {
      setFormData({
        project_name: 'Multi-Modal Logistics Park & Terminal Interchange',
        sector: 'Urban Infrastructure',
        original_cost_cr: 1800,
        revised_cost_cr: 2100, // 16% overrun
        planned_start_date: '2024-01-01',
        planned_end_date: '2027-06-30',
        actual_progress_pct: 18.0,
        financial_progress_pct: 64.0, // 46pp gap
        milestone_count: 8,
        milestones_missed: 2,
        last_milestone_delay_days: 90,
        status: 'Ongoing',
      });
    } else if (presetType === 'forest_delay') {
      setFormData({
        project_name: 'Hydro-Electric Evacuation Transmission Line',
        sector: 'Power',
        original_cost_cr: 2200,
        revised_cost_cr: 2860, // 30% overrun
        planned_start_date: '2022-09-01',
        planned_end_date: '2025-08-31',
        actual_progress_pct: 54.0,
        financial_progress_pct: 68.0,
        milestone_count: 12,
        milestones_missed: 3,
        last_milestone_delay_days: 180,
        status: 'Delayed',
      });
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch('https://infrasankalp-api.onrender.com/api/simulate-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, [formData]);

  const costOverrunPercent = Math.max(
    0,
    Math.round(((formData.revised_cost_cr - formData.original_cost_cr) / formData.original_cost_cr) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Sandbox Header */}
      <div className="bg-gradient-to-r from-[#07172c] via-[#0d284d] to-[#0a1f3a] text-white rounded-2xl p-6 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              <span>Interactive Risk Sandbox & What-If Analyzer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Simulate Custom Infrastructure Risk & Governance Interventions
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Drag the interactive sliders to adjust physical output, financial disbursements, and delays to observe how both Rule-Based and Machine Learning scoring engines react in real-time.
            </p>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 font-bold px-2">Presets:</span>
            <button
              onClick={() => applyPreset('critical')}
              className="px-2.5 py-1 text-xs bg-red-950/80 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 font-medium"
            >
              Severe Delay & Overrun
            </button>
            <button
              onClick={() => applyPreset('premature_spend')}
              className="px-2.5 py-1 text-xs bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded-lg border border-amber-800 font-medium"
            >
              Premature Spend Gap
            </button>
            <button
              onClick={() => applyPreset('forest_delay')}
              className="px-2.5 py-1 text-xs bg-purple-950/80 hover:bg-purple-900 text-purple-300 rounded-lg border border-purple-800 font-medium"
            >
              Clearance Gridlock
            </button>
            <button
              onClick={() => applyPreset('healthy')}
              className="px-2.5 py-1 text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-800 font-medium"
            >
              On-Track Corridor
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Sliders Form Column */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Interactive Parameter Sliders
            </h3>
            <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Live Reactive Engine
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Project Name & Sector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Road Transport">Road Transport</option>
                  <option value="Railways">Railways</option>
                  <option value="Power">Power</option>
                  <option value="Petroleum & Gas">Petroleum & Gas</option>
                  <option value="Coal">Coal</option>
                  <option value="Urban Infrastructure">Urban Infrastructure</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Telecom">Telecom</option>
                </select>
              </div>
            </div>

            {/* Slider 1: Physical Progress */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Physical Progress (On-Ground Deliverable):</span>
                <span className="font-mono font-bold text-blue-700 text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {formData.actual_progress_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.actual_progress_pct}
                onChange={(e) => setFormData({ ...formData, actual_progress_pct: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Slider 2: Financial Progress */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Financial Progress (Treasury Disbursed):</span>
                <span className="font-mono font-bold text-indigo-700 text-sm bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {formData.financial_progress_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.financial_progress_pct}
                onChange={(e) => setFormData({ ...formData, financial_progress_pct: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Progress Gap: {(formData.financial_progress_pct - formData.actual_progress_pct).toFixed(1)}pp</span>
                <span className={formData.financial_progress_pct > formData.actual_progress_pct + 15 ? 'text-red-600 font-bold' : 'text-slate-400'}>
                  {formData.financial_progress_pct > formData.actual_progress_pct + 15 ? '⚠️ High Advance Lead' : 'Nominal alignment'}
                </span>
              </div>
            </div>

            {/* Slider 3: Cost Overrun */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Revised Cost (Budget Escalation):</span>
                <span className="font-mono font-bold text-amber-700 text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ₹{formData.revised_cost_cr} Cr (+{costOverrunPercent}%)
                </span>
              </div>
              <input
                type="range"
                min={formData.original_cost_cr}
                max={formData.original_cost_cr * 2.5}
                step="50"
                value={formData.revised_cost_cr}
                onChange={(e) => setFormData({ ...formData, revised_cost_cr: Number(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Original Sanction: ₹{formData.original_cost_cr} Cr</span>
                <span>Max Simulated: ₹{formData.original_cost_cr * 2.5} Cr</span>
              </div>
            </div>

            {/* Slider 4: Milestone Delays */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Missed Milestones & Delay Severity:</span>
                <span className="font-mono font-bold text-red-600 text-sm bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {formData.milestones_missed} missed ({formData.last_milestone_delay_days}d delay)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Missed Count (0–{formData.milestone_count}):</label>
                  <input
                    type="range"
                    min="0"
                    max={formData.milestone_count}
                    value={formData.milestones_missed}
                    onChange={(e) => setFormData({ ...formData, milestones_missed: Number(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Delay Duration (0–360 days):</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={formData.last_milestone_delay_days}
                    onChange={(e) => setFormData({ ...formData, last_milestone_delay_days: Number(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Reactive Diagnostic Output Column */}
        <div className="lg:col-span-6 space-y-4">
          {simulationResult ? (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Top Result Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  simulationResult.rule_risk_tier === 'High'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : simulationResult.rule_risk_tier === 'Medium'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-xs shrink-0 mt-0.5">
                    {simulationResult.rule_risk_tier === 'High' ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : simulationResult.rule_risk_tier === 'Medium' ? (
                      <ShieldAlert className="w-6 h-6 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider">
                      Live Calculated Diagnostic Output
                    </div>
                    <p className="text-sm font-bold mt-1 leading-snug">
                      {simulationResult.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side by Side Score comparison */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    Rule-Based Score
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {simulationResult.rule_risk_score} / 100
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                    Tier: {simulationResult.rule_risk_tier}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    ML Model Score
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {simulationResult.ml_risk_score} / 100
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                    Probability: {(simulationResult.ml_probability * 100).toFixed(1)}% ({simulationResult.ml_risk_tier})
                  </div>
                </div>
              </div>

              {/* Component Contribution Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  Factor Contributions to Composite Score
                </h4>

                <div className="space-y-2.5 text-xs">
                  {Object.entries(simulationResult.components || {}).map(([k, c]) => (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{c.name} ({c.raw_value})</span>
                        <span className="font-mono font-bold text-slate-900">+{c.contribution_pts} pts</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: `${(c.contribution_pts / (c.weight * 100)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Mitigations */}
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 text-xs">
                <h4 className="font-bold text-blue-900 uppercase tracking-wider mb-2">
                  Targeted Administrative Mitigations
                </h4>
                <ul className="space-y-1 text-blue-950">
                  {(simulationResult.mitigations || []).map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-dashed border-slate-200">
              Adjust sliders to trigger instant diagnostic computation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
