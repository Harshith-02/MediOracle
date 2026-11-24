from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    roles: List[str]
    facility_id: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    roles: List[str] = []
    facility_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    roles: List[str]
    facility_id: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    phone_number: Optional[str] = None
    is_active: bool
    is_verified: bool
    roles: List[str]
    facility_id: Optional[str] = None
    organization_id: Optional[str] = None

    class Config:
        from_attributes = True
