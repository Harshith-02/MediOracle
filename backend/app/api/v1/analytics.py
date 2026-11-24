from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.facility import Facility, Ward, StaffingRequirement
from app.models.shift import Shift
from app.schemas.analytics import FacilityDashboardOut, OperationalAnalyticsOut
from app.ai.demand_forecaster import demand_forecaster
from app.ai.what_if_simulator import what_if_simulator

router = APIRouter()

@router.get("/facility-dashboard", response_model=FacilityDashboardOut)
def get_facility_dashboard_metrics(
    facility_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_id = facility_id or current_user.facility_id
    facility = None
    if target_id:
        facility = db.query(Facility).filter(Facility.id == target_id).first()
        
    fac_name = facility.name if facility else "St. James Hospital (Dublin)"
    risk_status = facility.risk_status if facility else "GREEN"
    
    shifts = db.query(Shift).all()
    open_shifts = [s for s in shifts if s.status in ["POSTED", "OFFERED"]]
    confirmed_shifts = [s for s in shifts if s.status in ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]]
    
    total_shifts = len(shifts) if len(shifts) > 0 else 1
    fill_rate = round((len(confirmed_shifts) / total_shifts) * 100.0, 1)
    
    alerts = []
    if len(open_shifts) > 2:
        alerts.append("ICU Ward staffing shortage predicted for tomorrow evening shift")
    if risk_status != "GREEN":
        alerts.append("Elevated risk status flagged in Emergency Department")
        
    return FacilityDashboardOut(
        facility_name=fac_name,
        risk_status=risk_status,
        open_shifts_count=len(open_shifts),
        confirmed_shifts_count=len(confirmed_shifts),
        fill_rate_percentage=fill_rate,
        time_to_fill_hours=4.2,
        total_monthly_budget=125000.0,
        spent_to_date=48200.0,
        shortage_alerts=alerts if alerts else ["Staffing level optimal across all departments"],
        ward_breakdown=[
            {"ward_name": "St. Vincent ICU", "required": 8, "confirmed": 7, "shortage": 1, "risk": "YELLOW"},
            {"ward_name": "Cedars Surgical Ward", "required": 12, "confirmed": 12, "shortage": 0, "risk": "GREEN"},
            {"ward_name": "Emergency Care Unit", "required": 10, "confirmed": 8, "shortage": 2, "risk": "RED"},
            {"ward_name": "Pediatrics Unit", "required": 6, "confirmed": 6, "shortage": 0, "risk": "GREEN"}
        ]
    )

@router.get("/operational-analytics", response_model=OperationalAnalyticsOut)
def get_operational_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shifts = db.query(Shift).all()
    open_shifts = len([s for s in shifts if s.status in ["POSTED", "OFFERED"]])
    
    return OperationalAnalyticsOut(
        total_open_shifts=open_shifts,
        global_fill_rate=92.8,
        average_time_to_fill_hours=3.5,
        cancellation_rate=1.8,
        total_active_professionals=18,
        total_facilities_served=4,
        gross_margin_percentage=18.5,
        invoice_aging_summary={
            "current_30_days": 84500.0,
            "aging_31_60_days": 12400.0,
            "aging_61_90_days": 3200.0,
            "over_90_days": 0.0
        },
        ai_match_override_rate=4.2
    )

@router.get("/demand-forecast")
def get_demand_forecast(facility_name: str = "St. James Hospital", department_name: str = "ICU"):
    return demand_forecaster.forecast_department_demand(facility_name, department_name)

@router.get("/what-if-simulation")
def run_what_if_simulation(base_rate: float = 38.0, proposed_rate: float = 45.0, required_count: int = 2, department_budget: float = 5000.0):
    return what_if_simulator.simulate_scenario(base_rate, proposed_rate, required_count, department_budget)
