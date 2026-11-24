from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shift import Shift, MatchScore
from app.models.professional import ProfessionalProfile
from app.schemas.matching import MatchResultOut, MatchOverrideRequest
from app.ai.matching_engine import matching_engine
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.get("/shifts/{shift_id}/candidates", response_model=List[MatchResultOut])
def get_matching_candidates(shift_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    professionals = db.query(ProfessionalProfile).all()
    results = []
    
    for prof in professionals:
        res = matching_engine.score_professional_for_shift(shift, prof)
        
        # Check if overridden in DB
        existing_override = db.query(MatchScore).filter(
            MatchScore.shift_id == shift_id,
            MatchScore.professional_id == prof.id
        ).first()
        
        is_overridden = existing_override.is_overridden if existing_override else False
        override_reason = existing_override.override_reason if existing_override else None
        
        user_name = prof.user.full_name if prof.user else "Professional"
        
        results.append(MatchResultOut(
            professional_id=prof.id,
            professional_name=user_name,
            role_title=prof.role_title,
            specialty=prof.specialty,
            overall_score=res["overall_score"],
            confidence_score=res["confidence_score"],
            distance_km=res["distance_km"],
            eligible=res["eligible"],
            reasons=res["reasons"],
            warnings=res["warnings"],
            factor_breakdown=res["factor_breakdown"],
            is_overridden=is_overridden,
            override_reason=override_reason
        ))
        
    results.sort(key=lambda x: x.overall_score, reverse=True)
    return results

@router.post("/override")
def override_match_score(
    override_in: MatchOverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(MatchScore).filter(
        MatchScore.shift_id == override_in.shift_id,
        MatchScore.professional_id == override_in.professional_id
    ).first()
    
    if not existing:
        shift = db.query(Shift).filter(Shift.id == override_in.shift_id).first()
        prof = db.query(ProfessionalProfile).filter(ProfessionalProfile.id == override_in.professional_id).first()
        sc = matching_engine.score_professional_for_shift(shift, prof)
        
        existing = MatchScore(
            shift_id=override_in.shift_id,
            professional_id=override_in.professional_id,
            overall_score=sc["overall_score"],
            confidence_score=sc["confidence_score"],
            factor_breakdown=sc["factor_breakdown"],
            reasons=sc["reasons"],
            warnings=sc["warnings"]
        )
        db.add(existing)
        
    existing.is_overridden = True
    existing.override_reason = override_in.override_reason
    existing.overridden_by_user_id = current_user.id
    db.commit()
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="AI_MATCH_OVERRIDDEN",
        entity_name="MatchScore",
        entity_id=existing.id,
        reason=override_in.override_reason
    )
    return {"message": "AI recommendation overridden successfully", "override_reason": override_in.override_reason}
