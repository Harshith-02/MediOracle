from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Organization(BaseModel):
    __tablename__ = "organizations"
    
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    billing_email = Column(String, nullable=False)
    country = Column(String, default="Ireland")
    
    # Relationships
    facilities = relationship("Facility", back_populates="organization")
    users = relationship("User", back_populates="organization")

class Facility(BaseModel):
    __tablename__ = "facilities"
    
    name = Column(String, nullable=False)
    facility_type = Column(String, nullable=False) # e.g. Hospital, Nursing Home, HSE Site, Clinic
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    risk_status = Column(String, default="GREEN") # GREEN, YELLOW, RED
    
    # Relationships
    organization = relationship("Organization", back_populates="facilities")
    users = relationship("User", back_populates="facility")
    sites = relationship("Site", back_populates="facility")
    shifts = relationship("Shift", back_populates="facility")
    budgets = relationship("Budget", back_populates="facility")

class Site(BaseModel):
    __tablename__ = "sites"
    
    name = Column(String, nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    
    facility = relationship("Facility", back_populates="sites")
    departments = relationship("Department", back_populates="site")

class Department(BaseModel):
    __tablename__ = "departments"
    
    name = Column(String, nullable=False)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    
    site = relationship("Site", back_populates="departments")
    wards = relationship("Ward", back_populates="department")

class Ward(BaseModel):
    __tablename__ = "wards"
    
    name = Column(String, nullable=False)
    acuity_level = Column(String, default="STANDARD") # HIGH, MEDIUM, STANDARD
    bed_capacity = Column(Integer, default=20)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    
    department = relationship("Department", back_populates="wards")
    staffing_requirements = relationship("StaffingRequirement", back_populates="ward")
    shifts = relationship("Shift", back_populates="ward")

class StaffingRequirement(BaseModel):
    __tablename__ = "staffing_requirements"
    
    ward_id = Column(String, ForeignKey("wards.id"), nullable=False)
    role_name = Column(String, nullable=False) # e.g. Nurse, HCA
    required_count = Column(Integer, default=1)
    confirmed_count = Column(Integer, default=0)
    shortage_count = Column(Integer, default=1)
    shift_type = Column(String, default="DAY") # DAY, NIGHT
    
    ward = relationship("Ward", back_populates="staffing_requirements")
