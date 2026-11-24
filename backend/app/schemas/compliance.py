from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class CredentialCreate(BaseModel):
    credential_type: str
    issuer: str
    issue_date: datetime
    expiry_date: datetime
    document_ref: Optional[str] = None

class CredentialOut(BaseModel):
    id: str
    professional_id: str
    credential_type: str
    issuer: str
    verification_status: str
    issue_date: datetime
    expiry_date: datetime
    reviewer_notes: Optional[str] = None

    class Config:
        from_attributes = True

class EligibilityCheckResponse(BaseModel):
    is_eligible: bool
    stage: str # OFFER, CONFIRMATION, SHIFT_START
    checks_passed: List[str]
    failures: List[str]
    disclaimer: str = "Platform three-stage eligibility validation."
