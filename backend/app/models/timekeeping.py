from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ClockEvent(BaseModel):
    __tablename__ = "clock_events"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    
    event_type = Column(String, nullable=False) # CLOCK_IN, BREAK_START, BREAK_END, CLOCK_OUT
    timestamp = Column(DateTime, nullable=False)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geofence_status = Column(String, default="VERIFIED_WITHIN_GEOFENCE") # VERIFIED, OUTSIDE, SIMULATED
    
    shift = relationship("Shift", back_populates="clock_events")

class Timesheet(BaseModel):
    __tablename__ = "timesheets"
    
    shift_id = Column(String, ForeignKey("shifts.id"), unique=True, nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    
    clock_in_time = Column(DateTime, nullable=False)
    clock_out_time = Column(DateTime, nullable=False)
    total_break_minutes = Column(Integer, default=30)
    
    total_hours_worked = Column(Float, nullable=False)
    overtime_hours = Column(Float, default=0.0)
    hourly_rate = Column(Float, nullable=False)
    incentive_amount = Column(Float, default=0.0)
    total_gross_pay = Column(Float, nullable=False)
    
    approval_state = Column(String, default="SUBMITTED", index=True) # DRAFT, SUBMITTED, APPROVED, REJECTED, CORRECTED, LOCKED
    
    manager_signature_svg = Column(String, nullable=True)
    approved_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    shift = relationship("Shift", back_populates="timesheet")
    approvals = relationship("Approval", back_populates="timesheet")

class Approval(BaseModel):
    __tablename__ = "approvals"
    
    timesheet_id = Column(String, ForeignKey("timesheets.id"), nullable=False)
    approver_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    decision = Column(String, nullable=False) # APPROVED, REJECTED, AMENDED
    notes = Column(String, nullable=True)
    
    timesheet = relationship("Timesheet", back_populates="approvals")

class Incident(BaseModel):
    __tablename__ = "incidents"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=True)
    reported_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    incident_type = Column(String, nullable=False) # LATE_ARRIVAL, ABSENCE, CLINICAL_ERR, BEHAVIORAL
    severity = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(String, nullable=False)
    status = Column(String, default="OPEN") # OPEN, UNDER_INVESTIGATION, RESOLVED, ESCALATED
