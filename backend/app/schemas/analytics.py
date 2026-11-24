from pydantic import BaseModel
from typing import List, Dict, Any

class FacilityDashboardOut(BaseModel):
    facility_name: str
    risk_status: str # GREEN, YELLOW, RED
    open_shifts_count: int
    confirmed_shifts_count: int
    fill_rate_percentage: float
    time_to_fill_hours: float
    total_monthly_budget: float
    spent_to_date: float
    shortage_alerts: List[str]
    ward_breakdown: List[Dict[str, Any]]

class OperationalAnalyticsOut(BaseModel):
    total_open_shifts: int
    global_fill_rate: float
    average_time_to_fill_hours: float
    cancellation_rate: float
    total_active_professionals: int
    total_facilities_served: int
    gross_margin_percentage: float
    invoice_aging_summary: Dict[str, float]
    ai_match_override_rate: float
