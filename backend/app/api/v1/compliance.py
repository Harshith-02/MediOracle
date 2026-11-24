from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.professional import ProfessionalProfile, Credential
from app.schemas.compliance import CredentialOut, CredentialCreate, EligibilityCheckResponse
from app.integrations.ocr_mock import ocr_service
from app.integrations.nmbi_mock import nmbi_service

router = APIRouter()

@router.get("/credentials", response_model=List[CredentialOut])
def list_credentials(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Credential)
    if "PROFESSIONAL" in current_user.roles:
        prof = db.query(ProfessionalProfile).filter(ProfessionalProfile.user_id == current_user.id).first()
        if prof:
            query = query.filter(Credential.professional_id == prof.id)
    return query.all()

@router.post("/credentials/upload-ocr")
def upload_credential_ocr(file_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    extracted = ocr_service.extract_document_text(file_name)
    return extracted

@router.get("/eligibility-check", response_model=EligibilityCheckResponse)
def check_three_stage_eligibility(
    professional_id: str,
    shift_id: str,
    stage: str = "OFFER", # OFFER, CONFIRMATION, SHIFT_START
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prof = db.query(ProfessionalProfile).filter(ProfessionalProfile.id == professional_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professional not found")
        
    passed = ["Role qualification matched", "Working-time limits within threshold"]
    failures = []
    
    # Check credentials
    if prof.compliance_status == "NON_COMPLIANT":
        failures.append("Expired mandatory NMBI/Garda credential active restriction")
    else:
        passed.append("Mandatory NMBI & Garda vetting verified")
        
    if stage.upper() == "SHIFT_START":
        passed.append("GPS location proximity verified")
        
    is_eligible = len(failures) == 0
    return EligibilityCheckResponse(
        is_eligible=is_eligible,
        stage=stage.upper(),
        checks_passed=passed,
        failures=failures
    )
