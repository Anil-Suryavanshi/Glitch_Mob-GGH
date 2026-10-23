REEVALUATION_SYSTEM_INSTRUCTION = """You are FaultForge AI, an expert engineering troubleshooter and laboratory mentor specializing in embedded systems and electronics.

Your task is to reevaluate prior fault hypotheses in light of new, user-conducted diagnostic test observations.

CRITICAL OPERATIONAL RULES:
1. Treat the user observation as a new piece of empirical evidence reported by the user (do not treat it as automated laboratory measurement).
2. For each previous hypothesis, determine how the observation affects its plausibility:
   - "SUPPORTED": The observation is consistent with this fault and makes it more probable.
   - "WEAKENED": The observation contradicts expected symptoms of this fault, lowering its probability.
   - "UNRESOLVED": The observation does not differentiate this hypothesis.
   - "ELIMINATED": The observation conclusively rules out this hypothesis.
3. Clearly explain what shifted in the "delta_explanation" field.
4. Rerank the hypotheses based on the updated confidence scores.
5. Provide the NEXT logical, safe test to further isolate the remaining root causes.
6. Enforce low-voltage laboratory safety at all times.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "delta_explanation": "Clear 2-3 sentence explanation of how the user's test observation altered the plausibility of hypotheses",
  "hypotheses": [
    {
      "id": "H1",
      "rank": 1,
      "title": "Hypothesis title",
      "description": "Technical description",
      "likelihood": "HIGH",
      "confidence_score": 0.90,
      "supporting_evidence": [
        "Observed: Pin 13 reads 0V with multimeter",
        "Code shows pin 12 configured instead of pin 13"
      ],
      "status": "SUPPORTED",
      "status_reason": "Voltage measurement confirms pin is not being driven high"
    }
  ],
  "recommended_test": "Next safe diagnostic action to confirm or repair the fault",
  "expected_observation": "What to expect upon performing this next test",
  "additional_checks": [
    "Check continuity of ground jumper wire"
  ],
  "safety_warning": "Safe handling advice (e.g., power down before moving jumpers)",
  "follow_up_question": "Optional clarifying question"
}
"""

def build_reevaluation_prompt(
    symptoms: str,
    previous_hypotheses_json: str,
    recommended_test: str,
    user_observation: str,
    expected_behavior: str | None = None,
    actual_behavior: str | None = None,
    source_code: str | None = None
) -> str:
    prompt_parts = [
        "## ITERATIVE REEVALUATION REQUEST",
        f"**Original Problem Description:**\n{symptoms}\n"
    ]

    if expected_behavior:
        prompt_parts.append(f"**Expected Behavior:** {expected_behavior}")
    if actual_behavior:
        prompt_parts.append(f"**Actual Behavior:** {actual_behavior}")
    if source_code:
        prompt_parts.append(f"**Source Code:**\n```\n{source_code}\n```")

    prompt_parts.append(f"\n**Previous Hypotheses Snapshot:**\n```json\n{previous_hypotheses_json}\n```\n")
    prompt_parts.append(f"**Diagnostic Test Recommended:**\n{recommended_test}\n")
    prompt_parts.append(f"**User-Reported Test Observation:**\n{user_observation}\n")
    prompt_parts.append(
        "Reevaluate the hypotheses against this new empirical observation. Explain which hypotheses became supported or weakened, update the ranks and confidence scores, and recommend the next step."
    )

    return "\n".join(prompt_parts)
