from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.auth import Token, UserOut, UserCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        subject=user.id,
        roles=user.roles,
        facility_id=user.facility_id
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "roles": user.roles,
        "facility_id": user.facility_id
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts():
    """Provides standard demo accounts for effortless multi-role portal testing"""
    return [
        {
            "role": "ADMIN",
            "email": "admin@medioracle.com",
            "password": "Password123!",
            "description": "Platform Operations & Master Agency Admin"
        },
        {
            "role": "FACILITY",
            "email": "facility@stjames.ie",
            "password": "Password123!",
            "description": "St. James Hospital Workforce & Shift Manager"
        },
        {
            "role": "PROFESSIONAL",
            "email": "nurse.sarah@medioracle.com",
            "password": "Password123!",
            "description": "Sarah Connor - Qualified ICU Nurse (RGN)"
        },
        {
            "role": "COMPLIANCE",
            "email": "compliance@medioracle.com",
            "password": "Password123!",
            "description": "Compliance Review Officer (NMBI/Garda)"
        },
        {
            "role": "PAYROLL",
            "email": "payroll@medioracle.com",
            "password": "Password123!",
            "description": "Payroll & Invoice Reconciliation Manager"
        },
        {
            "role": "SUPPORT",
            "email": "support@medioracle.com",
            "password": "Password123!",
            "description": "Help Desk Agent & Escalation Manager"
        }
    ]
