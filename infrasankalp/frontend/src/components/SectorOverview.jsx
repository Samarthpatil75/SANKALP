import React from 'react';
import { Layers, ArrowRight, ShieldAlert, TrendingUp } from 'lucide-react';

export default function SectorOverview({ sectorData, onSelectSector }) {
  if (!sectorData || sectorData.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Sectoral Portfolio & Risk Allocations</span>
          </h3>
          <p className="text-xs text-slate-500">
            Transport & Logistics and Energy dominate ~73% of monitored capital outlay.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sectorData.map((sec) => {
          const isTransport = ['Road Transport', 'Railways'].includes(sec.sector);
          const isEnergy = ['Power', 'Petroleum & Gas', 'Coal'].includes(sec.sector);

          return (
            <div
              key={sec.sector}
              onClick={() => onSelectSector(sec.sector)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{sec.sector}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isTransport
                        ? 'bg-blue-100 text-blue-800'
                        : isEnergy
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isTransport ? 'Transport' : isEnergy ? 'Energy' : 'Urban/Jal'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{sec.ministry}</div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900">₹{sec.total_outlay_lakh_cr}L Cr</span>
                  <span className="text-xs font-semibold text-slate-600">{sec.project_count} proj</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Avg Risk: <strong className="text-slate-800">{sec.avg_risk_score}</strong>
                </span>
                {sec.high_risk_count > 0 ? (
                  <span className="text-red-600 font-bold flex items-center gap-0.5">
                    <ShieldAlert className="w-3 h-3" />
                    {sec.high_risk_count} critical
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">Nominal</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
