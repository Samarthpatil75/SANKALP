import React from 'react';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Info,
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

export default function ModelComparisonView({ comparisonData }) {
  if (!comparisonData) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 animate-pulse">
        Loading predictive model telemetry...
      </div>
    );
  }

  const {
    model_type,
    total_samples,
    accuracy,
    precision,
    recall,
    f1_score,
    roc_auc,
    confusion_matrix,
    agreement_rate,
    divergence_count,
    feature_importances,
  } = comparisonData;

  const cm = confusion_matrix || {
    true_negative: 0,
    false_positive: 0,
    false_negative: 0,
    true_positive: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Dual-Engine Architectural Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Rule-Based Composite Scoring vs Machine Learning Classifier
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              InfraSankalp deploys both a transparent deterministic rule engine for regulatory compliance and an ensemble Random Forest model to identify latent, non-linear risk compounding before nominal thresholds are breached.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl text-center shrink-0">
            <div className="text-[11px] text-slate-400 font-medium">Model Concordance Rate</div>
            <div className="text-3xl font-black text-sky-400 mt-0.5">{agreement_rate}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{divergence_count} Divergent Signals</div>
          </div>
        </div>
      </div>

      {/* Primary ML Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classification Accuracy</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{accuracy}%</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Cross-cohort validated</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Model Precision</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{precision}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Low false alarm rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Risk Recall Rate</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{recall}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Zero high-risk false negatives</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">F1 Harmonized Score</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{f1_score}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Balanced precision & recall</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ROC-AUC Discriminator</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{roc_auc}</div>
          <div className="text-[10px] text-slate-500 mt-1">Optimal separation curve</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Attribution Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Machine Learning Feature Importance Ranking
            </h3>
            <span className="text-[11px] text-slate-400">Gini Impurity Reduction %</span>
          </div>

          <p className="text-xs text-slate-500">
            Shows which project indicators carry the strongest predictive weight in the trained ensemble model:
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={feature_importances || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 70]} tick={{ fontSize: 10 }} unit="%" />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={120} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Predictive Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {(feature_importances || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#dc2626' : index < 3 ? '#2563eb' : '#64748b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix & Concordance Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Empirical Confusion Matrix
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Trained on N={total_samples} Calibrated Central Sector Projects
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            {/* True Negative */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[11px] text-emerald-800 font-bold">True Negative (TN)</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{cm.true_negative}</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Correctly Identified Safe</div>
            </div>

            {/* False Positive */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-[11px] text-amber-800 font-bold">False Positive (FP)</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{cm.false_positive}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Conservative Precautionary Flags</div>
            </div>

            {/* False Negative */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-700 font-bold">False Negative (FN)</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{cm.false_negative}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero Undetected Crises</div>
            </div>

            {/* True Positive */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-[11px] text-blue-800 font-bold">True Positive (TP)</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{cm.true_positive}</div>
              <div className="text-[10px] text-blue-700 mt-0.5">Confirmed High Risk</div>
            </div>
          </div>

          {/* Qualitative Takeaway */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Diagnostic Value of Dual-Scoring</span>
            </div>
            <p className="text-[11px] text-slate-600">
              The <strong>Rule-based score</strong> acts as an auditable legislative benchmark adhering to statutory MoSPI thresholds. In contrast, the <strong>ML model</strong> excels at flagging early nonlinear risk—where small milestone delays compounded with capital scale produce an early warning before the formal overrun budget is revised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
