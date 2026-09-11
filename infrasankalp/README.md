# InfraSankalp (इन्फ्रासंकल्प) — National Infrastructure Risk & Performance Intelligence Portal

> An AI-powered risk monitoring, explainability, and intelligent copilot dashboard for India's central-sector infrastructure projects, inspired by and improving on the Ministry of Statistics and Programme Implementation's (**MoSPI**) PAIMANA portal (`ipm.mospi.gov.in` / `paimana-proj.mospi.gov.in`).

---

## 🏛️ Context & Core Differentiator

MoSPI tracks ~1,987 central sector infrastructure projects worth ₹42.5 lakh crore across 17 ministries. While standard portals rely on opaque status tags or simple threshold flags without per-project explanation, **InfraSankalp's key differentiator is Explainable Risk Scoring (XAI) & Conversational Project Intelligence** — every flagged project shows exactly why it was flagged, the mathematical contribution of each risk factor, actionable governance mitigations, and an on-demand AI Copilot for project-level inquiries.

---

## 🤖 InfraSankalp AI Copilot Assistant

InfraSankalp includes a built-in AI Infrastructure Intelligence Assistant accessible from the header and a floating trigger button:
- 📋 **Project ID & Name Search**: Instantly query dossiers by project ID (e.g. `INFR-RT0002`) or project title.
- 🔍 **Plain-Language Explainability**: Unpacks the diagnostic reasons behind risk scores (cost escalations, missed milestones, financial progress gaps).
- 📍 **State & Sector Portfolio Briefings**: Natural language breakdowns for any Indian state or infrastructure sector.
- 🛑 **MoSPI Root-Cause Bottleneck Analysis**: Explains statutory clearance bottlenecks (Land acquisition 37.5%, Forest clearances 23.8%, Contractor distress 16.4%, Utility shifting 12.2%, Scope revision 10.1%).
- 🃏 **Interactive Project Cards**: Embedded preview cards inside the chat that drill directly into deep-dive project modals with 1 click.

---

## 📊 Calibrated Synthetic Data Layer

The synthetic dataset of **450 projects** was calibrated using `backend/data_generator.py` with a fixed random seed (`SEED = 42`) to reproduce official published MoSPI / PIB aggregate statistics:

| Calibration Metric | Official MoSPI / PIB Target | InfraSankalp Calibrated Value | Parity Status |
| :--- | :--- | :--- | :--- |
| **Monitored Outlay Scale** | ₹42.5 Lakh Cr / 1,987 (~₹2,139 Cr/proj) | Mean: **₹2,282.0 Cr/proj** (₹10.27 Lakh Cr sample) | ✅ Calibrated |
| **Cumulative Expenditure Ratio** | **~51%** | **51.05%** | ✅ Calibrated |
| **Physical Progress > 80%** | **~41%** of projects | **41.11%** (185 projects) | ✅ Calibrated |
| **Financial Completion > 80%** | **~14%** of projects | **14.22%** (64 projects) | ✅ Calibrated |
| **Transport & Energy Sector Dominance** | **70% - 80%** combined | **72.67%** (327 projects) | ✅ Calibrated |

> **Mandatory Transparency Disclosure (Visible in-app):**  
> *"Synthetic data calibrated against official MoSPI/PIB aggregate statistics (2020–2026) — granular project-level data is not publicly downloadable."*

---

## 📜 PAIMANA Past Data Layer (2020–2026)

InfraSankalp incorporates **13 official reporting epochs** from MoSPI Flash Reports spanning 2020 to 2026:
- **Historical Trajectory**: Tracks total monitored projects, cost overruns (from 21.6% down to 15.3%), and delayed project ratios over 6 years.
- **Milestone Delivery Tracking**: Analysis of 4,000+ statutory milestones and the 5 primary clearance bottleneck drivers.
- **Cost Variance Trendlines**: Interactive Recharts time-series visualizations comparing original sanctioned vs anticipated completion outlays.

---

## ⚙️ Dual Risk Scoring & Explainability Engine

InfraSankalp implements **two scoring engines side-by-side** for comparison:

### 1. Rule-Based Composite Score (0 - 100)
A deterministic weighted sum across 4 critical risk dimensions:
1. **Cost Variance %** (`weight: 0.35`) — `(revised_cost - original_cost) / original_cost`
2. **Schedule Slippage** (`weight: 0.25`) — `(elapsed_time / planned_duration)` normalized against physical deliverables and overdue penalties
3. **Physical-to-Financial Progress Gap** (`weight: 0.25`) — `financial_progress_pct - actual_progress_pct` (funds disbursed ahead of physical output)
4. **Missed Milestone Streak** (`weight: 0.15`) — ratio of missed milestones and duration of recent delays

**Risk Tiers:**
- 🟢 **Low Risk**: 0 – 31.9
- 🟡 **Medium Risk**: 32.0 – 59.9
- 🔴 **High Risk**: 60.0 – 100

### 2. Machine Learning Predictive Model (Scikit-Learn Random Forest)
- **Model**: `RandomForestClassifier` (100 calibrated estimator trees)
- **Features**: Cost overrun %, elapsed ratio, physical progress %, financial progress %, progress gap, milestone miss ratio, last delay days, logarithmic capital scale, sector encoding.
- **Evaluation Metrics**:
  - **Accuracy**: 98.9%
  - **Precision**: 94.7%
  - **Recall**: 100.0%
  - **F1 Score**: 97.3%
  - **ROC-AUC**: 1.0
  - **Model Concordance**: 73.3% agreement with rule-based tiers (with 120 nuanced divergences where ML flags early latent risks ahead of formal budget revision).

### 3. Plain-Language Explainability String Generator
For every project flagged Medium or High Risk, InfraSankalp synthesizes a human-readable attribution string:
> *"Flagged High Risk: 52.8% cost overrun (contributed +30.1 pts), 3 missed milestone(s) with 197d delay (contributed +10.4 pts), +8.9pp physical-financial gap (contributed +10.8 pts), ~5.4mo schedule slippage vs elapsed timeline (contributed +19.0 pts) (Total Composite: 70.3/100)."*

---

## 🖥️ Dashboard Features

1. **AI Copilot Assistant Modal**: Semantic search and reasoning engine with quick-prompt chips, Markdown formatting, and interactive project cards.
2. **PAIMANA Historical View (2020–2026)**: Multi-year macro trajectory, statutory delay root cause breakdown, and milestone velocity.
3. **Executive KPI Summary Ribbon**: Total monitored cohort, outlay, expenditure ratio, high-risk flags, cost overrun %, and expandable MoSPI calibration audit.
4. **Interactive India Map (State-Wise)**: Color-coded SVG nodes for all 28 states & UTs showing risk intensity, hover telemetry tooltips, and click-to-filter state drill-down.
5. **Filterable Project Directory**: Search by name/agency/ID, filter by sector, ministry, state, risk tier, or status; toggle between **Rule Score**, **ML Score**, and **Side-by-Side** comparison.
6. **Deep-Dive Project Detail Modal**: Component attribution bars (showing exact points / 100), dual-model comparison card, Recharts cost dynamics, physical vs financial gap gauges, and targeted governance mitigations.
7. **Model Analytics Tab**: Confusion matrix, classification metrics, feature importance ranking, and concordance rate analysis.
8. **Risk Simulator Sandbox**: Real-time interactive playground to test hypothetical projects with live scoring and explainability.

---

## 🚀 Quickstart & Execution

### 1. Launch Backend (FastAPI on port 8000)
```bash
cd infrawatch
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```

### 2. Launch Frontend (Vite React on port 5173)
```bash
cd infrawatch/frontend
npm run dev
```

Visit **`http://localhost:5173`** to access the interactive dashboard.
Or visit **`http://localhost:8000`** to access the unified demo deployment!

### 3. Run Automated Calibration & Endpoint Tests
```bash
cd infrawatch
python backend/test_backend.py
```
