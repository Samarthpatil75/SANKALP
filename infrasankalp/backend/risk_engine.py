"""
InfraWatch - Risk Scoring & Explainability Engine (XAI)
======================================================
Implements:
1. Rule-based composite risk score (0-100) combining:
   - Cost variance % (Weight: 0.35)
   - Schedule slippage adjusted for physical progress (Weight: 0.25)
   - Physical-vs-financial progress gap (Weight: 0.25)
   - Missed milestone streak and delay severity (Weight: 0.15)
2. Explainability Engine:
   - Plain-language diagnostic narratives explaining exactly why a project was flagged
   - Granular point contributions from each of the 4 risk dimensions
   - Actionable administrative mitigation recommendations for project directors
"""

from datetime import datetime
from typing import Dict, Any, List

def calculate_rule_risk(project: Dict[str, Any], current_date: datetime = datetime(2026, 8, 15)) -> Dict[str, Any]:
    """
    Computes rule-based composite risk score (0-100) and explainability payload.
    """
    orig_cost = float(project["original_cost_cr"])
    rev_cost = float(project["revised_cost_cr"])
    fin_pct = float(project["financial_progress_pct"])
    phy_pct = float(project["actual_progress_pct"])
    milestone_count = max(1, int(project["milestone_count"]))
    milestones_missed = int(project["milestones_missed"])
    delay_days = int(project["last_milestone_delay_days"])
    
    start_dt = datetime.strptime(project["planned_start_date"], "%Y-%m-%d")
    end_dt = datetime.strptime(project["planned_end_date"], "%Y-%m-%d")
    
    # -------------------------------------------------------------
    # 1. Cost Variance % (Weight: 0.35)
    # -------------------------------------------------------------
    cost_variance_ratio = max(0.0, (rev_cost - orig_cost) / orig_cost)
    cost_variance_pct = round(cost_variance_ratio * 100.0, 1)
    
    # Scoring curve:
    # 0% => 0
    # 15% overrun => 45 pts
    # 40% overrun => 75 pts
    # >= 70% overrun => 100 pts
    if cost_variance_pct <= 0:
        cost_score_raw = 0.0
    elif cost_variance_pct <= 20.0:
        cost_score_raw = (cost_variance_pct / 20.0) * 50.0
    elif cost_variance_pct <= 50.0:
        cost_score_raw = 50.0 + ((cost_variance_pct - 20.0) / 30.0) * 35.0
    else:
        cost_score_raw = min(100.0, 85.0 + ((cost_variance_pct - 50.0) / 40.0) * 15.0)
    
    cost_contribution = round(cost_score_raw * 0.35, 1)

    # -------------------------------------------------------------
    # 2. Schedule Slippage adjusted for physical progress (Weight: 0.25)
    # -------------------------------------------------------------
    planned_duration_days = max(30, (end_dt - start_dt).days)
    elapsed_days = max(1, (current_date - start_dt).days)
    elapsed_ratio = elapsed_days / planned_duration_days
    
    # Expected progress based on elapsed time vs planned duration
    expected_progress = min(100.0, elapsed_ratio * 100.0)
    progress_deficit = max(0.0, expected_progress - phy_pct)
    
    # Overtime penalty if project date has passed
    overdue_days = max(0, (current_date - end_dt).days) if current_date > end_dt and phy_pct < 98.0 else 0
    
    # Schedule score:
    # 0-10% deficit => up to 40 pts
    # 10-30% deficit => 40 to 80 pts
    # > 30% deficit or > 180 days overdue => 80 to 100 pts
    if progress_deficit <= 10.0:
        sched_base = (progress_deficit / 10.0) * 40.0
    elif progress_deficit <= 30.0:
        sched_base = 40.0 + ((progress_deficit - 10.0) / 20.0) * 40.0
    else:
        sched_base = min(100.0, 80.0 + ((progress_deficit - 30.0) / 30.0) * 20.0)
        
    overtime_add = min(25.0, (overdue_days / 180.0) * 25.0)
    schedule_score_raw = min(100.0, sched_base + overtime_add)
    schedule_contribution = round(schedule_score_raw * 0.25, 1)

    # -------------------------------------------------------------
    # 3. Physical-vs-Financial Progress Gap (Weight: 0.25)
    # -------------------------------------------------------------
    progress_gap = round(fin_pct - phy_pct, 1)
    
    # In public procurement, funds spent far ahead of physical assets is a major risk
    if progress_gap <= 0:
        gap_score_raw = 0.0
    elif progress_gap <= 8.0:
        gap_score_raw = (progress_gap / 8.0) * 40.0
    elif progress_gap <= 20.0:
        gap_score_raw = 40.0 + ((progress_gap - 8.0) / 12.0) * 40.0
    else:
        gap_score_raw = min(100.0, 80.0 + ((progress_gap - 20.0) / 20.0) * 20.0)
        
    gap_contribution = round(gap_score_raw * 0.25, 1)

    # -------------------------------------------------------------
    # 4. Missed Milestone Streak / Ratio (Weight: 0.15)
    # -------------------------------------------------------------
    miss_ratio = milestones_missed / milestone_count
    delay_ratio = min(1.0, delay_days / 180.0)
    
    if milestones_missed == 0:
        milestone_score_raw = 0.0
    else:
        milestone_score_raw = min(100.0, 30.0 + (miss_ratio * 40.0) + (delay_ratio * 30.0))
        
    milestone_contribution = round(milestone_score_raw * 0.15, 1)

    # -------------------------------------------------------------
    # Composite Score & Tiers
    # -------------------------------------------------------------
    composite_score = round(cost_contribution + schedule_contribution + gap_contribution + milestone_contribution, 1)
    composite_score = max(0.0, min(100.0, composite_score))
    
    if composite_score >= 60.0:
        risk_tier = "High"
        badge_color = "red"
    elif composite_score >= 32.0:
        risk_tier = "Medium"
        badge_color = "amber"
    else:
        risk_tier = "Low"
        badge_color = "emerald"

    # -------------------------------------------------------------
    # Plain-Language Explainability Generation
    # -------------------------------------------------------------
    reasons = []
    
    if cost_variance_pct > 0:
        reasons.append(f"{cost_variance_pct:.1f}% cost overrun (contributed +{cost_contribution} pts)")
    
    if milestones_missed > 0:
        delay_phrase = f" with {delay_days}d delay" if delay_days > 0 else ""
        reasons.append(f"{milestones_missed} missed milestone(s){delay_phrase} (contributed +{milestone_contribution} pts)")
    
    if progress_gap > 3.0:
        reasons.append(f"{progress_gap:+.1f}pp physical-financial gap (contributed +{gap_contribution} pts)")
        
    months_slippage = round((progress_deficit / 100.0) * (planned_duration_days / 30.4), 1)
    if schedule_score_raw > 15.0:
        reasons.append(f"~{months_slippage:.1f}mo schedule slippage vs elapsed timeline (contributed +{schedule_contribution} pts)")

    if not reasons:
        explanation = f"Nominal operating parameters: on-budget, schedule aligned with physical deliverables (Score: {composite_score}/100)."
    else:
        explanation = f"Flagged {risk_tier} Risk: " + ", ".join(reasons) + f" (Total Composite: {composite_score}/100)."

    # Actionable Administrative Mitigations
    mitigations = []
    if cost_score_raw >= 50.0:
        mitigations.append("Convene Revised Cost Committee (RCC) under MoSPI/Finance Ministry guidelines to audit contractor price variation claims.")
    if schedule_score_raw >= 45.0:
        mitigations.append("Empower State Inter-Ministerial Empowered Committee (SIMEC) to resolve right-of-way (RoW) and statutory forest clearances.")
    if gap_score_raw >= 45.0:
        mitigations.append("Pause unmeasured mobilization advance disbursements; reconcile physical measurement book (MB) with bank escrow releases.")
    if milestone_score_raw >= 50.0:
        mitigations.append("Enforce liquidated damages clause on EPC contractor and deploy automated drone/GIS physical milestone verification.")
    if not mitigations:
        mitigations.append("Maintain regular quarterly monitoring cycle on PAIMANA dashboard.")

    return {
        "rule_risk_score": composite_score,
        "risk_tier": risk_tier,
        "badge_color": badge_color,
        "explanation": explanation,
        "components": {
            "cost_variance": {
                "name": "Cost Variance",
                "weight": 0.35,
                "raw_value": f"{cost_variance_pct}%",
                "score_out_of_100": round(cost_score_raw, 1),
                "contribution_pts": cost_contribution,
            },
            "schedule_slippage": {
                "name": "Schedule Slippage",
                "weight": 0.25,
                "raw_value": f"{round(progress_deficit, 1)}% lag",
                "score_out_of_100": round(schedule_score_raw, 1),
                "contribution_pts": schedule_contribution,
            },
            "physical_financial_gap": {
                "name": "Physical-Financial Gap",
                "weight": 0.25,
                "raw_value": f"{progress_gap:+.1f}pp",
                "score_out_of_100": round(gap_score_raw, 1),
                "contribution_pts": gap_contribution,
            },
            "milestones_missed": {
                "name": "Milestone Delays",
                "weight": 0.15,
                "raw_value": f"{milestones_missed}/{milestone_count} ({delay_days}d)",
                "score_out_of_100": round(milestone_score_raw, 1),
                "contribution_pts": milestone_contribution,
            },
        },
        "mitigations": mitigations,
    }
