from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shift import Shift, Offer, Application, Booking, Waitlist
from app.models.facility import Facility, Ward
from app.models.professional import ProfessionalProfile
from app.schemas.shift import ShiftCreate, ShiftOut, OfferCreate, OfferOut, BookingOut
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.get("/", response_model=List[ShiftOut])
def list_shifts(
    status_filter: Optional[str] = None,
    role_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Shift)
    if current_user.facility_id and "FACILITY" in current_user.roles:
        query = query.filter(Shift.facility_id == current_user.facility_id)
    if status_filter:
        query = query.filter(Shift.status == status_filter.upper())
    if role_filter:
        query = query.filter(Shift.role_required.ilike(f"%{role_filter}%"))
        
    shifts = query.order_by(Shift.start_time.asc()).all()
    
    result = []
    for s in shifts:
        shift_dict = ShiftOut.model_validate(s)
        shift_dict.facility_name = s.facility.name if s.facility else "Health Facility"
        shift_dict.ward_name = s.ward.name if s.ward else "General Ward"
        result.append(shift_dict)
    return result

@router.post("/", response_model=ShiftOut)
def create_shift(
    shift_in: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    duration_hours = (shift_in.end_time - shift_in.start_time).total_seconds() / 3600.0
    total_budget = (duration_hours * shift_in.hourly_rate) + shift_in.incentive_bonus
    
    shift = Shift(
        facility_id=shift_in.facility_id,
        ward_id=shift_in.ward_id,
        role_required=shift_in.role_required,
        specialty_required=shift_in.specialty_required,
        start_time=shift_in.start_time,
        end_time=shift_in.end_time,
        break_duration_minutes=shift_in.break_duration_minutes,
        hourly_rate=shift_in.hourly_rate,
        incentive_bonus=shift_in.incentive_bonus,
        total_budget_allocated=total_budget,
        acuity_level=shift_in.acuity_level,
        required_skills=shift_in.required_skills,
        required_credentials=shift_in.required_credentials,
        notes=shift_in.notes,
        status="POSTED",
        is_recurring=shift_in.is_recurring,
        recurrence_pattern=shift_in.recurrence_pattern
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="SHIFT_CREATED",
        entity_name="Shift",
        entity_id=shift.id,
        new_value={"role": shift.role_required, "specialty": shift.specialty_required, "budget": total_budget}
    )
    
    shift_out = ShiftOut.model_validate(shift)
    shift_out.facility_name = shift.facility.name if shift.facility else "Health Facility"
    shift_out.ward_name = shift.ward.name if shift.ward else "General Ward"
    return shift_out

@router.get("/{shift_id}", response_model=ShiftOut)
def get_shift_detail(shift_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    out = ShiftOut.model_validate(shift)
    out.facility_name = shift.facility.name if shift.facility else "Health Facility"
    out.ward_name = shift.ward.name if shift.ward else "General Ward"
    return out

@router.post("/{shift_id}/apply")
def apply_for_shift(shift_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prof = db.query(ProfessionalProfile).filter(ProfessionalProfile.user_id == current_user.id).first()
    if not prof:
        raise HTTPException(status_code=400, detail="User does not have a professional profile")
    
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    existing_app = db.query(Application).filter(Application.shift_id == shift_id, Application.professional_id == prof.id).first()
    if existing_app:
        return {"message": "Application already submitted", "application_id": existing_app.id}
    
    app = Application(shift_id=shift_id, professional_id=prof.id, status="APPLIED")
    db.add(app)
    db.commit()
    db.refresh(app)
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="APPLICATION_SUBMITTED",
        entity_name="Application",
        entity_id=app.id
    )
    return {"message": "Application submitted successfully", "application_id": app.id}

@router.post("/{shift_id}/offer", response_model=OfferOut)
def send_shift_offer(
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shift = db.query(Shift).filter(Shift.id == offer_in.shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    expires_at = datetime.utcnow() + timedelta(hours=offer_in.expires_in_hours)
    offer = Offer(
        shift_id=offer_in.shift_id,
        professional_id=offer_in.professional_id,
        offered_by_user_id=current_user.id,
        status="OFFERED",
        expires_at=expires_at
    )
    shift.status = "OFFERED"
    db.add(offer)
    db.commit()
    db.refresh(offer)
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="OFFER_SENT",
        entity_name="Offer",
        entity_id=offer.id,
        new_value={"expires_at": expires_at.isoformat()}
    )
    return offer

@router.post("/offers/{offer_id}/accept", response_model=BookingOut)
def accept_offer(offer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    shift = db.query(Shift).filter(Shift.id == offer.shift_id).first()
    
    # Race condition safeguard check (Section 26)
    existing_booking = db.query(Booking).filter(Booking.shift_id == shift.id).first()
    if existing_booking:
        offer.status = "EXPIRED"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Shift has already been confirmed by another professional (Capacity full)."
        )
    
    offer.status = "ACCEPTED"
    shift.status = "CONFIRMED"
    
    booking = Booking(
        shift_id=shift.id,
        professional_id=offer.professional_id,
        confirmed_at=datetime.utcnow(),
        status="CONFIRMED"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="OFFER_ACCEPTED_BOOKING_CONFIRMED",
        entity_name="Booking",
        entity_id=booking.id
    )
    return booking
