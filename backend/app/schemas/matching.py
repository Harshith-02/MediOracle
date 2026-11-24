from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MatchOverrideRequest(BaseModel):
    shift_id: str
    professional_id: str
    override_reason: str

class MatchResultOut(BaseModel):
    professional_id: str
    professional_name: str
    role_title: str
    specialty: str
    overall_score: float
    confidence_score: float
    distance_km: float
    eligible: bool
    reasons: List[str]
    warnings: List[str]
    factor_breakdown: Dict[str, float]
    is_overridden: bool = False
    override_reason: Optional[str] = None
