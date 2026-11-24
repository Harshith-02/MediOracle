from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.audit import AuditEvent

router = APIRouter()

@router.get("/")
def list_audit_events(
    action_filter: Optional[str] = None,
    entity_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditEvent)
    if action_filter:
        query = query.filter(AuditEvent.action.ilike(f"%{action_filter}%"))
    if entity_filter:
        query = query.filter(AuditEvent.entity_name.ilike(f"%{entity_filter}%"))
        
    events = query.order_by(AuditEvent.created_at.desc()).limit(100).all()
    return events
