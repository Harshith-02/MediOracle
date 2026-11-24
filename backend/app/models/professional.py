from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ProfessionalProfile(BaseModel):
    __tablename__ = "professional_profiles"
    
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    role_title = Column(String, nullable=False) # Nurse, HCA, Social Care Worker, Midwife
    specialty = Column(String, nullable=False) # ICU, Emergency, General Ward, Pediatrics, Mental Health
    nmbi_pin = Column(String, nullable=True)
    garda_vetting_ref = Column(String, nullable=True)
    years_experience = Column(Integer, default=0)
    hourly_rate_min = Column(Float, default=30.0)
    rating_average = Column(Float, default=5.0)
    total_shifts_completed = Column(Integer, default=0)
    reliability_score = Column(Float, default=100.0) # 0 - 100%
    compliance_status = Column(String, default="FULLY_COMPLIANT") # FULLY_COMPLIANT, EXPIRING_SOON, NON_COMPLIANT
    
    address = Column(String, nullable=True)
    city = Column(String, default="Dublin")
    latitude = Column(Float, default=53.3498)
    longitude = Column(Float, default=-6.2603)
    max_commute_km = Column(Float, default=30.0)
    
    user = relationship("User", back_populates="professional_profile")
    availabilities = relationship("Availability", back_populates="professional")
    qualifications = relationship("Qualification", back_populates="professional")
    credentials = relationship("Credential", back_populates="professional")
    references = relationship("Reference", back_populates="professional")
    work_histories = relationship("WorkHistory", back_populates="professional")

class Availability(BaseModel):
    __tablename__ = "availabilities"
    
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False) # 0 = Monday, 6 = Sunday
    start_time = Column(String, nullable=False) # "07:00"
    end_time = Column(String, nullable=False)   # "19:00"
    is_recurring = Column(Boolean, default=True)
    specific_date = Column(DateTime, nullable=True)
    
    professional = relationship("ProfessionalProfile", back_populates="availabilities")

class Qualification(BaseModel):
    __tablename__ = "qualifications"
    
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    year_obtained = Column(Integer, nullable=False)
    
    professional = relationship("ProfessionalProfile", back_populates="qualifications")

class Credential(BaseModel):
    __tablename__ = "credentials"
    
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    credential_type = Column(String, nullable=False) # NMBI_PIN, GARDA_VETTING, BLS, ACLS, IMMUNIZATION, MANDATORY_TRAINING
    issuer = Column(String, nullable=False)
    document_ref = Column(String, nullable=True)
    verification_status = Column(String, default="PENDING") # PENDING, VERIFIED, REJECTED, EXPIRED, EXPIRING_SOON, RESTRICTED
    issue_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    reviewer_notes = Column(String, nullable=True)
    
    professional = relationship("ProfessionalProfile", back_populates="credentials")
    evidences = relationship("CredentialEvidence", back_populates="credential")

class CredentialEvidence(BaseModel):
    __tablename__ = "credential_evidences"
    
    credential_id = Column(String, ForeignKey("credentials.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    ocr_extracted_data = Column(JSON, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    
    credential = relationship("Credential", back_populates="evidences")

class Reference(BaseModel):
    __tablename__ = "references"
    
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    referee_name = Column(String, nullable=False)
    referee_title = Column(String, nullable=False)
    referee_email = Column(String, nullable=False)
    status = Column(String, default="REQUESTED") # REQUESTED, SENT, RECEIVED, REVIEWED, REJECTED
    rating = Column(Float, nullable=True)
    comments = Column(String, nullable=True)
    
    professional = relationship("ProfessionalProfile", back_populates="references")

class WorkHistory(BaseModel):
    __tablename__ = "work_histories"
    
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=False)
    facility_name = Column(String, nullable=False)
    role_title = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=False)
    
    professional = relationship("ProfessionalProfile", back_populates="work_histories")
