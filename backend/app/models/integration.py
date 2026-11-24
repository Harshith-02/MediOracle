from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from app.models.base import BaseModel

class Integration(BaseModel):
    __tablename__ = "integrations"
    
    name = Column(String, nullable=False) # e.g. MOCK_NMBI, MOCK_GARDA, MOCK_MAPS, MOCK_OCR, MOCK_STRIPE
    service_type = Column(String, nullable=False)
    status = Column(String, default="ACTIVE") # ACTIVE, INACTIVE, ERROR
    last_sync_at = Column(DateTime, nullable=True)
    error_count = Column(Integer, default=0)
    config = Column(JSON, nullable=True)

class WebhookEvent(BaseModel):
    __tablename__ = "webhook_events"
    
    event_type = Column(String, nullable=False) # shift.created, offer.accepted, etc.
    payload = Column(JSON, nullable=False)
    status = Column(String, default="PROCESSED") # PENDING, PROCESSED, FAILED
    processed_at = Column(DateTime, nullable=True)

class ImportJob(BaseModel):
    __tablename__ = "import_jobs"
    
    file_name = Column(String, nullable=False)
    entity_type = Column(String, nullable=False) # PROFESSIONALS, FACILITIES, SHIFTS
    total_rows = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    status = Column(String, default="COMPLETED") # PROCESSING, COMPLETED, FAILED
    error_report = Column(JSON, nullable=True)
