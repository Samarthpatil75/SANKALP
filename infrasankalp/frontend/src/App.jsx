import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import IndiaMap from './components/IndiaMap';
import SectorOverview from './components/SectorOverview';
import ProjectTable from './components/ProjectTable';
import ProjectDetailModal from './components/ProjectDetailModal';
import ModelComparisonView from './components/ModelComparisonView';
import RiskSimulator from './components/RiskSimulator';
import PaimanaHistoricalView from './components/PaimanaHistoricalView';
import AIAssistantModal from './components/AIAssistantModal';
import { AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, History, ExternalLink, Sparkles, Bot } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'historical', 'directory', 'ml-analytics', 'simulator'
  
  // Global Data states
  const [kpiData, setKpiData] = useState(null);
  const [statesAnalytics, setStatesAnalytics] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  
  // Project list states
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Selected detail modal
  const [selectedProject, setSelectedProject] = useState(null);
  
  // AI Assistant Copilot Modal state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Filter states
  const [selectedState, setSelectedState] = useState(null);
  const [scoreMode, setScoreMode] = useState('rule'); // 'rule', 'ml', 'both'
  const [filters, setFilters] = useState({
    search: '',
    sector: 'All',
    ministry: 'All',
    state: 'All',
    risk_tier: 'All',
    status: 'All',
    sort_by: 'risk_score_desc',
  });

  // Fetch all analytics including official PAIMANA historical data
  const fetchGlobalAnalytics = async () => {
    try {
      const [kpisRes, statesRes, sectorsRes, compRes, histRes] = await Promise.all([
        fetch('https://infrasankalp-api.onrender.com/api/analytics/kpis'),
        fetch('https://infrasankalp-api.onrender.com/api/analytics/states'),
        fetch('https://infrasankalp-api.onrender.com/api/analytics/sectors'),
        fetch('https://infrasankalp-api.onrender.com/api/analytics/model-comparison'),
        fetch('https://infrasankalp-api.onrender.com/api/analytics/paimana-historical'),
      ]);
      const kpis = await kpisRes.json();
      const states = await statesRes.json();
      const sectors = await sectorsRes.json();
      const comp = await compRes.json();
      const hist = await histRes.json();

      setKpiData(kpis);
      setStatesAnalytics(states);
      setSectorData(sectors);
      setComparisonData(comp);
      setHistoricalData(hist);
    } catch (err) {
      console.error('Error loading global analytics:', err);
    }
  };

  // Fetch projects with current filters
  const fetchProjects = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '25',
        score_mode: scoreMode === 'both' ? 'rule' : scoreMode,
        sort_by: filters.sort_by,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.sector !== 'All') params.append('sector', filters.sector);
      if (filters.ministry !== 'All') params.append('ministry', filters.ministry);
      if (filters.state !== 'All') params.append('state', filters.state);
      if (filters.risk_tier !== 'All') params.append('risk_tier', filters.risk_tier);
      if (filters.status !== 'All') params.append('status', filters.status);

      const res = await fetch(`https://infrasankalp-api.onrender.com/api/projects?${params.toString()}`);
      const data = await res.json();
      setProjects(data.projects || []);
      setTotalProjects(data.total || 0);
      setCurrentPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAnalytics();
  }, []);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [filters, scoreMode, currentPage]);

  const handleSelectState = (stateName) => {
    setSelectedState(stateName);
    setFilters((prev) => ({
      ...prev,
      state: stateName || 'All',
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'state') {
      setSelectedState(value === 'All' ? null : value);
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedState(null);
    setFilters({
      search: '',
      sector: 'All',
      ministry: 'All',
      state: 'All',
      risk_tier: 'All',
      status: 'All',
      sort_by: 'risk_score_desc',
    });
    setCurrentPage(1);
  };

  const handleSelectSector = (sec) => {
    handleFilterChange('sector', sec);
    setActiveTab('directory');
  };

  // 1-Click Interactive KPI Quick Filter
  const handleQuickFilter = (type) => {
    if (type === 'all') {
      handleResetFilters();
    } else if (type === 'high_risk') {
      handleFilterChange('risk_tier', 'High');
    } else if (type === 'delayed') {
      handleFilterChange('status', 'Delayed');
    } else if (type === 'overrun') {
      handleFilterChange('sort_by', 'cost_overrun_desc');
    } else if (type === 'mega') {
      handleFilterChange('sort_by', 'outlay_desc');
    }
    setActiveTab('directory');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Government PAIMANA & InfraSankalp Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onRefresh={() => {
          fetchGlobalAnalytics();
          fetchProjects(1);
        }}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* National Flash Report KPI Ribbon with 1-Click Quick Filtering */}
        <KpiSummary kpiData={kpiData} onQuickFilter={handleQuickFilter} />

        {/* Tab 1: Flash Report Overview & Spatial Map */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Interactive India Map */}
            <IndiaMap
              statesAnalytics={statesAnalytics}
              selectedState={selectedState}
              onSelectState={handleSelectState}
              onNavigateToDirectory={() => setActiveTab('directory')}
            />

            {/* Sector Portfolio Distribution */}
            <SectorOverview
              sectorData={sectorData}
              onSelectSector={handleSelectSector}
            />

            {/* Priority Projects Spotlight */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Priority Infrastructure Portfolios Requiring Administrative Review
                  </h3>
                </div>
                <button
                  onClick={() => {
                    handleFilterChange('risk_tier', 'High');
                    setActiveTab('directory');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All High Risk Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {projects
                  .filter((p) => p.rule_risk_tier === 'High')
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.project_id}
                      onClick={() => setSelectedProject(p)}
                      className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start text-[11px] mb-1">
                          <span className="font-mono font-bold text-slate-700">{p.project_id}</span>
                          <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            Score: {p.rule_risk_score}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {p.project_name}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-1">{p.state} • ₹{Math.round(p.revised_cost_cr)} Cr</div>
                        
                        <p className="mt-2 text-[11px] text-slate-700 bg-white/90 p-2 rounded border border-red-100 line-clamp-2">
                          {p.explanation}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-red-100/80 flex items-center justify-between text-[11px]">
                        <span className="text-red-700 font-semibold">+{p.cost_overrun_pct}% cost overrun</span>
                        <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PAIMANA Historical Past Data (2020–2026) */}
        {activeTab === 'historical' && (
          <PaimanaHistoricalView historicalData={historicalData} />
        )}

        {/* Tab 3: Project Directory & Performance Monitoring */}
        {activeTab === 'directory' && (
          <ProjectTable
            projects={projects}
            loading={loading}
            totalProjects={totalProjects}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            scoreMode={scoreMode}
            setScoreMode={setScoreMode}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        )}

        {/* Tab 4: ML vs Rule Analytics */}
        {activeTab === 'ml-analytics' && (
          <ModelComparisonView comparisonData={comparisonData} />
        )}

        {/* Tab 5: Risk Simulator */}
        {activeTab === 'simulator' && <RiskSimulator />}
      </main>

      {/* Deep-Dive Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* AI Assistant Copilot Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectProject={(proj) => {
          setSelectedProject(proj);
        }}
      />

      {/* Floating AI Assistant Copilot Trigger */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 ring-4 ring-amber-400/30 group"
        title="Ask InfraSankalp AI Assistant"
      >
        <div className="w-7 h-7 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
          <Bot className="w-4 h-4" />
        </div>
        <div className="text-left leading-none">
          <div className="text-xs font-black tracking-tight">AI Copilot</div>
          <div className="text-[10px] text-slate-900 font-medium">Search & Explain</div>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
      </button>

      {/* Official Government Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>PAIMANA • InfraSankalp</strong> (इन्फ्रासंकल्प) — Central Sector Infrastructure Risk Monitoring & Explainability Platform.
          </div>
          <div className="text-slate-400">
            Ministry of Statistics and Programme Implementation (MoSPI) • Government of India
          </div>
        </div>
      </footer>
    </div>
  );
}
