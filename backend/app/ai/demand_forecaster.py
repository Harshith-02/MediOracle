from datetime import datetime, timedelta
from typing import List, Dict, Any

class DemandForecaster:
    """Predicts workforce demand and flags high-risk shortages"""
    
    def forecast_department_demand(self, facility_name: str, department_name: str) -> Dict[str, Any]:
        tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
        next_day = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
        
        return {
            "facility_name": facility_name,
            "department_name": department_name,
            "forecast_period": f"{tomorrow} to {next_day}",
            "historical_fill_rate": 94.2,
            "predicted_shortages": [
                {
                    "date": tomorrow,
                    "shift_window": "18:00–22:00",
                    "ward": "St. Vincent ICU",
                    "role_required": "Nurse",
                    "specialty": "ICU",
                    "shortage_count": 2,
                    "confidence": 92.5,
                    "recommendation": "Proactively post 2 ICU Nurse evening shifts with €5.00/h incentive bonus"
                },
                {
                    "date": next_day,
                    "shift_window": "07:30–15:30",
                    "ward": "Cedars Surgical Ward",
                    "role_required": "HCA",
                    "specialty": "General Ward",
                    "shortage_count": 1,
                    "confidence": 88.0,
                    "recommendation": "Broadcast offer to top 3 local HCAs"
                }
            ]
        }

demand_forecaster = DemandForecaster()
