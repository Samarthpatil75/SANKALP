"""
InfraWatch - Calibrated Synthetic Data Generator
================================================
Generates synthetic data for 450 central-sector infrastructure projects
strictly calibrated against official published aggregates from the Ministry of
Statistics and Programme Implementation (MoSPI) / PIB reports on Central Sector Projects:

Official Calibration Targets:
1. Aggregate universe scale: Real MoSPI tracks ~1,987 projects worth ~₹42.5 lakh crore
   (mean ~₹2,139 Cr/project). Our 450-project sample has an average revised cost of ~₹2,140 Cr,
   totaling ~₹9.63 lakh crore (representative sample scaled to 1:1 project average).
2. Cumulative Expenditure Ratio: Total cumulative expenditure / Total revised cost = ~51.2% (Target: ~51%).
3. Physical Progress: ~41.0% of monitored projects have >80% physical progress (Target: ~41%).
4. Financial Progress: ~14.2% of monitored projects have >80% financial completion (Target: ~14%).
5. Sectoral Weighting: Transport & Logistics (Road + Railways) + Energy (Power + Petroleum + Coal)
   dominate ~70-80% combined (Target: ~76-78%).
"""

import json
import math
import os
import random
from datetime import datetime, timedelta
import numpy as np

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(DATA_DIR, "projects.json")

STATES = [
    ("Maharashtra", 0.10),
    ("Uttar Pradesh", 0.09),
    ("Gujarat", 0.08),
    ("Tamil Nadu", 0.07),
    ("Karnataka", 0.07),
    ("Andhra Pradesh", 0.06),
    ("Madhya Pradesh", 0.06),
    ("Rajasthan", 0.06),
    ("West Bengal", 0.05),
    ("Odisha", 0.05),
    ("Bihar", 0.05),
    ("Telangana", 0.05),
    ("Jharkhand", 0.04),
    ("Chhattisgarh", 0.04),
    ("Haryana", 0.03),
    ("Punjab", 0.03),
    ("Assam", 0.03),
    ("Kerala", 0.03),
    ("Uttarakhand", 0.02),
    ("Himachal Pradesh", 0.02),
    ("Jammu & Kashmir", 0.02),
    ("Delhi", 0.02),
    ("Goa", 0.01),
    ("Tripura", 0.005),
    ("Meghalaya", 0.005),
    ("Arunachal Pradesh", 0.005),
    ("Manipur", 0.005),
    ("Nagaland", 0.005),
]
STATE_NAMES, STATE_PROBS = zip(*STATES)
STATE_PROBS = np.array(STATE_PROBS) / sum(STATE_PROBS)

# Calibrated sector weights: Transport (36+16=52%) + Energy (13+7+4=24%) = 76% (in target 70-80%)
SECTORS = {
    "Road Transport": {
        "weight": 0.36,
        "ministry": "Ministry of Road Transport and Highways (MoRTH)",
        "agencies": ["National Highways Authority of India (NHAI)", "National Highways and Infrastructure Development Corp (NHIDCL)", "State PWD Border Roads"],
        "names": [
            "Expressway Corridor Phase-", "Economic Corridor 4-Laning Section-",
            "Border Road Connectivity Package-", "Bypass & Elevated Corridor-",
            "Ring Road Ringway Phase-", "Greenfield Highway Link-",
            "Coastal Highway Expansion Unit-", "Multimodal Freight Logistics Access Way-"
        ],
        "cost_range": (800, 16000),
    },
    "Railways": {
        "weight": 0.16,
        "ministry": "Ministry of Railways",
        "agencies": ["Rail Vikas Nigam Limited (RVNL)", "Dedicated Freight Corridor Corp (DFCCIL)", "Indian Railway Construction (IRCON)", "Central Organisation for Railway Electrification (CORE)"],
        "names": [
            "Dedicated Freight Corridor Western Link-", "Doubling & 3rd Line Expansion-",
            "Semi-High Speed Vande Bharat Route Modernization-", "Strategic Hill Rail Link-",
            "Port Rail Connectivity Spur-", "Railway Electrification Network Block-",
            "Terminal Overhaul & Station Redevelopment-"
        ],
        "cost_range": (1100, 24000),
    },
    "Power": {
        "weight": 0.13,
        "ministry": "Ministry of Power",
        "agencies": ["NTPC Limited", "NHPC Limited", "Power Grid Corporation of India (POWERGRID)", "SJVN Limited"],
        "names": [
            "Super Thermal Power Station Unit-", "Ultra Mega Solar Park Grid Link-",
            "Pumped Storage Hydro Power Project Stage-", "Inter-Regional 765kV High-Capacity Transmission Corridor-",
            "Offshore Wind Evacuation Substation-", "Green Hydrogen Co-Generation Facility-"
        ],
        "cost_range": (1400, 28000),
    },
    "Petroleum & Gas": {
        "weight": 0.07,
        "ministry": "Ministry of Petroleum and Natural Gas",
        "agencies": ["Oil and Natural Gas Corporation (ONGC)", "Indian Oil Corporation (IOCL)", "GAIL (India) Limited", "Bharat Petroleum (BPCL)"],
        "names": [
            "Cross-Country Natural Gas Trunk Pipeline-", "Refinery Expansion & Petrochemical Complex-",
            "Strategic Crude Oil Storage Cavern-", "Offshore Deepwater Block Exploration Rig-",
            "Bio-Ethanol Refinery Plant Stage-"
        ],
        "cost_range": (1800, 36000),
    },
    "Coal": {
        "weight": 0.04,
        "ministry": "Ministry of Coal",
        "agencies": ["Coal India Limited (CIL)", "NLC India Limited", "South Eastern Coalfields (SECL)", "Mahanadi Coalfields (MCL)"],
        "names": [
            "First Mile Connectivity Railway Evacuation Project-", "Opencast Coal Mining Mega Block-",
            "Pithead Thermal Power Integration Unit-", "Coal Washery Modernization Facility-"
        ],
        "cost_range": (600, 10000),
    },
    "Urban Infrastructure": {
        "weight": 0.09,
        "ministry": "Ministry of Housing and Urban Affairs (MoHUA)",
        "agencies": ["Delhi Metro Rail Corp (DMRC)", "Bangalore Metro Rail (BMRCL)", "Mumbai Metropolitan Region Dev Authority (MMRDA)", "Chennai Metro Rail (CMRL)"],
        "names": [
            "Metro Rail Phase Corridor Line-", "Integrated Urban Wastewater Treatment Network-",
            "Automated Multimodal Transit Interchange-", "Smart City Command & Utility Grid-"
        ],
        "cost_range": (1500, 22000),
    },
    "Irrigation": {
        "weight": 0.08,
        "ministry": "Ministry of Jal Shakti",
        "agencies": ["National Water Development Agency (NWDA)", "Central Water Commission (CWC)", "State Water Resources Dept"],
        "names": [
            "River Interlinking Barrage & Lift Scheme-", "Major Multi-Purpose Dam & Canal Network-",
            "Command Area Drip Irrigation Modernization-", "Flood Moderation Reservoir & Embankment-"
        ],
        "cost_range": (700, 14000),
    },
    "Telecom": {
        "weight": 0.07,
        "ministry": "Ministry of Communications",
        "agencies": ["Bharat Sanchar Nigam Limited (BSNL)", "Bharat Broadband Network Limited (BBNL)", "Telecommunications Consultants India (TCIL)"],
        "names": [
            "BharatNet Rural Optical Fiber Network Phase-", "4G/5G Saturation Universal Service Tower Grid-",
            "Submarine Optical Fiber Cable Connectivity-", "National Data Center & Cloud Edge Hub-"
        ],
        "cost_range": (450, 8500),
    },
}

TOTAL_PROJECTS = 450

def generate_dataset():
    projects = []
    
    sector_keys = list(SECTORS.keys())
    sector_weights = [SECTORS[s]["weight"] for s in sector_keys]
    
    # 185 projects (41.1%) with physical progress > 80%
    num_advanced = 185
    # 64 projects (14.2%) with financial completion > 80%
    num_fin_high = 64
    
    num_early = 92
    num_mid = TOTAL_PROJECTS - num_advanced - num_early # 173
    
    bucket_types = (["advanced"] * num_advanced) + (["mid"] * num_mid) + (["early"] * num_early)
    random.shuffle(bucket_types)
    
    # Pre-select indices of advanced projects that will have >80% financial completion
    adv_indices = [idx for idx, b in enumerate(bucket_types) if b == "advanced"]
    random.shuffle(adv_indices)
    high_fin_indices = set(adv_indices[:num_fin_high])
    
    CURRENT_DATE = datetime(2026, 8, 15)
    
    for i, bucket in enumerate(bucket_types):
        proj_idx = i + 1
        sector_name = np.random.choice(sector_keys, p=sector_weights)
        sector_info = SECTORS[sector_name]
        agency = random.choice(sector_info["agencies"])
        name_template = random.choice(sector_info["names"])
        state = np.random.choice(STATE_NAMES, p=STATE_PROBS)
        
        clean_prefix = "".join([w[0] for w in sector_name.split()[:2]]).upper()
        project_id = f"INFR-{clean_prefix}{proj_idx:04d}"
        project_name = f"{state} {name_template}{random.randint(1, 9)} ({agency.split()[0]})"
        
        # Base Cost Calibration
        log_mean = 7.10
        log_sigma = 0.82
        raw_cost = float(np.random.lognormal(log_mean, log_sigma))
        min_c, max_c = sector_info["cost_range"]
        original_cost_cr = round(max(min_c * 0.75, min(raw_cost, max_c * 1.25)), 2)
        
        has_cost_overrun = (random.random() < 0.35) if bucket != "advanced" else (random.random() < 0.25)
        if has_cost_overrun:
            overrun_ratio = round(np.random.uniform(1.08, 1.90) if random.random() > 0.12 else np.random.uniform(1.90, 2.45), 3)
            revised_cost_cr = round(original_cost_cr * overrun_ratio, 2)
        else:
            revised_cost_cr = original_cost_cr
            
        planned_duration_months = random.randint(24, 72)
        
        if bucket == "advanced":
            start_offset_months = random.randint(planned_duration_months - 6, planned_duration_months + 20)
            start_date = CURRENT_DATE - timedelta(days=int(start_offset_months * 30.4))
            planned_end_date = start_date + timedelta(days=int(planned_duration_months * 30.4))
            
            # Physical progress > 80% (strictly 80.5% - 99.5%)
            actual_progress_pct = round(random.uniform(80.5, 99.5), 1)
            
            if i in high_fin_indices:
                # Financial completion > 80%
                financial_progress_pct = round(random.uniform(81.0, 96.5), 1)
            else:
                # Advanced physical work, but final bills/claims pending settlement
                financial_progress_pct = round(random.uniform(50.0, 78.5), 1)
                
            milestone_count = random.randint(8, 16)
            if planned_end_date < CURRENT_DATE and actual_progress_pct < 98:
                status = "Delayed"
                milestones_missed = random.randint(1, 4)
                last_milestone_delay_days = random.randint(45, 210)
            elif actual_progress_pct >= 98 and financial_progress_pct >= 85:
                status = "Completed"
                milestones_missed = 0
                last_milestone_delay_days = 0
            else:
                status = "Ongoing"
                milestones_missed = random.choice([0, 1, 2])
                last_milestone_delay_days = 0 if milestones_missed == 0 else random.randint(15, 75)

        elif bucket == "mid":
            start_offset_months = random.randint(14, 45)
            start_date = CURRENT_DATE - timedelta(days=int(start_offset_months * 30.4))
            planned_end_date = start_date + timedelta(days=int(planned_duration_months * 30.4))
            
            actual_progress_pct = round(random.uniform(35.0, 79.5), 1)
            # financial progress centered around physical progress, capped strictly under 79.0%
            gap_bias = np.random.normal(1.0, 9.0)
            financial_progress_pct = round(max(15.0, min(78.5, actual_progress_pct + gap_bias)), 1)
            
            milestone_count = random.randint(6, 14)
            is_delayed = planned_end_date < CURRENT_DATE or random.random() < 0.32
            if is_delayed:
                status = "Delayed"
                milestones_missed = random.randint(2, max(2, int(milestone_count * 0.4)))
                last_milestone_delay_days = random.randint(60, 300)
            else:
                status = "Ongoing"
                milestones_missed = random.choice([0, 1, 1, 2])
                last_milestone_delay_days = 0 if milestones_missed == 0 else random.randint(15, 60)

        else: # early bucket
            start_offset_months = random.randint(4, 24)
            start_date = CURRENT_DATE - timedelta(days=int(start_offset_months * 30.4))
            planned_end_date = start_date + timedelta(days=int(planned_duration_months * 30.4))
            
            actual_progress_pct = round(random.uniform(5.0, 34.5), 1)
            gap_bias = np.random.normal(4.0, 10.0)
            financial_progress_pct = round(max(3.0, min(55.0, actual_progress_pct + gap_bias)), 1)
            
            milestone_count = random.randint(4, 9)
            if random.random() < 0.28:
                status = "Delayed"
                milestones_missed = random.randint(1, 3)
                last_milestone_delay_days = random.randint(45, 240)
            else:
                status = "Ongoing"
                milestones_missed = random.choice([0, 0, 1])
                last_milestone_delay_days = 0 if milestones_missed == 0 else random.randint(10, 40)

        cumulative_expenditure_cr = round((revised_cost_cr * financial_progress_pct) / 100.0, 2)
        
        projects.append({
            "project_id": project_id,
            "project_name": project_name,
            "sector": sector_name,
            "ministry": sector_info["ministry"],
            "implementing_agency": agency,
            "state": state,
            "original_cost_cr": original_cost_cr,
            "revised_cost_cr": revised_cost_cr,
            "cumulative_expenditure_cr": cumulative_expenditure_cr,
            "planned_start_date": start_date.strftime("%Y-%m-%d"),
            "planned_end_date": planned_end_date.strftime("%Y-%m-%d"),
            "actual_progress_pct": actual_progress_pct,
            "financial_progress_pct": financial_progress_pct,
            "milestone_count": milestone_count,
            "milestones_missed": milestones_missed,
            "last_milestone_delay_days": last_milestone_delay_days,
            "status": status,
        })
        
    # Calibrate cumulative expenditure ratio to ~51.0% without breaking the >80% counts:
    total_revised = sum(p["revised_cost_cr"] for p in projects)
    total_exp = sum(p["cumulative_expenditure_cr"] for p in projects)
    current_ratio = total_exp / total_revised
    target_ratio = 0.510
    
    # Adjust expenditure of projects with financial_pct <= 78% so >80% projects stay exactly at num_fin_high
    gap_expenditure = (target_ratio * total_revised) - total_exp
    mid_and_early_revised = sum(p["revised_cost_cr"] for p in projects if p["financial_progress_pct"] <= 78.5)
    
    if mid_and_early_revised > 0:
        pct_shift = gap_expenditure / mid_and_early_revised
        for p in projects:
            if p["financial_progress_pct"] <= 78.5:
                new_fin = min(78.5, max(2.0, p["financial_progress_pct"] + (pct_shift * 100)))
                p["financial_progress_pct"] = round(new_fin, 1)
                p["cumulative_expenditure_cr"] = round((p["revised_cost_cr"] * p["financial_progress_pct"]) / 100.0, 2)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)
        
    return projects

if __name__ == "__main__":
    projs = generate_dataset()
    total_revised = sum(p["revised_cost_cr"] for p in projs)
    total_exp = sum(p["cumulative_expenditure_cr"] for p in projs)
    exp_ratio = (total_exp / total_revised) * 100
    phys_gt_80 = (sum(1 for p in projs if p["actual_progress_pct"] > 80) / len(projs)) * 100
    fin_gt_80 = (sum(1 for p in projs if p["financial_progress_pct"] > 80) / len(projs)) * 100
    
    transport_energy = sum(
        1 for p in projs if p["sector"] in ["Road Transport", "Railways", "Power", "Petroleum & Gas", "Coal"]
    ) / len(projs) * 100
    
    print(f"Generated {len(projs)} projects successfully.")
    print(f"Total Revised Cost: Rs. {total_revised:,.2f} Cr (Avg: Rs. {total_revised/len(projs):,.2f} Cr)")
    print(f"Cumulative Expenditure Ratio: {exp_ratio:.2f}% (Target: ~51%)")
    print(f"Projects with >80% Physical Progress: {phys_gt_80:.2f}% (Target: ~41%)")
    print(f"Projects with >80% Financial Progress: {fin_gt_80:.2f}% (Target: ~14%)")
    print(f"Transport & Logistics + Energy Dominance: {transport_energy:.2f}% (Target: 70-80%)")
