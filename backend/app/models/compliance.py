from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ComplianceRule(BaseModel):
    __tablename__ = "compliance_rules"
    
    role_type = Column(String, nullable=False)
    specialty = Column(String, nullable=True)
    required_credentials = Column(JSON, default=list) # e.g. ["NMBI_PIN", "GARDA_VETTING", "BLS"]
    max_weekly_hours = Column(Integer, default=48)
    min_rest_hours_between_shifts = Column(Integer, default=11)
    is_active = Column(Boolean, default=True)

class Verification(BaseModel):
    __tablename__ = "verifications"
    
    credential_id = Column(String, ForeignKey("credentials.id"), nullable=False)
    verified_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    verification_source = Column(String, nullable=False) # MOCK_NMBI_API, MANUAL_REVIEW, MOCK_GARDA_REGISTRY
    result = Column(String, nullable=False) # PASSED, FAILED, RESTRICTED
    notes = Column(String, nullable=True)

class Rating(BaseModel):
    __tablename__ = "ratings"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    rated_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    
    competence = Column(Float, default=5.0)
    reliability = Column(Float, default=5.0)
    communication = Column(Float, default=5.0)
    teamwork = Column(Float, default=5.0)
    protocol_adherence = Column(Float, default=5.0)
    overall_rating = Column(Float, default=5.0)
    feedback_text = Column(String, nullable=True)

class QualityAction(BaseModel):
    __tablename__ = "quality_actions"
    
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    action_type = Column(String, nullable=False) # COMMENDATION, TRAINING_RECOMMENDED, WARNING, BLOCK_TEMPORARY, BLOCK_PERMANENT
    reason = Column(String, nullable=False)
    created_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
