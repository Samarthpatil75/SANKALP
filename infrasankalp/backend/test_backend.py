"""
InfraWatch - Automated Calibration & Endpoint Tests
===================================================
Validates:
1. MoSPI aggregate statistical calibrations:
   - Cumulative expenditure ratio within 51.0% ± 1.5%
   - Physical progress > 80% within 41.0% ± 2.0%
   - Financial completion > 80% within 14.0% ± 2.0%
   - Transport & Energy sectoral share within 70% - 80%
2. Rule-Based scoring and XAI text generation
3. ML model metrics and feature importances
4. REST API responses for all endpoints
"""

import sys
import os
import json
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(__file__))
from main import app, ENRICHED_PROJECTS, load_and_enrich_data

client = TestClient(app)

def test_calibration_statistics():
    load_and_enrich_data()
    res = client.get("/api/analytics/kpis")
    assert res.status_code == 200
    data = res.json()
    
    summary = data["summary"]
    calib = data["mospi_calibration_audit"]
    
    total = summary["total_projects"]
    assert total == 450, f"Expected 450 projects, got {total}"
    
    # 1. Cumulative Expenditure Ratio (~51%)
    exp_ratio = summary["cumulative_expenditure_ratio_pct"]
    assert 49.5 <= exp_ratio <= 52.5, f"Expenditure ratio {exp_ratio}% outside calibrated bounds 49.5 - 52.5%"
    
    # 2. Physical Progress > 80% (~41%)
    phys_gt_80_str = calib["physical_progress_gt_80"]["simulated"].replace("%", "")
    phys_gt_80 = float(phys_gt_80_str)
    assert 39.0 <= phys_gt_80 <= 43.0, f"Physical progress >80% ({phys_gt_80}%) outside calibrated bounds 39.0 - 43.0%"
    
    # 3. Financial Completion > 80% (~14%)
    fin_gt_80_str = calib["financial_progress_gt_80"]["simulated"].replace("%", "")
    fin_gt_80 = float(fin_gt_80_str)
    assert 12.5 <= fin_gt_80 <= 16.0, f"Financial progress >80% ({fin_gt_80}%) outside calibrated bounds 12.5 - 16.0%"
    
    # 4. Sectoral Share (70 - 80%)
    sector_str = calib["sectoral_dominance"]["simulated"].replace("%", "")
    sector_share = float(sector_str)
    assert 70.0 <= sector_share <= 80.0, f"Transport & Energy share ({sector_share}%) outside bounds 70 - 80%"
    print("[PASSED] 1. All MoSPI aggregate calibration targets verified!")

def test_api_projects_and_explainability():
    res = client.get("/api/projects?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 450
    assert len(data["projects"]) == 10
    
    p = data["projects"][0]
    assert "explanation" in p
    assert "rule_risk_score" in p
    assert "ml_risk_score" in p
    assert "components" in p
    comps = p["components"]
    assert "cost_variance" in comps
    assert "schedule_slippage" in comps
    assert "physical_financial_gap" in comps
    assert "milestones_missed" in comps
    print("[PASSED] 2. Project explainability structure verified!")

def test_single_project_endpoint():
    res_list = client.get("/api/projects?page=1&page_size=1")
    first_id = res_list.json()["projects"][0]["project_id"]
    res = client.get(f"/api/projects/{first_id}")
    assert res.status_code == 200
    p = res.json()
    assert p["project_id"] == first_id
    assert len(p["mitigations"]) > 0
    print(f"[PASSED] 3. Granular detail endpoint for {first_id} verified!")

def test_state_analytics():
    res = client.get("/api/analytics/states")
    assert res.status_code == 200
    states = res.json()
    assert len(states) >= 20
    assert "avg_rule_risk_score" in states[0]
    assert "state_color" in states[0]
    print(f"[PASSED] 4. State analytics ({len(states)} states) verified!")

def test_model_comparison():
    res = client.get("/api/analytics/model-comparison")
    assert res.status_code == 200
    m = res.json()
    assert m["accuracy"] > 85.0
    assert len(m["feature_importances"]) > 0
    assert "confusion_matrix" in m
    print(f"[PASSED] 5. ML model metrics (Accuracy {m['accuracy']}%, ROC-AUC {m['roc_auc']}) verified!")

def test_simulation_sandbox():
    payload = {
        "project_name": "Test Greenfield Expressway",
        "sector": "Road Transport",
        "original_cost_cr": 2000.0,
        "revised_cost_cr": 3200.0,
        "planned_start_date": "2023-01-01",
        "planned_end_date": "2025-12-31",
        "actual_progress_pct": 35.0,
        "financial_progress_pct": 68.0,
        "milestone_count": 12,
        "milestones_missed": 4,
        "last_milestone_delay_days": 180,
        "status": "Delayed"
    }
    res = client.post("/api/simulate-risk", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["rule_risk_tier"] == "High"
    assert "cost overrun" in data["explanation"]
    print(f"[PASSED] 6. Risk simulator tested: {data['explanation']}")

def test_paimana_historical():
    res = client.get("/api/analytics/paimana-historical")
    assert res.status_code == 200
    data = res.json()
    assert len(data["time_series"]) >= 10
    assert len(data["delay_causes"]) == 5
    assert len(data["sector_benchmarks"]) >= 5
    print(f"[PASSED] 7. PAIMANA Historical Data ({len(data['time_series'])} quarterly epochs) verified!")

def test_ai_assistant():
    # 1. Test Project ID query
    res = client.post("/api/ai/assistant", json={"query": "INFR-RT0002"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert "INFR-RT0002" in data["response"]
    assert len(data["relevant_projects"]) >= 1
    assert data["relevant_projects"][0]["project_id"] == "INFR-RT0002"

    # 2. Test State query
    res_state = client.post("/api/ai/assistant", json={"query": "Tell me about Maharashtra projects"})
    assert res_state.status_code == 200
    d_state = res_state.json()
    assert "Maharashtra" in d_state["response"]
    assert len(d_state["relevant_projects"]) > 0

    # 3. Test MoSPI delay causes query
    res_delay = client.post("/api/ai/assistant", json={"query": "Why are projects delayed in India?"})
    assert res_delay.status_code == 200
    d_delay = res_delay.json()
    assert "Land Acquisition" in d_delay["response"] or "bottleneck" in d_delay["response"].lower()
    print("[PASSED] 8. InfraSankalp AI Copilot Assistant queries verified!")

if __name__ == "__main__":
    test_calibration_statistics()
    test_api_projects_and_explainability()
    test_single_project_endpoint()
    test_state_analytics()
    test_model_comparison()
    test_simulation_sandbox()
    test_paimana_historical()
    test_ai_assistant()
    print("\n>>> ALL 8 BACKEND, CALIBRATION, HISTORICAL & AI COPILOT TESTS PASSED WITH 100% SUCCESS! <<<")
