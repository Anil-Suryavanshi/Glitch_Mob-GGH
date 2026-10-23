from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- Enums / Literal Helpers ---
class LikelihoodLevel:
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class HypothesisStatus:
    NEW = "NEW"
    SUPPORTED = "SUPPORTED"
    WEAKENED = "WEAKENED"
    UNRESOLVED = "UNRESOLVED"
    ELIMINATED = "ELIMINATED"

class VerificationStatus:
    VERIFIED_RESOLVED = "VERIFIED_RESOLVED"
    UNRESOLVED = "UNRESOLVED"
    INCONCLUSIVE = "INCONCLUSIVE"


# --- Core AI Schemas ---
class Hypothesis(BaseModel):
    id: str = Field(..., description="Unique hypothesis identifier, e.g. H1, H2")
    rank: int = Field(..., description="Rank ordered by likelihood starting at 1")
    title: str = Field(..., description="Concise title of the fault hypothesis")
    description: str = Field(..., description="Technical explanation of the potential fault")
    likelihood: str = Field("MEDIUM", description="Estimated likelihood: HIGH, MEDIUM, LOW")
    confidence_score: float = Field(0.5, ge=0.0, le=1.0, description="Estimated confidence score between 0.0 and 1.0")
    supporting_evidence: List[str] = Field(default_factory=list, description="List of evidence points citing code, image, or symptoms")
    status: Optional[str] = Field(None, description="Current evaluation status: NEW, SUPPORTED, WEAKENED, UNRESOLVED, ELIMINATED")
    status_reason: Optional[str] = Field(None, description="Explanation of why status changed based on new observation")


class DiagnosisReport(BaseModel):
    problem_summary: str = Field(..., description="Concise technical summary of the observed fault")
    hypotheses: List[Hypothesis] = Field(..., description="List of ranked fault hypotheses")
    recommended_test: str = Field(..., description="Safe, targeted diagnostic test to perform next")
    expected_observation: str = Field(..., description="What the user should observe if the top hypothesis is correct")
    additional_checks: List[str] = Field(default_factory=list, description="Secondary or environmental checks")
    safety_warning: Optional[str] = Field(None, description="Crucial electrical or physical safety warning")
    follow_up_question: Optional[str] = Field(None, description="Follow-up question if additional details are missing")


class ReevaluationReport(BaseModel):
    delta_explanation: str = Field(..., description="Clear explanation of how hypotheses shifted based on user observation")
    hypotheses: List[Hypothesis] = Field(..., description="Updated ranked hypotheses")
    recommended_test: str = Field(..., description="Next recommended safe test")
    expected_observation: str = Field(..., description="Expected observation for next test")
    additional_checks: List[str] = Field(default_factory=list, description="Additional checks")
    safety_warning: Optional[str] = Field(None, description="Safety notice")
    follow_up_question: Optional[str] = Field(None, description="Remaining questions")


# --- API Request Payloads ---
class ObservationCreate(BaseModel):
    user_observation: str = Field(..., min_length=2, description="Observed result from the recommended test")
    recommended_test: Optional[str] = Field(None, description="The test that was conducted")
    hypothesis_id: Optional[str] = Field(None, description="Target hypothesis ID being tested")


class RepairCreate(BaseModel):
    repair_description: str = Field(..., min_length=2, description="Details of the physical or code fix applied")
    expected_behavior: Optional[str] = Field(None, description="What the system was expected to do after repair")
    observed_behavior: str = Field(..., min_length=2, description="What the system actually did after repair")
    verification_status: str = Field(..., description="Outcome: VERIFIED_RESOLVED, UNRESOLVED, INCONCLUSIVE")
    notes: Optional[str] = Field(None, description="Optional repair or troubleshooting notes")


class VerificationUpdate(BaseModel):
    verification_status: str = Field(..., description="VERIFIED_RESOLVED, UNRESOLVED, INCONCLUSIVE")
    notes: Optional[str] = Field(None, description="Optional notes")


# --- API Response Payloads ---
class DiagnosisSnapshotResponse(BaseModel):
    id: str
    session_id: str
    iteration_number: int
    summary: str
    hypotheses: List[Hypothesis]
    recommended_test: str
    expected_observation: str
    additional_checks: List[str]
    safety_warning: Optional[str]
    follow_up_question: Optional[str]
    delta_explanation: Optional[str]
    is_demo_fallback: bool
    created_at: datetime


class TestObservationResponse(BaseModel):
    id: str
    session_id: str
    diagnosis_snapshot_id: Optional[str]
    hypothesis_id: Optional[str]
    recommended_test: str
    user_observation: str
    interpretation: Optional[str]
    created_at: datetime


class RepairAttemptResponse(BaseModel):
    id: str
    session_id: str
    repair_description: str
    expected_behavior: Optional[str]
    observed_behavior: str
    verification_status: str
    notes: Optional[str]
    created_at: datetime


class SessionDetailResponse(BaseModel):
    id: str
    title: str
    symptoms: str
    expected_behavior: Optional[str]
    actual_behavior: Optional[str]
    source_code: Optional[str]
    image_filename: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    snapshots: List[DiagnosisSnapshotResponse]
    observations: List[TestObservationResponse]
    repairs: List[RepairAttemptResponse]
    latest_snapshot: Optional[DiagnosisSnapshotResponse]


class SessionSummaryResponse(BaseModel):
    id: str
    title: str
    symptoms: str
    status: str
    iteration_count: int
    has_image: bool
    verification_status: Optional[str]
    created_at: datetime
    updated_at: datetime


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    gemini_configured: bool
    gemini_model: str
    database_status: str
