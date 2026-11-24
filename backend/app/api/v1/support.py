from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.support import Notification, SupportCase, Message

router = APIRouter()

@router.get("/notifications")
def get_user_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notes = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notes

@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if note:
        note.is_read = True
        db.commit()
    return {"status": "success"}

@router.get("/support-cases")
def list_support_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cases = db.query(SupportCase).order_by(SupportCase.created_at.desc()).all()
    return cases

@router.get("/knowledge-base")
def get_knowledge_base_articles():
    return [
        {
            "id": "kb-1",
            "category": "Compliance & NMBI",
            "title": "Annual NMBI Retention Certificate Renewal & Verification Guide",
            "content": "All Registered General Nurses (RGNs) must maintain active registration with the Nursing & Midwifery Board of Ireland. MediOracle automatically runs weekly verification checks against the NMBI register."
        },
        {
            "id": "kb-2",
            "category": "Timekeeping & Clock In",
            "title": "How Digital Geofenced Timekeeping Works",
            "content": "Professionals can clock in up to 15 minutes prior to shift start using the mobile portal. GPS coordinates are validated against the hospital ward geofence boundary."
        },
        {
            "id": "kb-3",
            "category": "Payroll & Instant Pay",
            "title": "SEPA Instant Pay Settlement Eligibility & Processing Times",
            "content": "Once your digital timesheet is approved by the ward manager, approved earnings become eligible for instant settlement via direct SEPA transfer."
        }
    ]
