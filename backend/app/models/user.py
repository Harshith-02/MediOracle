from sqlalchemy import Column, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    roles = Column(JSON, default=list) # e.g. ["FACILITY", "ADMIN"]
    
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    
    # Relationships
    facility = relationship("Facility", back_populates="users")
    organization = relationship("Organization", back_populates="users")
    professional_profile = relationship("ProfessionalProfile", back_populates="user", uselist=False)
