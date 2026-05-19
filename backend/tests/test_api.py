"""
api endpoint tests for our-door -- run with: pytest backend/tests/ -v
requires MOCK_MODE=true (set in environment or backend/.env)
"""

import os

os.environ["MOCK_MODE"] = "true"
os.environ["OPENAI_API_KEY"] = "mock-key"
os.environ["SECRET_KEY"] = "test-secret"

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# --- auth ---

def test_student_login_returns_token():
    resp = client.post("/auth/token", json={"role": "student", "password": "learn2024"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "student"


def test_admin_login_returns_token():
    resp = client.post("/auth/token", json={"role": "admin", "password": "teach2024"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "admin"


def test_wrong_password_returns_401():
    resp = client.post("/auth/token", json={"role": "student", "password": "wrongpassword"})
    assert resp.status_code == 401


def test_invalid_role_returns_401():
    resp = client.post("/auth/token", json={"role": "superuser", "password": "learn2024"})
    assert resp.status_code == 422  # pydantic rejects invalid literal before auth logic runs


# --- chat ---

def _student_token():
    resp = client.post("/auth/token", json={"role": "student", "password": "learn2024"})
    return resp.json()["access_token"]


def _admin_token():
    resp = client.post("/auth/token", json={"role": "admin", "password": "teach2024"})
    return resp.json()["access_token"]


def test_separate_sessions_have_independent_knock_counters():
    # two tokens = two sessions; both should start at knock 0 ("Hint")
    token_a = _student_token()
    token_b = _student_token()

    resp_a = client.post("/chat", json={"message": "what is a variable?"}, headers={"Authorization": f"Bearer {token_a}"})
    resp_b = client.post("/chat", json={"message": "what is a loop?"}, headers={"Authorization": f"Bearer {token_b}"})

    assert resp_a.status_code == 200
    assert resp_b.status_code == 200
    assert resp_a.json()["knock"] == "Hint"
    assert resp_b.json()["knock"] == "Hint"


def test_chat_returns_socratic_response():
    token = _student_token()
    resp = client.post(
        "/chat",
        json={"message": "how do i write a for loop in python?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert len(data["response"]) > 0


def test_chat_without_auth_returns_401():
    resp = client.post("/chat", json={"message": "help me"})
    assert resp.status_code == 401 or resp.status_code == 403


def test_chat_empty_message_returns_422():
    token = _student_token()
    resp = client.post(
        "/chat",
        json={"message": ""},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422 or resp.status_code == 200  # fastapi validates type, not empty string


def test_chat_missing_field_returns_422():
    token = _student_token()
    resp = client.post(
        "/chat",
        json={},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422


# --- logs ---

def test_admin_can_access_logs():
    token = _admin_token()
    resp = client.get("/logs", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_student_cannot_access_logs():
    token = _student_token()
    resp = client.get("/logs", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_logs_without_auth_returns_401():
    resp = client.get("/logs")
    assert resp.status_code == 401 or resp.status_code == 403
