from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.facility import Facility, Site, Department, Ward, StaffingRequirement
from app.core.rbac import verify_facility_access

router = APIRouter()

@router.get("/")
def list_facilities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    facilities = db.query(Facility).all()
    return facilities

@router.get("/{facility_id}")
def get_facility_detail(facility_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility

@router.get("/{facility_id}/wards")
def list_facility_wards(facility_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify facility isolation
    verify_facility_access(current_user.facility_id, facility_id, current_user.roles)
    
    sites = db.query(Site).filter(Site.facility_id == facility_id).all()
    site_ids = [s.id for s in sites]
    deps = db.query(Department).filter(Department.site_id.in_(site_ids)).all() if site_ids else []
    dep_ids = [d.id for d in deps]
    wards = db.query(Ward).filter(Ward.department_id.in_(dep_ids)).all() if dep_ids else []
    
    result = []
    for w in wards:
        reqs = db.query(StaffingRequirement).filter(StaffingRequirement.ward_id == w.id).all()
        result.append({
            "id": w.id,
            "name": w.name,
            "acuity_level": w.acuity_level,
            "bed_capacity": w.bed_capacity,
            "department_name": w.department.name if w.department else "General",
            "requirements": [
                {
                    "role_name": r.role_name,
                    "required_count": r.required_count,
                    "confirmed_count": r.confirmed_count,
                    "shortage_count": r.shortage_count,
                    "shift_type": r.shift_type
                } for r in reqs
            ]
        })
    return result
