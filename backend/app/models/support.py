from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from app.models.base import BaseModel

class Message(BaseModel):
    __tablename__ = "messages"
    
    sender_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    category = Column(String, default="OFFER") # OFFER, BOOKING, COMPLIANCE, PAYROLL, SYSTEM
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)

class SupportCase(BaseModel):
    __tablename__ = "support_cases"
    
    case_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)
    category = Column(String, nullable=False) # SHIFT_DISPUTE, COMPLIANCE_ISSUE, BILLING_QUERY, TECHNICAL
    priority = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, URGENT
    assigned_agent_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="OPEN") # OPEN, IN_PROGRESS, WAITING, ESCALATED, RESOLVED, CLOSED
    subject = Column(String, nullable=False)
    description = Column(String, nullable=False)
    sla_hours = Column(Integer, default=24)
