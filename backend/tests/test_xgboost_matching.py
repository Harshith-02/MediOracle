import pytest
from app.ai.matching_engine import matching_engine, calculate_haversine_distance
from app.models.shift import Shift
from app.models.facility import Facility
from app.models.professional import ProfessionalProfile

def test_haversine_distance():
    # Dublin center to St James Hospital ~ 2.5 km
    dist = calculate_haversine_distance(53.3498, -6.2603, 53.3418, -6.2938)
    assert 1.0 <= dist <= 4.0

def test_xgboost_matching_high_affinity_candidate():
    facility = Facility(
        id="fac-dublin",
        name="St. James Hospital",
        address="James's St, Dublin 8",
        latitude=53.3418,
        longitude=-6.2938
    )
    shift = Shift(
        id="shift-icu-1",
        facility_id=facility.id,
        facility=facility,
        role_required="Nurse",
        specialty_required="ICU",
        hourly_rate=48.0,
        status="OPEN"
    )
    prof_excellent = ProfessionalProfile(
        id="prof-icu-sarah",
        role_title="Nurse",
        specialty="ICU",
        hourly_rate_min=42.0,
        max_commute_km=35.0,
        latitude=53.3450,
        longitude=-6.2800,
        compliance_status="FULLY_COMPLIANT",
        rating_average=4.9,
        reliability_score=98.0,
        total_shifts_completed=18
    )

    result = matching_engine.score_professional_for_shift(shift, prof_excellent)

    assert "overall_score" in result
    assert result["overall_score"] >= 80.0
    assert result["confidence_score"] >= 80.0
    assert result["eligible"] is True
    assert "factor_breakdown" in result
    assert result["factor_breakdown"]["specialty_match"] == 100.0
    assert result["factor_breakdown"]["credentials"] == 100.0
    assert result["model_type"] == "XGBoost Regressor (Gradient Boosted Trees)"
    assert any("XGBoost Specialty Match" in r or "Specialty" in r for r in result["reasons"])

def test_xgboost_matching_non_compliant_candidate():
    facility = Facility(id="fac-1", name="Mater Hospital", latitude=53.3600, longitude=-6.2650)
    shift = Shift(
        id="shift-surg-1",
        facility=facility,
        role_required="Nurse",
        specialty_required="Surgical",
        hourly_rate=40.0
    )
    prof_non_compliant = ProfessionalProfile(
        id="prof-expired",
        role_title="Nurse",
        specialty="Surgical",
        hourly_rate_min=40.0,
        max_commute_km=25.0,
        latitude=53.3605,
        longitude=-6.2640,
        compliance_status="NON_COMPLIANT",
        rating_average=4.2,
        reliability_score=85.0
    )

    result = matching_engine.score_professional_for_shift(shift, prof_non_compliant)
    assert result["eligible"] is False
    assert result["overall_score"] < 60.0
    assert any("Compliance restriction active" in w for w in result["warnings"])
