from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

class ClockEventCreate(BaseModel):
    shift_id: str
    professional_id: str
    event_type: str # CLOCK_IN, BREAK_START, BREAK_END, CLOCK_OUT
    latitude: Optional[float] = 53.3498
    longitude: Optional[float] = -6.2603

class ClockEventOut(BaseModel):
    id: str
    shift_id: str
    professional_id: str
    event_type: str
    timestamp: datetime
    geofence_status: str

    class Config:
        from_attributes = True

class TimesheetApproveRequest(BaseModel):
    manager_signature_svg: Optional[str] = None
    notes: Optional[str] = None

class TimesheetOut(BaseModel):
    id: str
    shift_id: str
    professional_id: str
    facility_id: str
    clock_in_time: datetime
    clock_out_time: datetime
    total_break_minutes: int
    total_hours_worked: float
    overtime_hours: float
    hourly_rate: float
    incentive_amount: float
    total_gross_pay: float
    approval_state: str
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
