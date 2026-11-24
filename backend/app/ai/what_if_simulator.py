from typing import Dict, Any

class WhatIfSimulator:
    """Simulates fill probability, expected budget impact, and risk for hypothetical shift adjustments"""
    
    def simulate_scenario(self, base_rate: float, proposed_rate: float, required_count: int, department_budget: float) -> Dict[str, Any]:
        rate_diff = proposed_rate - base_rate
        pct_change = (rate_diff / base_rate) * 100.0 if base_rate > 0 else 0
        
        # Calculate projected fill probability
        estimated_fill_prob = min(99.0, max(50.0, 75.0 + (pct_change * 1.2)))
        
        estimated_cost_per_shift = proposed_rate * 12.0 # 12-hour shift standard
        total_estimated_cost = estimated_cost_per_shift * required_count
        budget_impact_pct = round((total_estimated_cost / department_budget) * 100.0, 1) if department_budget > 0 else 0
        
        risk_level = "GREEN"
        if budget_impact_pct > 25.0:
            risk_level = "YELLOW"
        if budget_impact_pct > 50.0:
            risk_level = "RED"
            
        return {
            "proposed_rate": proposed_rate,
            "base_rate": base_rate,
            "rate_delta": round(rate_diff, 2),
            "estimated_fill_probability": round(estimated_fill_prob, 1),
            "estimated_cost_per_shift": round(estimated_cost_per_shift, 2),
            "total_estimated_cost": round(total_estimated_cost, 2),
            "budget_impact_pct": budget_impact_pct,
            "simulated_risk_status": risk_level,
            "is_estimate_disclaimer": "Projections are simulated estimates for planning purposes."
        }

what_if_simulator = WhatIfSimulator()
