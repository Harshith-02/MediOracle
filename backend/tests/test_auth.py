import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "MediOracle" in response.json()["message"]

def test_demo_accounts_endpoint(client):
    response = client.get("/api/v1/auth/demo-accounts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    roles = [acc["role"] for acc in data]
    assert "ADMIN" in roles
    assert "FACILITY" in roles
    assert "PROFESSIONAL" in roles

def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "facility@stjames.ie", "password": "Password123!"}
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert "FACILITY" in token_data["roles"]

def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "facility@stjames.ie", "password": "WrongPassword!"}
    )
    assert response.status_code == 401
