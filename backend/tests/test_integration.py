"""
integration tests for our-door — requires the full live stack

    docker compose up -d
    python ingest/ingest.py  (first run only)
    pytest tests/test_integration.py -v

these make real openai calls (~5-10 cents per run). do not run in ci.
"""

import pytest
import requests

BASE = "http://localhost:8000"


def _token(role: str, password: str) -> str:
    resp = requests.post(f"{BASE}/auth/token", json={"role": role, "password": password})
    resp.raise_for_status()
    return resp.json()["access_token"]


def _chat(token: str, message: str) -> dict:
    resp = requests.post(
        f"{BASE}/chat",
        json={"message": message},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp.raise_for_status()
    return resp.json()


@pytest.fixture(scope="module")
def student_token():
    try:
        return _token("student", "learn2024")
    except requests.exceptions.ConnectionError:
        pytest.skip("backend not reachable — is the stack running?")


@pytest.fixture(scope="module")
def admin_token():
    try:
        return _token("admin", "teach2024")
    except requests.exceptions.ConnectionError:
        pytest.skip("backend not reachable — is the stack running?")


# --- auth ---

def test_student_login_live():
    token = _token("student", "learn2024")
    assert isinstance(token, str) and len(token) > 0


def test_admin_login_live():
    token = _token("admin", "teach2024")
    assert isinstance(token, str) and len(token) > 0


def test_wrong_password_returns_401_live():
    resp = requests.post(f"{BASE}/auth/token", json={"role": "student", "password": "bad"})
    assert resp.status_code == 401


# --- chat ---

def test_chat_returns_response_and_knock(student_token):
    data = _chat(student_token, "what is a for loop?")
    assert "response" in data
    assert "knock" in data
    assert len(data["response"]) > 0
    assert data["knock"] in ("Hint", "Curriculum reference", "Next step")


def test_three_knocks_cycle_in_order(student_token):
    # fresh token = fresh session, starts at Hint
    token = _token("student", "learn2024")
    labels = []
    for msg in [
        "what is a variable?",
        "i still dont understand",
        "give me a next step",
        "what about scope?",  # should reset to Hint
    ]:
        labels.append(_chat(token, msg)["knock"])

    assert labels[0] == "Hint"
    assert labels[1] == "Curriculum reference"
    assert labels[2] == "Next step"
    assert labels[3] == "Hint"


def test_two_sessions_have_independent_knock_counters():
    token_a = _token("student", "learn2024")
    token_b = _token("student", "learn2024")

    knock_a = _chat(token_a, "what is a list?")["knock"]
    knock_b = _chat(token_b, "what is a dict?")["knock"]

    assert knock_a == "Hint"
    assert knock_b == "Hint"


def test_response_is_socratic_not_direct(student_token):
    # can't assert exact wording, but response must not be suspiciously short
    # and should not start with a flat declarative answer
    token = _token("student", "learn2024")
    data = _chat(token, "just tell me what LEGB stands for")
    response = data["response"].lower()
    # guardrail should block direct answers — response should be a question or prompt
    assert len(response) > 20
    assert data["knock"] == "Hint"


def test_chat_without_auth_returns_401():
    resp = requests.post(f"{BASE}/chat", json={"message": "hello"})
    assert resp.status_code in (401, 403)


# --- logs ---

def test_admin_can_fetch_logs(student_token, admin_token):
    # generate at least one log entry first
    _chat(student_token, "what is a function?")

    resp = requests.get(f"{BASE}/logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    logs = resp.json()
    assert isinstance(logs, list)
    assert len(logs) > 0

    entry = logs[0]
    assert "question" in entry
    assert "response" in entry
    assert "timestamp" in entry


def test_student_cannot_fetch_logs(student_token):
    resp = requests.get(f"{BASE}/logs", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 403
