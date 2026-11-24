import pytest
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_full_master_e2e_workflow(client):
    # 1. Facility login
    fac_login = client.post("/api/v1/auth/login", data={"username": "facility@stjames.ie", "password": "Password123!"})
    assert fac_login.status_code == 200
    fac_token = fac_login.json()["access_token"]
    fac_headers = {"Authorization": f"Bearer {fac_token}"}

    # 2. Professional login
    prof_login = client.post("/api/v1/auth/login", data={"username": "nurse.sarah@medioracle.com", "password": "Password123!"})
    assert prof_login.status_code == 200
    prof_token = prof_login.json()["access_token"]
    prof_headers = {"Authorization": f"Bearer {prof_token}"}

    # 3. Get facility wards
    facilities = client.get("/api/v1/facilities/", headers=fac_headers).json()
    fac_id = facilities[0]["id"]
    wards = client.get(f"/api/v1/facilities/{fac_id}/wards", headers=fac_headers).json()
    ward_id = wards[0]["id"]

    # 4. Facility creates new ICU shift for unique future date
    unique_days = (uuid.uuid4().int % 1000) + 10
    start_dt = (datetime.utcnow() + timedelta(days=unique_days)).isoformat()
    end_dt = (datetime.utcnow() + timedelta(days=unique_days, hours=12)).isoformat()

    shift_payload = {
        "facility_id": fac_id,
        "ward_id": ward_id,
        "role_required": "Nurse",
        "specialty_required": "ICU",
        "start_time": start_dt,
        "end_time": end_dt,
        "break_duration_minutes": 30,
        "hourly_rate": 46.0,
        "incentive_bonus": 5.0,
        "acuity_level": "HIGH",
        "required_skills": ["ICU", "Ventilator"],
        "required_credentials": ["NMBI_PIN", "BLS"],
        "notes": "Automated End-to-End Test Shift"
    }
    create_shift_res = client.post("/api/v1/shifts/", json=shift_payload, headers=fac_headers)
    assert create_shift_res.status_code == 200
    shift_id = create_shift_res.json()["id"]

    # 5. Matching engine ranks candidates
    match_res = client.get(f"/api/v1/matching/shifts/{shift_id}/candidates", headers=fac_headers)
    assert match_res.status_code == 200
    candidates = match_res.json()
    assert len(candidates) > 0
    top_candidate = candidates[0]
    prof_id = top_candidate["professional_id"]

    # 6. Facility sends offer
    offer_res = client.post(f"/api/v1/shifts/{shift_id}/offer", json={"shift_id": shift_id, "professional_id": prof_id}, headers=fac_headers)
    assert offer_res.status_code == 200
    offer_id = offer_res.json()["id"]

    # 7. Professional accepts offer
    accept_res = client.post(f"/api/v1/shifts/offers/{offer_id}/accept", headers=prof_headers)
    assert accept_res.status_code == 200
    booking_id = accept_res.json()["id"]

    # 8. Three-stage eligibility revalidation
    elig_res = client.get(f"/api/v1/compliance/eligibility-check?professional_id={prof_id}&shift_id={shift_id}&stage=CONFIRMATION", headers=fac_headers)
    assert elig_res.status_code == 200
    assert elig_res.json()["is_eligible"] is True

    # 9. Professional clock in & clock out
    clock_in_res = client.post("/api/v1/timekeeping/clock-events", json={"shift_id": shift_id, "professional_id": prof_id, "event_type": "CLOCK_IN"}, headers=prof_headers)
    assert clock_in_res.status_code == 200

    clock_out_res = client.post("/api/v1/timekeeping/clock-events", json={"shift_id": shift_id, "professional_id": prof_id, "event_type": "CLOCK_OUT"}, headers=prof_headers)
    assert clock_out_res.status_code == 200

    # 10. Manager approves timesheet
    timesheets = client.get("/api/v1/timekeeping/timesheets", headers=fac_headers).json()
    target_ts = [t for t in timesheets if t["shift_id"] == shift_id][0]
    
    appr_res = client.post(f"/api/v1/timekeeping/timesheets/{target_ts['id']}/approve", json={"notes": "Approved by E2E test"}, headers=fac_headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["approval_state"] == "LOCKED"

    # 11. Invoice generation
    inv_gen = client.post("/api/v1/finance/invoices/generate-from-timesheets", headers=fac_headers)
    assert inv_gen.status_code == 200

    # 12. Payment processing
    pay_res = client.post("/api/v1/finance/payments/process", json={"professional_id": prof_id, "amount": target_ts["total_gross_pay"]}, headers=fac_headers)
    assert pay_res.status_code == 200

    # 13. Verify Audit trail
    audit_res = client.get("/api/v1/audit/", headers=fac_headers)
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert len(events) >= 5
