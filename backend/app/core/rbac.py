from enum import Enum
from fastapi import HTTPException, status
from typing import List, Callable

class UserRole(str, Enum):
    FACILITY = "FACILITY"
    PROFESSIONAL = "PROFESSIONAL"
    ADMIN = "ADMIN"
    RECRUITER = "RECRUITER"
    COMPLIANCE = "COMPLIANCE"
    PAYROLL = "PAYROLL"
    SUPPORT = "SUPPORT"
    REGIONAL_COORDINATOR = "REGIONAL_COORDINATOR"
    BUSINESS_LEADER = "BUSINESS_LEADER"

def check_roles(required_roles: List[UserRole]):
    def role_checker(user_roles: List[str]):
        has_role = any(r.value in user_roles or UserRole.ADMIN.value in user_roles for r in required_roles)
        if not has_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User lacks required role(s): {[r.value for r in required_roles]}"
            )
        return True
    return role_checker

def verify_facility_access(user_facility_id: str | None, target_facility_id: str, user_roles: List[str]):
    """Enforces strict facility isolation unless user is Admin/Regional Coordinator"""
    if UserRole.ADMIN.value in user_roles or UserRole.REGIONAL_COORDINATOR.value in user_roles:
        return True
    if user_facility_id and str(user_facility_id) == str(target_facility_id):
        return True
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Cross-facility access prohibited. Facility isolation enforced."
    )
