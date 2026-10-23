import pytest
from pydantic import ValidationError
from backend.app.schemas import (
    Hypothesis,
    DiagnosisReport,
    ReevaluationReport,
    ObservationCreate,
    RepairCreate
)

def test_hypothesis_valid():
    h = Hypothesis(
        id="H1",
        rank=1,
        title="Reversed LED Polarity",
        description="LED orientation is backwards.",
        likelihood="HIGH",
        confidence_score=0.85,
        supporting_evidence=["LED stays dark"]
    )
    assert h.id == "H1"
    assert h.confidence_score == 0.85

def test_hypothesis_invalid_confidence():
    with pytest.raises(ValidationError):
        Hypothesis(
            id="H1",
            rank=1,
            title="Invalid",
            description="Confidence out of range",
            confidence_score=1.5  # must be <= 1.0
        )

def test_diagnosis_report_validation():
    report = DiagnosisReport(
        problem_summary="LED does not light up",
        hypotheses=[
            Hypothesis(
                id="H1",
                rank=1,
                title="Wiring fault",
                description="Breadboard wire loose",
                likelihood="HIGH",
                confidence_score=0.9,
                supporting_evidence=["No voltage detected"]
            )
        ],
        recommended_test="Check jumper wire with multimeter",
        expected_observation="Expect continuity < 1 ohm",
        additional_checks=["Inspect power rail"],
        safety_warning="Disconnect USB before rewiring"
    )
    assert len(report.hypotheses) == 1
    assert report.recommended_test.startswith("Check jumper")

def test_observation_create_validation():
    obs = ObservationCreate(user_observation="Pin reads 0V with multimeter")
    assert obs.user_observation == "Pin reads 0V with multimeter"

    with pytest.raises(ValidationError):
        ObservationCreate(user_observation="")  # min_length=2

def test_repair_create_validation():
    repair = RepairCreate(
        repair_description="Changed pinMode pin 12 to 13",
        expected_behavior="LED blinks at 1Hz",
        observed_behavior="LED now blinking normally",
        verification_status="VERIFIED_RESOLVED"
    )
    assert repair.verification_status == "VERIFIED_RESOLVED"
