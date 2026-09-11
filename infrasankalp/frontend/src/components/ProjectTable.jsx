import React, { useState } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
  Download,
  X,
  Sparkles,
  ArrowUpDown,
  Layers,
} from 'lucide-react';

export default function ProjectTable({
  projects,
  loading,
  totalProjects,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  onResetFilters,
  scoreMode,
  setScoreMode,
  onSelectProject,
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const sectors = [
    'All',
    'Road Transport',
    'Railways',
    'Power',
    'Petroleum & Gas',
    'Coal',
    'Urban Infrastructure',
    'Irrigation',
    'Telecom',
  ];

  const riskLevels = ['All', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Ongoing', 'Delayed', 'Completed'];

  // Export filtered projects to CSV
  const handleExportCSV = () => {
    if (!projects || projects.length === 0) return;
    const headers = [
      'Project ID',
      'Project Name',
      'Sector',
      'Ministry',
      'Agency',
      'State',
      'Status',
      'Original Cost (Cr)',
      'Revised Cost (Cr)',
      'Expenditure (Cr)',
      'Cost Overrun %',
      'Physical Progress %',
      'Financial Progress %',
      'Rule Risk Score',
      'Rule Risk Tier',
      'ML Risk Score',
      'ML Risk Tier',
    ];

    const rows = projects.map((p) => [
      p.project_id,
      `"${p.project_name.replace(/"/g, '""')}"`,
      p.sector,
      `"${p.ministry}"`,
      `"${p.implementing_agency}"`,
      p.state,
      p.status,
      p.original_cost_cr,
      p.revised_cost_cr,
      p.cumulative_expenditure_cr,
      p.cost_overrun_pct,
      p.actual_progress_pct,
      p.financial_progress_pct,
      p.rule_risk_score,
      p.rule_risk_tier,
      p.ml_risk_score,
      p.ml_risk_tier,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `InfraSankalp_Projects_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Preset Filters
  const applyQuickPill = (type) => {
    if (type === 'high_risk') {
      onFilterChange('risk_tier', 'High');
    } else if (type === 'delayed') {
      onFilterChange('status', 'Delayed');
    } else if (type === 'overrun') {
      onFilterChange('sort_by', 'cost_overrun_desc');
    } else if (type === 'roads') {
      onFilterChange('sector', 'Road Transport');
    } else if (type === 'railways') {
      onFilterChange('sector', 'Railways');
    } else if (type === 'power') {
      onFilterChange('sector', 'Power');
    } else if (type === 'all') {
      onResetFilters();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6 space-y-4">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Central Sector Project Inventory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {totalProjects} Projects Found
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time explainable monitoring across ₹150 Cr+ central infrastructure investments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Download CSV report of filtered projects"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Score Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs font-semibold">
            <button
              onClick={() => setScoreMode('rule')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                scoreMode === 'rule'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rule Score
            </button>
            <button
              onClick={() => setScoreMode('ml')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                scoreMode === 'ml'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ML Score
            </button>
            <button
              onClick={() => setScoreMode('both')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                scoreMode === 'both'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {/* Table vs Grid Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Quick Filter Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-sky-500" />
          Quick Filters:
        </span>

        <button
          onClick={() => applyQuickPill('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.risk_tier === 'All' && filters.status === 'All' && filters.sector === 'All'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          All ({totalProjects})
        </button>

        <button
          onClick={() => applyQuickPill('high_risk')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.risk_tier === 'High'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          ⚠️ High Risk Only
        </button>

        <button
          onClick={() => applyQuickPill('delayed')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.status === 'Delayed'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
          }`}
        >
          ⏳ Delayed Projects
        </button>

        <button
          onClick={() => applyQuickPill('overrun')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.sort_by === 'cost_overrun_desc'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
          }`}
        >
          📈 Highest Overrun %
        </button>

        <button
          onClick={() => applyQuickPill('roads')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.sector === 'Road Transport'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          🛣️ Roads (NHAI)
        </button>

        <button
          onClick={() => applyQuickPill('railways')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.sector === 'Railways'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          🚆 Railways
        </button>

        <button
          onClick={() => applyQuickPill('power')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filters.sector === 'Power'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          ⚡ Power & Grid
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        {/* Instant Search with Clear */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search project, ID, agency, state..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sector Filter */}
        <div>
          <select
            value={filters.sector}
            onChange={(e) => onFilterChange('sector', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                Sector: {s}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <select
            value={filters.risk_tier}
            onChange={(e) => onFilterChange('risk_tier', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs"
          >
            {riskLevels.map((r) => (
              <option key={r} value={r}>
                Risk Tier: {r}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By & Reset */}
        <div className="flex items-center gap-1.5">
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange('sort_by', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs"
          >
            <option value="risk_score_desc">Sort: Highest Risk</option>
            <option value="risk_score_asc">Sort: Lowest Risk</option>
            <option value="cost_overrun_desc">Sort: Highest Cost Overrun</option>
            <option value="outlay_desc">Sort: Highest Capital Outlay</option>
            <option value="progress_asc">Sort: Lowest Physical Progress</option>
          </select>

          {(filters.search ||
            filters.sector !== 'All' ||
            filters.risk_tier !== 'All' ||
            filters.status !== 'All' ||
            filters.state !== 'All') && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 font-semibold"
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Active State Filter Tag */}
      {filters.state && filters.state !== 'All' && (
        <div className="bg-blue-50 text-blue-900 text-xs px-3.5 py-2 rounded-lg border border-blue-200 flex items-center justify-between">
          <span className="font-medium">
            Currently filtering state: <strong className="font-bold text-blue-700">{filters.state}</strong>
          </span>
          <button
            onClick={() => onFilterChange('state', 'All')}
            className="text-blue-700 hover:underline font-bold text-xs flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remove State Filter</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-2 py-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No infrastructure projects match these criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search or resetting active filters.</p>
          <button
            onClick={onResetFilters}
            className="mt-3 text-xs bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Dense & Readable Data Table */
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Project / Implementing Agency</th>
                <th className="py-3 px-3">State & Sector</th>
                <th className="py-3 px-3 text-right">Outlay & Overrun</th>
                <th className="py-3 px-3">Physical vs Spent Progress</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">
                  {scoreMode === 'both'
                    ? 'Rule vs ML Score'
                    : scoreMode === 'ml'
                    ? 'ML Model Score'
                    : 'Rule-Based Score'}
                </th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => {
                const ruleBadgeColor =
                  p.rule_risk_tier === 'High'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : p.rule_risk_tier === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                const mlBadgeColor =
                  p.ml_risk_tier === 'High'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : p.ml_risk_tier === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                return (
                  <tr
                    key={p.project_id}
                    onClick={() => onSelectProject(p)}
                    className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 line-clamp-1">
                        {p.project_name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-slate-700 bg-slate-100 px-1 rounded">{p.project_id}</span>
                        <span>•</span>
                        <span className="truncate max-w-[220px]">{p.implementing_agency}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{p.state}</div>
                      <div className="text-[11px] text-slate-500">{p.sector}</div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-slate-900 font-mono">₹{Math.round(p.revised_cost_cr).toLocaleString()} Cr</div>
                      <div className="text-[11px]">
                        {p.cost_overrun_pct > 0 ? (
                          <span className="text-red-600 font-semibold">+{p.cost_overrun_pct}% overrun</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">On original budget</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 min-w-[160px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                          <span className="text-blue-700">Physical: {p.actual_progress_pct}%</span>
                          <span className="text-indigo-700">Spent: {p.financial_progress_pct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: `${p.actual_progress_pct}%` }}
                            title={`Physical: ${p.actual_progress_pct}%`}
                          ></div>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden flex">
                          <div
                            className="bg-indigo-600 h-full"
                            style={{ width: `${p.financial_progress_pct}%` }}
                            title={`Disbursed: ${p.financial_progress_pct}%`}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          p.status === 'Delayed'
                            ? 'bg-amber-100 text-amber-800'
                            : p.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status === 'Delayed' && <Clock className="w-2.5 h-2.5" />}
                        {p.status === 'Completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {scoreMode === 'both' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${ruleBadgeColor}`}
                            title={`Rule-Based Score: ${p.rule_risk_score}/100`}
                          >
                            R: {p.rule_risk_score}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${mlBadgeColor}`}
                            title={`ML Model Score: ${p.ml_risk_score}/100`}
                          >
                            ML: {p.ml_risk_score}
                          </span>
                        </div>
                      ) : scoreMode === 'ml' ? (
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${mlBadgeColor}`}
                        >
                          {p.ml_risk_score} / 100 ({p.ml_risk_tier})
                        </span>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${ruleBadgeColor}`}
                        >
                          {p.rule_risk_score} / 100 ({p.rule_risk_tier})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p);
                        }}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-100/80 rounded-md font-semibold text-xs transition-colors flex items-center gap-0.5 ml-auto"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {projects.map((p) => {
            const riskTier = scoreMode === 'ml' ? p.ml_risk_tier : p.rule_risk_tier;
            const riskScore = scoreMode === 'ml' ? p.ml_risk_score : p.rule_risk_score;
            const borderColor =
              riskTier === 'High'
                ? 'border-red-300'
                : riskTier === 'Medium'
                ? 'border-amber-300'
                : 'border-slate-200';

            return (
              <div
                key={p.project_id}
                onClick={() => onSelectProject(p)}
                className={`bg-white rounded-xl border ${borderColor} p-4 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                      {p.project_id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        riskTier === 'High'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : riskTier === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {riskTier} Risk ({riskScore})
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {p.project_name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {p.state} • {p.sector}
                  </div>

                  {/* Plain Language Explainability Excerpt */}
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 leading-snug border border-slate-200/60 line-clamp-2">
                    {p.explanation}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Capital Outlay:</span>
                    <strong className="text-slate-900 font-mono">₹{Math.round(p.revised_cost_cr)} Cr</strong>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Physical: {p.actual_progress_pct}%</span>
                      <span>Spent: {p.financial_progress_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${p.actual_progress_pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination & Results Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalProjects} matching items)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            Previous
          </button>
          <span className="px-2 font-mono font-bold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
