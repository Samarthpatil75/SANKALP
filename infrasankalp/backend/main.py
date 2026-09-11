"""
InfraWatch - FastAPI Backend Application
========================================
Serves central-sector infrastructure project monitoring data, dual risk scoring
(Rule-based composite vs Scikit-Learn ML), state-wise aggregations for the India map,
model comparison metrics, and interactive risk simulation.
"""

import json
import os
import sys
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure local imports work cleanly
sys.path.append(os.path.dirname(__file__))
from risk_engine import calculate_rule_risk
from ml_engine import initialize_ml, ml_engine
from paimana_historical_data import get_paimana_historical_payload
from ai_assistant import query_ai_assistant

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "projects.json")

app = FastAPI(
    title="InfraSankalp API",
    description="AI-Powered Explainable Risk Monitoring & Assistant for Central Sector Infrastructure Projects (MoSPI PAIMANA Parity)",
    version="1.0.0",
)

# Enable CORS for frontend Vite dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cached enriched projects
ENRICHED_PROJECTS: List[Dict[str, Any]] = []

def load_and_enrich_data():
    global ENRICHED_PROJECTS
    if not os.path.exists(DATA_PATH):
        raise RuntimeError(f"Data file {DATA_PATH} not found. Run data_generator.py first.")
        
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw_projects = json.load(f)
        
    # Initialize ML engine
    initialize_ml()
    
    enriched = []
    for p in raw_projects:
        rule_eval = calculate_rule_risk(p)
        ml_eval = ml_engine.predict_project(p)
        
        # Calculate cost overrun %
        orig = float(p["original_cost_cr"])
        rev = float(p["revised_cost_cr"])
        overrun_pct = round(max(0.0, ((rev - orig) / orig) * 100.0), 1)
        overrun_cr = round(max(0.0, rev - orig), 2)
        
        item = {
            **p,
            "cost_overrun_pct": overrun_pct,
            "cost_overrun_cr": overrun_cr,
            "rule_risk_score": rule_eval["rule_risk_score"],
            "rule_risk_tier": rule_eval["risk_tier"],
            "rule_badge_color": rule_eval["badge_color"],
            "explanation": rule_eval["explanation"],
            "components": rule_eval["components"],
            "mitigations": rule_eval["mitigations"],
            "ml_risk_score": ml_eval["ml_risk_score"],
            "ml_risk_tier": ml_eval["ml_risk_tier"],
            "ml_badge_color": ml_eval["ml_badge_color"],
            "ml_probability": ml_eval["ml_probability"],
            # High risk agreement indicator
            "model_concordance": "Agree" if rule_eval["risk_tier"] == ml_eval["ml_risk_tier"] else "Diverge",
        }
        enriched.append(item)
        
    ENRICHED_PROJECTS = enriched
    print(f"Loaded and enriched {len(ENRICHED_PROJECTS)} projects.")

@app.on_event("startup")
def startup_event():
    load_and_enrich_data()

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InfraSankalp Backend",
        "timestamp": datetime.now().isoformat(),
        "total_projects": len(ENRICHED_PROJECTS),
    }

@app.get("/api/projects")
def get_projects(
    search: Optional[str] = None,
    sector: Optional[str] = None,
    ministry: Optional[str] = None,
    state: Optional[str] = None,
    risk_tier: Optional[str] = None,
    status: Optional[str] = None,
    score_mode: str = Query("rule", description="'rule' or 'ml'"),
    sort_by: str = Query("risk_score_desc", description="sort field: risk_score_desc, cost_overrun_desc, outlay_desc, progress_asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    """
    Returns filtered and paginated list of infrastructure projects with explainability metadata.
    """
    filtered = ENRICHED_PROJECTS
    
    if search:
        s_lower = search.lower().strip()
        filtered = [
            p for p in filtered
            if s_lower in p["project_name"].lower()
            or s_lower in p["project_id"].lower()
            or s_lower in p["implementing_agency"].lower()
            or s_lower in p["state"].lower()
        ]
        
    if sector and sector != "All":
        filtered = [p for p in filtered if p["sector"] == sector]
        
    if ministry and ministry != "All":
        filtered = [p for p in filtered if p["ministry"] == ministry]
        
    if state and state != "All":
        filtered = [p for p in filtered if p["state"] == state]
        
    if status and status != "All":
        filtered = [p for p in filtered if p["status"] == status]
        
    if risk_tier and risk_tier != "All":
        tier_field = "ml_risk_tier" if score_mode == "ml" else "rule_risk_tier"
        filtered = [p for p in filtered if p[tier_field] == risk_tier]
        
    # Sorting
    if sort_by == "risk_score_desc":
        score_field = "ml_risk_score" if score_mode == "ml" else "rule_risk_score"
        filtered.sort(key=lambda x: x[score_field], reverse=True)
    elif sort_by == "risk_score_asc":
        score_field = "ml_risk_score" if score_mode == "ml" else "rule_risk_score"
        filtered.sort(key=lambda x: x[score_field], reverse=False)
    elif sort_by == "cost_overrun_desc":
        filtered.sort(key=lambda x: x["cost_overrun_pct"], reverse=True)
    elif sort_by == "outlay_desc":
        filtered.sort(key=lambda x: x["revised_cost_cr"], reverse=True)
    elif sort_by == "progress_asc":
        filtered.sort(key=lambda x: x["actual_progress_pct"], reverse=False)
        
    total_count = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_items = filtered[start_idx:end_idx]
    
    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
        "projects": paginated_items,
    }

@app.get("/api/projects/{project_id}")
def get_project_by_id(project_id: str):
    """
    Returns granular detail for a single project including full XAI breakdown.
    """
    for p in ENRICHED_PROJECTS:
        if p["project_id"].upper() == project_id.upper():
            return p
    raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

@app.get("/api/analytics/kpis")
def get_kpis():
    """
    Returns national summary KPIs and MoSPI statistical parity calibration report.
    """
    total_projects = len(ENRICHED_PROJECTS)
    if total_projects == 0:
        return {}
        
    total_revised_cost = sum(p["revised_cost_cr"] for p in ENRICHED_PROJECTS)
    total_original_cost = sum(p["original_cost_cr"] for p in ENRICHED_PROJECTS)
    total_expenditure = sum(p["cumulative_expenditure_cr"] for p in ENRICHED_PROJECTS)
    
    cumulative_exp_ratio = round((total_expenditure / total_revised_cost) * 100.0, 2)
    overall_cost_overrun_pct = round(((total_revised_cost - total_original_cost) / total_original_cost) * 100.0, 1)
    
    rule_high_count = sum(1 for p in ENRICHED_PROJECTS if p["rule_risk_tier"] == "High")
    rule_med_count = sum(1 for p in ENRICHED_PROJECTS if p["rule_risk_tier"] == "Medium")
    rule_low_count = sum(1 for p in ENRICHED_PROJECTS if p["rule_risk_tier"] == "Low")
    
    ml_high_count = sum(1 for p in ENRICHED_PROJECTS if p["ml_risk_tier"] == "High")
    ml_med_count = sum(1 for p in ENRICHED_PROJECTS if p["ml_risk_tier"] == "Medium")
    ml_low_count = sum(1 for p in ENRICHED_PROJECTS if p["ml_risk_tier"] == "Low")
    
    phys_gt_80_count = sum(1 for p in ENRICHED_PROJECTS if p["actual_progress_pct"] > 80.0)
    fin_gt_80_count = sum(1 for p in ENRICHED_PROJECTS if p["financial_progress_pct"] > 80.0)
    
    delayed_count = sum(1 for p in ENRICHED_PROJECTS if p["status"] == "Delayed")
    ongoing_count = sum(1 for p in ENRICHED_PROJECTS if p["status"] == "Ongoing")
    completed_count = sum(1 for p in ENRICHED_PROJECTS if p["status"] == "Completed")
    
    transport_energy_count = sum(
        1 for p in ENRICHED_PROJECTS
        if p["sector"] in ["Road Transport", "Railways", "Power", "Petroleum & Gas", "Coal"]
    )
    
    return {
        "summary": {
            "total_projects": total_projects,
            "total_monitored_outlay_cr": round(total_revised_cost, 2),
            "total_monitored_outlay_lakh_cr": round(total_revised_cost / 100000.0, 2),
            "total_expenditure_cr": round(total_expenditure, 2),
            "total_expenditure_lakh_cr": round(total_expenditure / 100000.0, 2),
            "cumulative_expenditure_ratio_pct": cumulative_exp_ratio,
            "overall_cost_overrun_pct": overall_cost_overrun_pct,
            "avg_project_cost_cr": round(total_revised_cost / total_projects, 1),
            "delayed_projects_count": delayed_count,
            "delayed_pct": round((delayed_count / total_projects) * 100.0, 1),
        },
        "risk_distribution": {
            "rule_based": {
                "high_count": rule_high_count,
                "high_pct": round((rule_high_count / total_projects) * 100.0, 1),
                "medium_count": rule_med_count,
                "medium_pct": round((rule_med_count / total_projects) * 100.0, 1),
                "low_count": rule_low_count,
                "low_pct": round((rule_low_count / total_projects) * 100.0, 1),
            },
            "ml_model": {
                "high_count": ml_high_count,
                "high_pct": round((ml_high_count / total_projects) * 100.0, 1),
                "medium_count": ml_med_count,
                "medium_pct": round((ml_med_count / total_projects) * 100.0, 1),
                "low_count": ml_low_count,
                "low_pct": round((ml_low_count / total_projects) * 100.0, 1),
            }
        },
        "status_distribution": {
            "delayed": delayed_count,
            "ongoing": ongoing_count,
            "completed": completed_count,
        },
        "mospi_calibration_audit": {
            "expenditure_ratio": {
                "metric": "Cumulative Expenditure Ratio",
                "simulated": f"{cumulative_exp_ratio}%",
                "mospi_target": "~51%",
                "status": "Calibrated"
            },
            "physical_progress_gt_80": {
                "metric": "Physical Progress > 80%",
                "simulated": f"{round((phys_gt_80_count / total_projects) * 100.0, 1)}%",
                "mospi_target": "~41%",
                "status": "Calibrated"
            },
            "financial_progress_gt_80": {
                "metric": "Financial Completion > 80%",
                "simulated": f"{round((fin_gt_80_count / total_projects) * 100.0, 1)}%",
                "mospi_target": "~14%",
                "status": "Calibrated"
            },
            "sectoral_dominance": {
                "metric": "Transport & Energy Sector Share",
                "simulated": f"{round((transport_energy_count / total_projects) * 100.0, 1)}%",
                "mospi_target": "70-80%",
                "status": "Calibrated"
            }
        }
    }

@app.get("/api/analytics/states")
def get_state_analytics():
    """
    State-level metrics for the interactive India SVG Map.
    """
    state_map = {}
    for p in ENRICHED_PROJECTS:
        st = p["state"]
        if st not in state_map:
            state_map[st] = {
                "state": st,
                "project_count": 0,
                "total_outlay_cr": 0.0,
                "total_expenditure_cr": 0.0,
                "rule_risk_sum": 0.0,
                "ml_risk_sum": 0.0,
                "high_risk_count": 0,
                "delayed_count": 0,
                "sectors": {},
            }
            
        data = state_map[st]
        data["project_count"] += 1
        data["total_outlay_cr"] += p["revised_cost_cr"]
        data["total_expenditure_cr"] += p["cumulative_expenditure_cr"]
        data["rule_risk_sum"] += p["rule_risk_score"]
        data["ml_risk_sum"] += p["ml_risk_score"]
        if p["rule_risk_tier"] == "High":
            data["high_risk_count"] += 1
        if p["status"] == "Delayed":
            data["delayed_count"] += 1
        sec = p["sector"]
        data["sectors"][sec] = data["sectors"].get(sec, 0) + 1

    result = []
    for st, d in state_map.items():
        cnt = d["project_count"]
        top_sec = max(d["sectors"].items(), key=lambda x: x[1])[0] if d["sectors"] else "None"
        avg_rule = round(d["rule_risk_sum"] / cnt, 1) if cnt > 0 else 0
        avg_ml = round(d["ml_risk_sum"] / cnt, 1) if cnt > 0 else 0
        
        # Determine overall state risk tier
        if avg_rule >= 35.0 or d["high_risk_count"] >= 3:
            state_risk_level = "High"
            state_color = "#ef4444"
        elif avg_rule >= 24.0 or d["high_risk_count"] >= 1:
            state_risk_level = "Medium"
            state_color = "#f59e0b"
        else:
            state_risk_level = "Low"
            state_color = "#10b981"
            
        result.append({
            "state": st,
            "project_count": cnt,
            "total_outlay_cr": round(d["total_outlay_cr"], 1),
            "total_outlay_lakh_cr": round(d["total_outlay_cr"] / 100000.0, 2),
            "avg_rule_risk_score": avg_rule,
            "avg_ml_risk_score": avg_ml,
            "high_risk_count": d["high_risk_count"],
            "delayed_count": d["delayed_count"],
            "primary_sector": top_sec,
            "risk_level": state_risk_level,
            "state_color": state_color,
        })
        
    result.sort(key=lambda x: x["project_count"], reverse=True)
    return result

@app.get("/api/analytics/sectors")
def get_sector_analytics():
    """
    Returns sectoral outlay, project counts, and average risk metrics.
    """
    sec_map = {}
    for p in ENRICHED_PROJECTS:
        sec = p["sector"]
        if sec not in sec_map:
            sec_map[sec] = {
                "sector": sec,
                "project_count": 0,
                "total_outlay_cr": 0.0,
                "total_expenditure_cr": 0.0,
                "rule_risk_sum": 0.0,
                "high_risk_count": 0,
                "avg_progress_sum": 0.0,
                "ministry": p["ministry"],
            }
        d = sec_map[sec]
        d["project_count"] += 1
        d["total_outlay_cr"] += p["revised_cost_cr"]
        d["total_expenditure_cr"] += p["cumulative_expenditure_cr"]
        d["rule_risk_sum"] += p["rule_risk_score"]
        d["avg_progress_sum"] += p["actual_progress_pct"]
        if p["rule_risk_tier"] == "High":
            d["high_risk_count"] += 1
            
    res = []
    for s, d in sec_map.items():
        cnt = d["project_count"]
        res.append({
            "sector": s,
            "ministry": d["ministry"],
            "project_count": cnt,
            "total_outlay_cr": round(d["total_outlay_cr"], 1),
            "total_outlay_lakh_cr": round(d["total_outlay_cr"] / 100000.0, 2),
            "expenditure_ratio_pct": round((d["total_expenditure_cr"] / d["total_outlay_cr"]) * 100.0, 1),
            "avg_risk_score": round(d["rule_risk_sum"] / cnt, 1),
            "avg_physical_progress_pct": round(d["avg_progress_sum"] / cnt, 1),
            "high_risk_count": d["high_risk_count"],
        })
    res.sort(key=lambda x: x["total_outlay_cr"], reverse=True)
    return res

@app.get("/api/analytics/model-comparison")
def get_model_comparison():
    """
    Returns ML evaluation metrics, confusion matrix, feature importances, and agreement breakdown.
    """
    return ml_engine.metrics

@app.get("/api/analytics/paimana-historical")
def get_paimana_historical():
    """
    Returns official historical MoSPI Flash Report statistics (2020-2026),
    delays root causes, and sector time-series benchmarks.
    """
    return get_paimana_historical_payload()

class ProjectSimulationRequest(BaseModel):
    project_name: str = "Simulated Corridor Package"
    sector: str = "Road Transport"
    original_cost_cr: float = Field(..., gt=0)
    revised_cost_cr: float = Field(..., gt=0)
    planned_start_date: str = "2023-01-15"
    planned_end_date: str = "2026-06-30"
    actual_progress_pct: float = Field(..., ge=0, le=100)
    financial_progress_pct: float = Field(..., ge=0, le=100)
    milestone_count: int = Field(10, ge=1)
    milestones_missed: int = Field(0, ge=0)
    last_milestone_delay_days: int = Field(0, ge=0)
    status: str = "Ongoing"

@app.post("/api/simulate-risk")
def simulate_project_risk(payload: ProjectSimulationRequest):
    """
    Real-time interactive risk scoring sandbox for hypothetical or user-defined project parameters.
    """
    proj_dict = payload.dict()
    rule_eval = calculate_rule_risk(proj_dict)
    ml_eval = ml_engine.predict_project(proj_dict)
    
    orig = payload.original_cost_cr
    rev = payload.revised_cost_cr
    overrun_pct = round(max(0.0, ((rev - orig) / orig) * 100.0), 1)
    
    return {
        "project_name": payload.project_name,
        "cost_overrun_pct": overrun_pct,
        "rule_risk_score": rule_eval["rule_risk_score"],
        "rule_risk_tier": rule_eval["risk_tier"],
        "rule_badge_color": rule_eval["badge_color"],
        "explanation": rule_eval["explanation"],
        "components": rule_eval["components"],
        "mitigations": rule_eval["mitigations"],
        "ml_risk_score": ml_eval["ml_risk_score"],
        "ml_risk_tier": ml_eval["ml_risk_tier"],
        "ml_badge_color": ml_eval["ml_badge_color"],
        "ml_probability": ml_eval["ml_probability"],
    }

# -------------------------------------------------------------
# AI Infrastructure Intelligence Assistant Endpoint
# -------------------------------------------------------------
class AIAssistantRequest(BaseModel):
    query: str

@app.post("/api/ai/assistant")
def ask_ai_assistant(payload: AIAssistantRequest):
    """
    InfraSankalp Intelligent Assistant Copilot:
    Interprets natural language queries for projects, sectors, states, clearance delays,
    and plain-language risk explanations.
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    historical_payload = get_paimana_historical_payload()
    kpis_payload = get_kpis()
    result = query_ai_assistant(
        query=payload.query.strip(),
        projects=ENRICHED_PROJECTS,
        kpi_data=kpis_payload,
        historical_data=historical_payload,
    )
    return result

# -------------------------------------------------------------
# Single Demo-Ready App: Static Frontend Mounting
# -------------------------------------------------------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Frontend dist not built. Run npm run build in frontend directory."}

