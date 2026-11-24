from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Shift(BaseModel):
    __tablename__ = "shifts"
    
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    ward_id = Column(String, ForeignKey("wards.id"), nullable=False)
    
    role_required = Column(String, nullable=False) # e.g. Nurse, HCA
    specialty_required = Column(String, nullable=False) # ICU, Emergency, General Ward
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    break_duration_minutes = Column(Integer, default=30)
    
    hourly_rate = Column(Float, nullable=False)
    incentive_bonus = Column(Float, default=0.0)
    total_budget_allocated = Column(Float, nullable=False)
    
    acuity_level = Column(String, default="STANDARD")
    required_skills = Column(JSON, default=list)
    required_credentials = Column(JSON, default=list)
    notes = Column(String, nullable=True)
    
    status = Column(String, default="POSTED", index=True) 
    # DRAFT, POSTED, OFFERED, ACCEPTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REPLACEMENT_REQUIRED, DISPUTED, RESOLVED
    
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True)
    
    # Relationships
    facility = relationship("Facility", back_populates="shifts")
    ward = relationship("Ward", back_populates="shifts")
    offers = relationship("Offer", back_populates="shift")
    applications = relationship("Application", back_populates="shift")
    match_scores = relationship("MatchScore", back_populates="shift")
    booking = relationship("Booking", back_populates="shift", uselist=False)
    clock_events = relationship("ClockEvent", back_populates="shift")
    timesheet = relationship("Timesheet", back_populates="shift", uselist=False)

class Offer(BaseModel):
    __tablename__ = "offers"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    offered_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    status = Column(String, default="OFFERED") # OFFERED, ACCEPTED, DECLINED, EXPIRED, WITHDRAWN
    expires_at = Column(DateTime, nullable=False)
    
    shift = relationship("Shift", back_populates="offers")

class Application(BaseModel):
    __tablename__ = "applications"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    status = Column(String, default="APPLIED") # APPLIED, SHORTLISTED, REJECTED, WITHDRAWN
    
    shift = relationship("Shift", back_populates="applications")

class MatchScore(BaseModel):
    __tablename__ = "match_scores"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    
    overall_score = Column(Float, nullable=False) # 0 - 100%
    confidence_score = Column(Float, nullable=False) # 0 - 100%
    
    factor_breakdown = Column(JSON, nullable=False) 
    reasons = Column(JSON, default=list) # List of positive points (✓)
    warnings = Column(JSON, default=list) # List of warnings (⚠)
    
    is_overridden = Column(Boolean, default=False)
    override_reason = Column(String, nullable=True)
    overridden_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    shift = relationship("Shift", back_populates="match_scores")

class Booking(BaseModel):
    __tablename__ = "bookings"
    
    shift_id = Column(String, ForeignKey("shifts.id"), unique=True, nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    confirmed_at = Column(DateTime, nullable=False)
    status = Column(String, default="CONFIRMED") # CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    
    shift = relationship("Shift", back_populates="booking")

class Waitlist(BaseModel):
    __tablename__ = "waitlists"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    priority_rank = Column(Integer, nullable=False)
    status = Column(String, default="WAITING") # WAITING, NOTIFIED, CONVERTED, EXPIRED

class Cancellation(BaseModel):
    __tablename__ = "cancellations"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    cancelled_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=False)
    replacement_found = Column(Boolean, default=False)
