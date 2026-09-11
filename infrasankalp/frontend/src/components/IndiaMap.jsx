import React, { useState } from 'react';
import { INDIA_STATES_DATA } from '../data/indiaMapData';
import { MapPin, Filter, X, ArrowRight, ShieldAlert, IndianRupee, Layers, Search, Sparkles } from 'lucide-react';

export default function IndiaMap({ statesAnalytics, selectedState, onSelectState, onNavigateToDirectory }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [mapMetric, setMapMetric] = useState('risk'); // 'risk', 'outlay', 'delayed'
  const [stateSearch, setStateSearch] = useState('');

  const stateStatsMap = React.useMemo(() => {
    const map = {};
    if (statesAnalytics) {
      statesAnalytics.forEach((s) => {
        map[s.state] = s;
      });
    }
    return map;
  }, [statesAnalytics]);

  const activeStateData = hoveredState
    ? stateStatsMap[hoveredState]
    : selectedState
    ? stateStatsMap[selectedState]
    : null;

  // Filtered states list for side panel
  const filteredStatesList = (statesAnalytics || []).filter((s) =>
    s.state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const topStates = ['Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Odisha'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6 space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">National Infrastructure Spatial Map</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive state-wise risk intensity and capital allocation across all 28 States & UTs.
          </p>
        </div>

        {/* View Dimension Toggle & Clear Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center font-semibold">
            <button
              onClick={() => setMapMetric('risk')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mapMetric === 'risk' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Risk Intensity
            </button>
            <button
              onClick={() => setMapMetric('outlay')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mapMetric === 'outlay' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Capital Outlay
            </button>
            <button
              onClick={() => setMapMetric('delayed')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mapMetric === 'delayed' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delays
            </button>
          </div>

          {selectedState && (
            <button
              onClick={() => onSelectState(null)}
              className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1"
              title="Reset state filter"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick State Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">
          Top States:
        </span>
        {topStates.map((st) => (
          <button
            key={st}
            onClick={() => onSelectState(selectedState === st ? null : st)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedState === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Map + State Directory Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive SVG Geo-Schematic Map */}
        <div className="lg:col-span-8 bg-[#09182d] rounded-xl p-3 sm:p-5 relative border border-slate-800 shadow-inner overflow-hidden">
          <div className="absolute top-3 left-3 z-10 text-[11px] text-slate-300 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700 backdrop-blur font-medium">
            Click on any State Node to Filter Directory
          </div>

          <svg
            viewBox="0 0 760 780"
            className="w-full h-auto max-h-[520px] select-none"
            style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.4))' }}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#17253b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="760" height="780" fill="url(#grid)" />

            {INDIA_STATES_DATA.map((state) => {
              const stats = stateStatsMap[state.name] || {
                project_count: 0,
                total_outlay_lakh_cr: 0,
                avg_rule_risk_score: 0,
                high_risk_count: 0,
                delayed_count: 0,
                risk_level: 'Low',
                state_color: '#10b981',
              };

              const isSelected = selectedState === state.name;
              const isHovered = hoveredState === state.name;

              // Compute dynamic node fill based on selected metric
              let fillColor = '#10b981';
              if (mapMetric === 'risk') {
                fillColor = stats.risk_level === 'High' ? '#ef4444' : stats.risk_level === 'Medium' ? '#f59e0b' : '#10b981';
              } else if (mapMetric === 'outlay') {
                fillColor = stats.total_outlay_lakh_cr >= 1.0 ? '#3b82f6' : stats.total_outlay_lakh_cr >= 0.5 ? '#6366f1' : '#64748b';
              } else if (mapMetric === 'delayed') {
                fillColor = stats.delayed_count >= 5 ? '#dc2626' : stats.delayed_count >= 2 ? '#d97706' : '#059669';
              }

              return (
                <g
                  key={state.id}
                  onClick={() => onSelectState(isSelected ? null : state.name)}
                  onMouseEnter={() => setHoveredState(state.name)}
                  onMouseLeave={() => setHoveredState(null)}
                  className="cursor-pointer transition-transform duration-200"
                  style={{
                    transformOrigin: `${state.x + state.width / 2}px ${state.y + state.height / 2}px`,
                  }}
                >
                  {(isSelected || isHovered) && (
                    <rect
                      x={state.x - 4}
                      y={state.y - 4}
                      width={state.width + 8}
                      height={state.height + 8}
                      rx={8}
                      fill="none"
                      stroke={isSelected ? '#38bdf8' : '#ffffff'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray={isSelected ? '4 2' : 'none'}
                      opacity={0.9}
                    />
                  )}

                  <rect
                    x={state.x}
                    y={state.y}
                    width={state.width}
                    height={state.height}
                    rx={6}
                    fill={fillColor}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.7}
                    stroke={isSelected ? '#ffffff' : '#1e293b'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  <text
                    x={state.x + state.width / 2}
                    y={state.y + state.height / 2 - (state.height > 40 ? 4 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={state.width < 50 ? '10px' : '12px'}
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {state.id}
                  </text>

                  {state.height > 38 && (
                    <text
                      x={state.x + state.width / 2}
                      y={state.y + state.height / 2 + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#e2e8f0"
                      fontSize="9px"
                      fontWeight="600"
                      pointerEvents="none"
                    >
                      {stats.project_count} proj
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Card */}
          {activeStateData && (
            <div className="absolute bottom-4 right-4 bg-slate-800/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl backdrop-blur max-w-xs text-xs animate-in fade-in duration-100">
              <div className="font-bold text-sm text-sky-400 flex items-center justify-between">
                <span>{activeStateData.state}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    activeStateData.risk_level === 'High'
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                      : activeStateData.risk_level === 'Medium'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {activeStateData.risk_level} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/80">
                <div>
                  <span className="text-slate-400 text-[11px]">Projects:</span>
                  <div className="font-bold text-white text-sm">{activeStateData.project_count}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Outlay:</span>
                  <div className="font-bold text-white text-sm">₹{activeStateData.total_outlay_lakh_cr}L Cr</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Avg Risk:</span>
                  <div className="font-bold text-white">{activeStateData.avg_rule_risk_score} / 100</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Delayed:</span>
                  <div className="font-bold text-amber-400">{activeStateData.delayed_count} proj</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-300">
                  Lead: <strong className="text-white">{activeStateData.primary_sector}</strong>
                </span>
                <button
                  onClick={() => {
                    onSelectState(activeStateData.state);
                    onNavigateToDirectory();
                  }}
                  className="text-sky-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Filter Table</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* State Ranking & Search Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                State Risk & Outlay Directory
              </h3>
              <span className="text-[11px] text-slate-500">{filteredStatesList.length} States</span>
            </div>

            {/* State Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find state..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
              {filteredStatesList.map((st) => {
                const isSelected = selectedState === st.state;
                return (
                  <div
                    key={st.state}
                    onClick={() => onSelectState(isSelected ? null : st.state)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            st.risk_level === 'High'
                              ? 'bg-red-500'
                              : st.risk_level === 'Medium'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        ></span>
                        <span>{st.state}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {st.project_count} projects • ₹{st.total_outlay_lakh_cr}L Cr
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          st.risk_level === 'High'
                            ? 'bg-red-100 text-red-800'
                            : st.risk_level === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Risk: {st.avg_rule_risk_score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedState && (
            <button
              onClick={onNavigateToDirectory}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>View Projects Filtered to {selectedState}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
