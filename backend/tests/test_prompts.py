"""
prompt integrity tests -- ci catches it if someone breaks the three knocks structure
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import KNOCK_PROMPTS, KNOCK_LABELS, STRICT_FALLBACK_PROMPT, GUARDRAIL_PROMPT


def test_knock_prompts_has_three_entries():
    assert len(KNOCK_PROMPTS) == 3, "must have exactly three knock prompts"


def test_knock_labels_match_prompts():
    assert len(KNOCK_LABELS) == len(KNOCK_PROMPTS)
    assert KNOCK_LABELS == ["Hint", "Curriculum reference", "Next step"]


def test_each_knock_prompt_prohibits_direct_answers():
    for prompt in KNOCK_PROMPTS:
        lower = prompt.lower()
        assert "not" in lower or "no " in lower or "never" in lower or "do not" in lower, \
            f"each knock prompt must prohibit direct answers: {prompt[:60]}"


def test_hint_prompt_focuses_on_hint():
    assert "HINT" in KNOCK_PROMPTS[0].upper()


def test_curriculum_prompt_focuses_on_curriculum():
    assert "CURRICULUM" in KNOCK_PROMPTS[1].upper()


def test_next_step_prompt_focuses_on_next_step():
    assert "NEXT STEP" in KNOCK_PROMPTS[2].upper()


def test_strict_fallback_exists_and_substantive():
    assert len(STRICT_FALLBACK_PROMPT) > 50, "strict fallback must be substantive"


def test_guardrail_prompt_has_pass_fail():
    assert "PASS" in GUARDRAIL_PROMPT, "guardrail prompt must define PASS"
    assert "FAIL" in GUARDRAIL_PROMPT, "guardrail prompt must define FAIL"


def test_guardrail_prompt_has_response_placeholder():
    assert "{response}" in GUARDRAIL_PROMPT, "guardrail prompt must contain {response} placeholder"
