import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.facility import Facility
from app.models.professional import ProfessionalProfile
from app.models.shift import Shift
from app.core.rbac import verify_facility_access
from fastapi import HTTPException

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_1_root_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "MediOracle" in res.json()["message"]

def test_2_all_demo_roles_login(client):
    demo_accounts = [
        ("facility@stjames.ie", "FACILITY"),
        ("nurse.sarah@medioracle.com", "PROFESSIONAL"),
        ("admin@medioracle.com", "ADMIN"),
        ("compliance@medioracle.com", "COMPLIANCE"),
        ("payroll@medioracle.com", "PAYROLL"),
        ("support@medioracle.com", "SUPPORT")
    ]
    for email, role in demo_accounts:
        res = client.post("/api/v1/auth/login", data={"username": email, "password": "Password123!"})
        assert res.status_code == 200, f"Login failed for {email}"
        token_data = res.json()
        assert "access_token" in token_data
        assert role in token_data["roles"]

def test_3_protected_route_without_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401

def test_4_jwt_session_validity(client):
    login_res = client.post("/api/v1/auth/login", data={"username": "admin@medioracle.com", "password": "Password123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@medioracle.com"

def test_5_facility_isolation_enforcement():
    db = SessionLocal()
    facilities = db.query(Facility).all()
    db.close()
    assert len(facilities) >= 2
    fac1_id = facilities[0].id
    fac2_id = facilities[1].id

    # Verify that facility user for fac1 cannot access fac2
    with pytest.raises(HTTPException) as exc_info:
        verify_facility_access(user_facility_id=fac1_id, target_facility_id=fac2_id, user_roles=["FACILITY"])
    assert exc_info.value.status_code == 403
    assert "Cross-facility access prohibited" in exc_info.value.detail

    # Verify admin can access fac2
    assert verify_facility_access(user_facility_id=fac1_id, target_facility_id=fac2_id, user_roles=["ADMIN"]) is True

def test_6_seed_data_integrity():
    db = SessionLocal()
    users_count = db.query(User).count()
    fac_count = db.query(Facility).count()
    prof_count = db.query(ProfessionalProfile).count()
    shift_count = db.query(Shift).count()
    db.close()

    assert users_count >= 15
    assert fac_count >= 3
    assert prof_count >= 15
    assert shift_count >= 20
