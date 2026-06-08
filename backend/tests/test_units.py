"""
unit tests for our-door core functions -- run with: pytest backend/tests/ -v
tests pure/isolated functions that don't require a running server
"""

import os

os.environ["MOCK_MODE"] = "true"
os.environ["OPENAI_API_KEY"] = "mock-key"
os.environ["SECRET_KEY"] = "test-secret"

import main


# --- embed ---

def test_embed_mock_returns_correct_dimension():
    result = main.embed("what is a for loop?")
    assert isinstance(result, list)
    assert len(result) == 1536, "mock embedding must match text-embedding-3-small dimension"


def test_embed_mock_returns_floats():
    result = main.embed("test query")
    assert all(isinstance(v, float) for v in result)


# --- call_llm ---

def test_call_llm_mock_returns_string():
    result = main.call_llm("you are a tutor", "what is a variable?")
    assert isinstance(result, str)
    assert len(result) > 0


def test_call_llm_mock_returns_from_known_responses():
    result = main.call_llm("system", "user")
    assert result in main.MOCK_RESPONSES


# --- passes_guardrail ---

def test_guardrail_mock_always_passes():
    # in MOCK_MODE guardrail should always return True
    assert main.passes_guardrail("any response at all") is True


# --- query_chroma ---

def test_query_chroma_returns_empty_when_unavailable():
    # chroma isn't running in CI -- should gracefully return []
    result = main.query_chroma([0.0] * 1536)
    assert isinstance(result, list)
    # may be empty (chroma down) or populated -- just must not crash


# --- sqlite logging ---

def test_insert_and_fetch_logs(tmp_path, monkeypatch):
    db = str(tmp_path / "test_logs.db")
    monkeypatch.setattr(main, "DB_PATH", db)

    # init the db
    main.init_db()

    # insert a log entry
    main.insert_log("how do i write a list?", "what have you tried so far?", "hint")

    # fetch and verify
    logs = main.fetch_logs()
    assert len(logs) == 1
    assert logs[0]["question"] == "how do i write a list?"
    assert logs[0]["response"] == "what have you tried so far?"
    assert "timestamp" in logs[0]
    assert "topic" in logs[0]


def test_fetch_logs_returns_newest_first(tmp_path, monkeypatch):
    db = str(tmp_path / "test_logs.db")
    monkeypatch.setattr(main, "DB_PATH", db)
    main.init_db()

    main.insert_log("first question", "first response", "hint")
    main.insert_log("second question", "second response", "curriculum")

    logs = main.fetch_logs()
    assert len(logs) == 2
    assert logs[0]["question"] == "second question"  # newest first


def test_init_db_is_idempotent(tmp_path, monkeypatch):
    db = str(tmp_path / "test_logs.db")
    monkeypatch.setattr(main, "DB_PATH", db)

    # calling init_db twice should not raise or corrupt the db
    main.init_db()
    main.init_db()
    logs = main.fetch_logs()
    assert logs == []
