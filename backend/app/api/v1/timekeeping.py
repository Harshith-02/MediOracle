from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shift import Shift
from app.models.professional import ProfessionalProfile
from app.models.timekeeping import ClockEvent, Timesheet, Approval
from app.schemas.timesheet import ClockEventCreate, ClockEventOut, TimesheetOut, TimesheetApproveRequest
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.post("/clock-events", response_model=ClockEventOut)
def record_clock_event(
    event_in: ClockEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shift = db.query(Shift).filter(Shift.id == event_in.shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
        
    event = ClockEvent(
        shift_id=event_in.shift_id,
        professional_id=event_in.professional_id,
        event_type=event_in.event_type.upper(),
        timestamp=datetime.utcnow(),
        latitude=event_in.latitude,
        longitude=event_in.longitude,
        geofence_status="VERIFIED_WITHIN_GEOFENCE"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # If CLOCK_OUT, automatically generate Timesheet draft
    if event_in.event_type.upper() == "CLOCK_OUT":
        clock_in = db.query(ClockEvent).filter(
            ClockEvent.shift_id == event_in.shift_id,
            ClockEvent.event_type == "CLOCK_IN"
        ).order_by(ClockEvent.timestamp.asc()).first()
        
        start_time = clock_in.timestamp if clock_in else shift.start_time
        end_time = event.timestamp
        hours = max(1.0, round((end_time - start_time).total_seconds() / 3600.0 - 0.5, 2))
        gross_pay = (hours * shift.hourly_rate) + shift.incentive_bonus
        
        existing_ts = db.query(Timesheet).filter(Timesheet.shift_id == shift.id).first()
        if not existing_ts:
            ts = Timesheet(
                shift_id=shift.id,
                professional_id=event_in.professional_id,
                facility_id=shift.facility_id,
                clock_in_time=start_time,
                clock_out_time=end_time,
                total_break_minutes=30,
                total_hours_worked=hours,
                overtime_hours=max(0.0, hours - 12.0),
                hourly_rate=shift.hourly_rate,
                incentive_amount=shift.incentive_bonus,
                total_gross_pay=gross_pay,
                approval_state="SUBMITTED"
            )
            shift.status = "COMPLETED"
            db.add(ts)
            db.commit()
            
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action=f"CLOCK_EVENT_{event.event_type}",
        entity_name="ClockEvent",
        entity_id=event.id
    )
    return event

@router.get("/timesheets", response_model=List[TimesheetOut])
def list_timesheets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Timesheet)
    if current_user.facility_id and "FACILITY" in current_user.roles:
        query = query.filter(Timesheet.facility_id == current_user.facility_id)
    return query.all()

@router.post("/timesheets/{timesheet_id}/approve", response_model=TimesheetOut)
def approve_timesheet(
    timesheet_id: str,
    approve_in: TimesheetApproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ts = db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()
    if not ts:
        raise HTTPException(status_code=404, detail="Timesheet not found")
        
    if ts.approval_state == "LOCKED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timesheet is locked following approval. Modifications require an explicit adjustment/correction workflow."
        )
        
    ts.approval_state = "LOCKED"
    ts.approved_by_user_id = current_user.id
    ts.approved_at = datetime.utcnow()
    ts.manager_signature_svg = approve_in.manager_signature_svg or "<svg>Manager Approved Signature</svg>"
    
    appr = Approval(
        timesheet_id=ts.id,
        approver_user_id=current_user.id,
        decision="APPROVED",
        notes=approve_in.notes
    )
    db.add(appr)
    db.commit()
    db.refresh(ts)
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="TIMESHEET_APPROVED_LOCKED",
        entity_name="Timesheet",
        entity_id=ts.id,
        new_value={"gross_pay": ts.total_gross_pay, "hours": ts.total_hours_worked}
    )
    return ts
