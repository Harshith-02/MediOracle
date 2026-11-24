from sqlalchemy import Column, String, DateTime, JSON
from app.models.base import BaseModel

class AuditEvent(BaseModel):
    __tablename__ = "audit_events"
    
    actor_user_id = Column(String, nullable=False, index=True)
    actor_email = Column(String, nullable=False)
    action = Column(String, nullable=False, index=True) # e.g. SHIFT_CREATED, OFFER_ACCEPTED, TIMESHEET_APPROVED, AI_OVERRIDE
    entity_name = Column(String, nullable=False)
    entity_id = Column(String, nullable=False, index=True)
    
    previous_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(String, nullable=True)
    metadata_info = Column(JSON, nullable=True)
