"""
InfraSankalp - AI Infrastructure Intelligence Assistant
======================================================
Provides natural language semantic search, portfolio reasoning,
root-cause analysis, and executive briefings across India's Central Sector
Infrastructure Projects (PAIMANA • InfraSankalp).
"""

import re
from typing import List, Dict, Any, Optional

def query_ai_assistant(query: str, projects: List[Dict[str, Any]], kpi_data: Dict[str, Any], historical_data: Dict[str, Any]) -> Dict[str, Any]:
    q = query.strip()
    q_lower = q.lower()
    
    # 1. Search for specific Project ID (e.g. INFR-RT0002) or direct Project Name
    matched_proj = None
    id_match = re.search(r'\b(INFR-[A-Z0-9&]+)\b', q, re.IGNORECASE)
    if id_match:
        target_id = id_match.group(1).upper()
        matched_proj = next((p for p in projects if p["project_id"].upper() == target_id), None)
    
    if not matched_proj and len(q.strip()) >= 6:
        # Direct substring matching for project names
        for p in projects:
            p_name_lower = p["project_name"].lower()
            if q_lower in p_name_lower or (len(q) > 10 and all(word in p_name_lower for word in q_lower.split() if len(word) > 3)):
                matched_proj = p
                break

    if matched_proj:
        p = matched_proj
        response = (
            f"### 📋 Project Intelligence Dossier: **{p['project_name']}** (`{p['project_id']}`)\n\n"
            f"- **Nodal Ministry**: {p['ministry']}\n"
            f"- **Implementing Agency**: {p['implementing_agency']}\n"
            f"- **State & Sector**: {p['state']} • {p['sector']}\n"
            f"- **Operational Status**: **{p['status']}**\n\n"
            f"#### 💰 Financial Dynamics\n"
            f"- **Original Sanction**: ₹{p['original_cost_cr']:,} Cr\n"
            f"- **Anticipated Revised Cost**: ₹{p['revised_cost_cr']:,} Cr "
            f"({'+' + str(p['cost_overrun_pct']) + '%' if p['cost_overrun_pct'] > 0 else 'On Budget'})\n"
            f"- **Cumulative Disbursed**: ₹{p['cumulative_expenditure_cr']:,} Cr ({p['financial_progress_pct']}%)\n\n"
            f"#### 🔍 Explainable Risk Assessment\n"
            f"- **Rule-Based Risk Score**: **{p['rule_risk_score']} / 100** ({p['rule_risk_tier']} Risk)\n"
            f"- **ML Predictive Model Score**: **{p['ml_risk_score']} / 100** ({p['ml_risk_tier']} Risk)\n"
            f"- **Diagnostic Explanation**: *\"{p['explanation']}\"*\n\n"
            f"#### ⚠️ Key Milestone & Clearance Bottlenecks\n"
            f"- Milestones Missed: **{p['milestones_missed']} of {p['milestone_count']}**\n"
            f"- Latest Schedule Delay: **{p['last_milestone_delay_days']} days**\n"
            f"- Progress Variance: **{(p['financial_progress_pct'] - p['actual_progress_pct']):.1f}pp** (Physical: {p['actual_progress_pct']}%, Financial: {p['financial_progress_pct']}%)\n\n"
            f"#### 🏛️ Prescribed Governance Mitigations\n"
        )
        for m in p.get("mitigations", []):
            response += f"- {m}\n"

        return {
            "response": response,
            "relevant_projects": [p],
            "suggested_followups": [
                f"What other projects in {p['state']} are delayed?",
                f"Compare {p['sector']} sector overruns",
                "How does this project compare to the national average?"
            ]
        }

    # 2. State-specific query
    states_list = [
        "Maharashtra", "Uttar Pradesh", "Gujarat", "Tamil Nadu", "Karnataka",
        "Andhra Pradesh", "Madhya Pradesh", "Rajasthan", "West Bengal", "Odisha",
        "Bihar", "Telangana", "Jharkhand", "Chhattisgarh", "Haryana", "Punjab",
        "Assam", "Kerala", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir", "Delhi"
    ]
    matched_state = next((s for s in states_list if s.lower() in q_lower), None)
    
    # 3. Sector-specific query
    sectors_list = [
        "Road Transport", "Railways", "Power", "Petroleum & Gas",
        "Coal", "Urban Infrastructure", "Irrigation", "Telecom"
    ]
    matched_sector = next((sec for sec in sectors_list if sec.lower() in q_lower or (sec == "Road Transport" and "road" in q_lower) or (sec == "Railways" and "rail" in q_lower)), None)

    # State Query
    if matched_state and not matched_sector:
        state_projs = [p for p in projects if p["state"].lower() == matched_state.lower()]
        total_outlay = sum(p["revised_cost_cr"] for p in state_projs)
        delayed_projs = [p for p in state_projs if p["status"] == "Delayed"]
        high_risk_projs = [p for p in state_projs if p["rule_risk_tier"] == "High"]
        
        response = (
            f"### 📍 State Infrastructure Briefing: **{matched_state}**\n\n"
            f"- **Total Active Projects**: **{len(state_projs)} projects**\n"
            f"- **Cumulative Capital Outlay**: **₹{total_outlay / 100000:.2f} Lakh Crore** (₹{total_outlay:,.0f} Cr)\n"
            f"- **Delayed Initiatives**: **{len(delayed_projs)} ({len(delayed_projs) / len(state_projs) * 100:.1f}%)**\n"
            f"- **Critical High-Risk Projects**: **{len(high_risk_projs)} projects**\n\n"
            f"#### 🚨 Priority Portfolios in {matched_state}:\n"
        )
        for p in state_projs[:4]:
            response += f"- **{p['project_name']}** (`{p['project_id']}`): {p['sector']} • ₹{p['revised_cost_cr']:,.0f} Cr • Risk Score **{p['rule_risk_score']}** ({p['rule_risk_tier']})\n"

        return {
            "response": response,
            "relevant_projects": state_projs[:6],
            "suggested_followups": [
                f"Show high-risk projects in {matched_state}",
                f"Which agency has the most projects in {matched_state}?",
                "Show national state investment rankings"
            ]
        }

    # Sector Query
    if matched_sector:
        sec_projs = [p for p in projects if matched_sector.lower() in p["sector"].lower()]
        if matched_state:
            sec_projs = [p for p in sec_projs if p["state"].lower() == matched_state.lower()]
            scope_desc = f"{matched_sector} projects in {matched_state}"
        else:
            scope_desc = f"National {matched_sector} Sector"

        total_outlay = sum(p["revised_cost_cr"] for p in sec_projs)
        delayed = [p for p in sec_projs if p["status"] == "Delayed"]
        high_risk = [p for p in sec_projs if p["rule_risk_tier"] == "High"]
        avg_overrun = sum(p["cost_overrun_pct"] for p in sec_projs) / len(sec_projs) if sec_projs else 0
        
        response = (
            f"### 🏗️ Sectoral Risk Briefing: **{scope_desc}**\n\n"
            f"- **Total Projects Monitored**: **{len(sec_projs)}**\n"
            f"- **Total Anticipated Outlay**: **₹{total_outlay / 100000:.2f} Lakh Crore** (₹{total_outlay:,.0f} Cr)\n"
            f"- **Average Cost Escalation**: **+{avg_overrun:.1f}%**\n"
            f"- **Delayed Projects**: **{len(delayed)} ({len(delayed)/len(sec_projs)*100:.1f}%)**\n"
            f"- **High Risk Flagged**: **{len(high_risk)} projects**\n\n"
            f"#### Top Highlighted Projects:\n"
        )
        for p in sec_projs[:4]:
            response += f"- **{p['project_name']}** ({p['state']}): ₹{p['revised_cost_cr']:,.0f} Cr • Overrun +{p['cost_overrun_pct']}% • Score **{p['rule_risk_score']}**\n"

        return {
            "response": response,
            "relevant_projects": sec_projs[:6],
            "suggested_followups": [
                f"What are the primary clearance bottlenecks in {matched_sector}?",
                "Which sector has the highest cost overrun?",
                "Show all high-risk projects"
            ]
        }

    # 4. Queries about "High Risk" / "Critical" / "Overrun" / "Delays"
    if any(k in q_lower for k in ["high risk", "critical", "highest risk", "most risk", "worst", "severely"]):
        high_projs = sorted([p for p in projects if p["rule_risk_tier"] == "High"], key=lambda x: x["rule_risk_score"], reverse=True)
        response = (
            f"### ⚠️ Cabinet Priority Watchlist: **Top Critical High-Risk Projects**\n\n"
            f"InfraSankalp has flagged **{len(high_projs)} projects** in the High Risk Tier (Score &ge; 60/100). "
            f"These projects combine severe budget escalation, schedule slippage, and acute physical-to-financial gaps:\n\n"
        )
        for i, p in enumerate(high_projs[:5], 1):
            response += (
                f"**{i}. {p['project_name']}** (`{p['project_id']}`)\n"
                f"- **State & Sector**: {p['state']} • {p['sector']} ({p['implementing_agency']})\n"
                f"- **Financials**: ₹{p['revised_cost_cr']:,.0f} Cr (+{p['cost_overrun_pct']}% overrun)\n"
                f"- **Diagnostic**: *{p['explanation']}*\n\n"
            )

        return {
            "response": response,
            "relevant_projects": high_projs[:6],
            "suggested_followups": [
                "What are the recommended administrative mitigations?",
                "Which state has the most high-risk projects?",
                "Compare Rule Score vs ML Score for these projects"
            ]
        }

    # 5. Queries about "Cost Overrun" / "Escalation" / "Budget"
    if any(k in q_lower for k in ["overrun", "escalation", "cost excess", "budget hike"]):
        top_overruns = sorted(projects, key=lambda x: x["cost_overrun_pct"], reverse=True)[:5]
        response = (
            f"### 📈 Capital Escalation Analysis: **Highest Cost Overruns**\n\n"
            f"Across the 450 monitored projects, average cost overrun stands at **+{kpi_data.get('summary', {}).get('overall_cost_overrun_pct', 15.3)}%**.\n\n"
            f"The projects with the most severe cost escalation are:\n\n"
        )
        for i, p in enumerate(top_overruns, 1):
            response += (
                f"**{i}. {p['project_name']}** (`{p['project_id']}`)\n"
                f"- **Cost Escalation**: **+{p['cost_overrun_pct']}%** (Original ₹{p['original_cost_cr']:,} Cr &rarr; Revised ₹{p['revised_cost_cr']:,} Cr)\n"
                f"- **Agency & State**: {p['implementing_agency']} ({p['state']})\n\n"
            )

        return {
            "response": response,
            "relevant_projects": top_overruns,
            "suggested_followups": [
                "Why do cost overruns happen in central sector projects?",
                "What is the Revised Cost Committee (RCC) mechanism?",
                "Show delayed projects in Railways"
            ]
        }

    # 6. Queries about "Delay Causes" / "Bottlenecks" / "Clearances" / "Land Acquisition"
    if any(k in q_lower for k in ["delay", "bottleneck", "clearance", "land acquisition", "forest", "why", "cause", "slippage"]):
        causes = historical_data.get("delay_causes", [])
        response = (
            f"### 🛑 Official MoSPI Delay Root Causes & Bottleneck Breakdown\n\n"
            f"Based on statutory Monthly Flash Reports published by the Ministry of Statistics and Programme Implementation (MoSPI), "
            f"the 5 primary causes of project delay are:\n\n"
        )
        for c in causes:
            response += (
                f"- **{c['category']}** (**{c['percentage']}%** of bottlenecks):\n"
                f"  {c['description']} *(Avg delay induced: ~{c['avg_delay_months']} months across {c['affected_projects']} projects)*\n"
            )

        response += (
            f"\n*InfraSankalp leverages Explainable AI (XAI) to link these clearance bottlenecks directly to per-project component risk scores.*"
        )

        return {
            "response": response,
            "relevant_projects": [p for p in projects if p["status"] == "Delayed"][:4],
            "suggested_followups": [
                "Which sector suffers the most from land acquisition?",
                "Show projects with >180 days delay",
                "How does the risk scoring engine work?"
            ]
        }

    # 7. Default General Intelligent Assistant Response
    matched_search = [
        p for p in projects
        if any(term in p["project_name"].lower() or term in p["implementing_agency"].lower() for term in q_lower.split())
    ][:5]

    summary = kpi_data.get("summary", {})
    response = (
        f"### 🤖 InfraSankalp AI Infrastructure Copilot\n\n"
        f"I analyzed your query across **{summary.get('total_projects', 450)} Central Sector Infrastructure Projects** "
        f"(totaling **₹{summary.get('total_monitored_outlay_lakh_cr', '10.27')} Lakh Crore** across 17 ministries).\n\n"
        f"**Portfolio Snapshot:**\n"
        f"- **Cumulative Expenditure Disbursed**: **{summary.get('cumulative_expenditure_ratio_pct', 51.05)}%** (MoSPI Calibrated Parity)\n"
        f"- **Delayed Initiatives**: **{summary.get('delayed_projects_count', 191)} projects** ({summary.get('delayed_pct', 42.4)}%)\n"
        f"- **Average Cost Escalation**: **+{summary.get('overall_cost_overrun_pct', 15.3)}%**\n\n"
    )

    if matched_search:
        response += f"**Relevant Projects matching your search:**\n"
        for p in matched_search[:4]:
            response += f"- **{p['project_name']}** (`{p['project_id']}`): {p['state']} • ₹{p['revised_cost_cr']:,.0f} Cr • Status: {p['status']} • Risk: {p['rule_risk_score']}\n"
    else:
        response += "You can ask me to inspect any specific project by ID or name, compare sectors, analyze state infrastructure portfolios, or explain why any project was flagged high-risk!"

    return {
        "response": response,
        "relevant_projects": matched_search or projects[:4],
        "suggested_followups": [
            "Show me top 5 delayed railway projects",
            "What are the most critical projects in Maharashtra?",
            "Explain the MoSPI delay root causes",
            "Show mega projects over ₹10,000 Crore"
        ]
    }
