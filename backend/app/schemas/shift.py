from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class ShiftCreate(BaseModel):
    facility_id: str
    ward_id: str
    role_required: str
    specialty_required: str
    start_time: datetime
    end_time: datetime
    break_duration_minutes: int = 30
    hourly_rate: float
    incentive_bonus: float = 0.0
    acuity_level: str = "STANDARD"
    required_skills: List[str] = []
    required_credentials: List[str] = []
    notes: Optional[str] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None

class ShiftOut(BaseModel):
    id: str
    facility_id: str
    ward_id: str
    role_required: str
    specialty_required: str
    start_time: datetime
    end_time: datetime
    break_duration_minutes: int
    hourly_rate: float
    incentive_bonus: float
    total_budget_allocated: float
    acuity_level: str
    required_skills: List[Any]
    required_credentials: List[Any]
    notes: Optional[str] = None
    status: str
    facility_name: Optional[str] = None
    ward_name: Optional[str] = None

    class Config:
        from_attributes = True

class OfferCreate(BaseModel):
    shift_id: str
    professional_id: str
    expires_in_hours: int = 24

class OfferOut(BaseModel):
    id: str
    shift_id: str
    professional_id: str
    status: str
    expires_at: datetime

    class Config:
        from_attributes = True

class BookingOut(BaseModel):
    id: str
    shift_id: str
    professional_id: str
    confirmed_at: datetime
    status: str

    class Config:
        from_attributes = True
