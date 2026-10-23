import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class DiagnosticSession(Base):
    __tablename__ = "diagnostic_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    symptoms = Column(Text, nullable=False)
    expected_behavior = Column(Text, nullable=True)
    actual_behavior = Column(Text, nullable=True)
    source_code = Column(Text, nullable=True)
    image_filename = Column(String(255), nullable=True)
    image_content_type = Column(String(100), nullable=True)
    image_size_bytes = Column(Integer, nullable=True)
    status = Column(String(50), default="DIAGNOSED", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    snapshots = relationship("DiagnosisSnapshot", back_populates="session", cascade="all, delete-orphan", order_by="DiagnosisSnapshot.iteration_number")
    observations = relationship("TestObservation", back_populates="session", cascade="all, delete-orphan", order_by="TestObservation.created_at")
    repairs = relationship("RepairAttempt", back_populates="session", cascade="all, delete-orphan", order_by="RepairAttempt.created_at")


class DiagnosisSnapshot(Base):
    __tablename__ = "diagnosis_snapshots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("diagnostic_sessions.id", ondelete="CASCADE"), nullable=False)
    iteration_number = Column(Integer, default=1, nullable=False)
    summary = Column(Text, nullable=False)
    hypotheses_json = Column(Text, nullable=False)  # JSON-encoded array of hypotheses
    recommended_test = Column(Text, nullable=False)
    expected_observation = Column(Text, nullable=False)
    additional_checks_json = Column(Text, nullable=True)  # JSON-encoded list of strings
    safety_warning = Column(Text, nullable=True)
    follow_up_question = Column(Text, nullable=True)
    delta_explanation = Column(Text, nullable=True)  # Explanation of what changed since last iteration
    is_demo_fallback = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    session = relationship("DiagnosticSession", back_populates="snapshots")


class TestObservation(Base):
    __tablename__ = "test_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("diagnostic_sessions.id", ondelete="CASCADE"), nullable=False)
    diagnosis_snapshot_id = Column(String(36), ForeignKey("diagnosis_snapshots.id", ondelete="SET NULL"), nullable=True)
    hypothesis_id = Column(String(50), nullable=True)
    recommended_test = Column(Text, nullable=False)
    user_observation = Column(Text, nullable=False)
    interpretation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    session = relationship("DiagnosticSession", back_populates="observations")


class RepairAttempt(Base):
    __tablename__ = "repair_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("diagnostic_sessions.id", ondelete="CASCADE"), nullable=False)
    repair_description = Column(Text, nullable=False)
    expected_behavior = Column(Text, nullable=True)
    observed_behavior = Column(Text, nullable=False)
    verification_status = Column(String(50), nullable=False)  # VERIFIED_RESOLVED, UNRESOLVED, INCONCLUSIVE
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    session = relationship("DiagnosticSession", back_populates="repairs")
