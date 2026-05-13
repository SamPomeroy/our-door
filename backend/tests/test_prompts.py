"""
prompt integrity tests -- ci catches it if someone breaks the three knocks structure
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import SYSTEM_PROMPT, STRICT_SYSTEM_PROMPT, GUARDRAIL_PROMPT


def test_system_prompt_references_three_knocks():
    assert "Three Knocks" in SYSTEM_PROMPT, "system prompt must reference Three Knocks model"


def test_system_prompt_has_all_three_parts():
    assert "Hint" in SYSTEM_PROMPT, "system prompt must include Hint"
    assert "Curriculum reference" in SYSTEM_PROMPT, "system prompt must include Curriculum reference"
    assert "Next step" in SYSTEM_PROMPT, "system prompt must include Next step"


def test_system_prompt_prohibits_direct_answers():
    prompt_lower = SYSTEM_PROMPT.lower()
    assert "never" in prompt_lower or "no direct" in prompt_lower, \
        "system prompt must explicitly prohibit direct answers"


def test_strict_prompt_exists_and_differs():
    assert STRICT_SYSTEM_PROMPT != SYSTEM_PROMPT, "strict prompt must differ from main prompt"
    assert len(STRICT_SYSTEM_PROMPT) > 50, "strict prompt must be substantive"


def test_strict_prompt_has_three_knocks_parts():
    assert "Hint" in STRICT_SYSTEM_PROMPT
    assert "Curriculum reference" in STRICT_SYSTEM_PROMPT
    assert "Next step" in STRICT_SYSTEM_PROMPT


def test_guardrail_prompt_has_pass_fail():
    assert "PASS" in GUARDRAIL_PROMPT, "guardrail prompt must define PASS"
    assert "FAIL" in GUARDRAIL_PROMPT, "guardrail prompt must define FAIL"


def test_guardrail_prompt_has_response_placeholder():
    assert "{response}" in GUARDRAIL_PROMPT, "guardrail prompt must contain {response} placeholder"


def test_guardrail_prompt_references_three_knocks():
    assert "Three Knocks" in GUARDRAIL_PROMPT, "guardrail must validate against Three Knocks model"
