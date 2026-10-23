import json
import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.app.models import (
    DiagnosticSession,
    DiagnosisSnapshot,
    TestObservation,
    RepairAttempt
)
from backend.app.schemas import (
    DiagnosisReport,
    ReevaluationReport,
    Hypothesis,
    DiagnosisSnapshotResponse,
    TestObservationResponse,
    RepairAttemptResponse,
    SessionDetailResponse,
    SessionSummaryResponse,
    ObservationCreate,
    RepairCreate,
    VerificationUpdate
)
from backend.app.services.gemini_service import gemini_service

logger = logging.getLogger("faultforge.session")


def format_snapshot_response(snapshot: DiagnosisSnapshot) -> DiagnosisSnapshotResponse:
    hypotheses_data = json.loads(snapshot.hypotheses_json)
    hypotheses = [Hypothesis.model_validate(h) for h in hypotheses_data]
    additional_checks = json.loads(snapshot.additional_checks_json) if snapshot.additional_checks_json else []

    return DiagnosisSnapshotResponse(
        id=snapshot.id,
        session_id=snapshot.session_id,
        iteration_number=snapshot.iteration_number,
        summary=snapshot.summary,
        hypotheses=hypotheses,
        recommended_test=snapshot.recommended_test,
        expected_observation=snapshot.expected_observation,
        additional_checks=additional_checks,
        safety_warning=snapshot.safety_warning,
        follow_up_question=snapshot.follow_up_question,
        delta_explanation=snapshot.delta_explanation,
        is_demo_fallback=snapshot.is_demo_fallback,
        created_at=snapshot.created_at
    )


def format_session_detail(session: DiagnosticSession) -> SessionDetailResponse:
    snapshots = [format_snapshot_response(s) for s in session.snapshots]
    observations = [
        TestObservationResponse(
            id=o.id,
            session_id=o.session_id,
            diagnosis_snapshot_id=o.diagnosis_snapshot_id,
            hypothesis_id=o.hypothesis_id,
            recommended_test=o.recommended_test,
            user_observation=o.user_observation,
            interpretation=o.interpretation,
            created_at=o.created_at
        ) for o in session.observations
    ]
    repairs = [
        RepairAttemptResponse(
            id=r.id,
            session_id=r.session_id,
            repair_description=r.repair_description,
            expected_behavior=r.expected_behavior,
            observed_behavior=r.observed_behavior,
            verification_status=r.verification_status,
            notes=r.notes,
            created_at=r.created_at
        ) for r in session.repairs
    ]

    latest_snapshot = snapshots[-1] if snapshots else None

    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        symptoms=session.symptoms,
        expected_behavior=session.expected_behavior,
        actual_behavior=session.actual_behavior,
        source_code=session.source_code,
        image_filename=session.image_filename,
        status=session.status,
        created_at=session.created_at,
        updated_at=session.updated_at,
        snapshots=snapshots,
        observations=observations,
        repairs=repairs,
        latest_snapshot=latest_snapshot
    )


class SessionService:

    async def create_session(
        self,
        db: Session,
        symptoms: str,
        expected_behavior: Optional[str] = None,
        actual_behavior: Optional[str] = None,
        source_code: Optional[str] = None,
        image_filename: Optional[str] = None,
        image_content_type: Optional[str] = None,
        image_bytes: Optional[bytes] = None
    ) -> SessionDetailResponse:
        # Title from first 50 chars of symptoms
        title = (symptoms.strip().splitlines()[0] if symptoms.strip() else "Untitled Diagnostic Case")[:60]

        session = DiagnosticSession(
            title=title,
            symptoms=symptoms,
            expected_behavior=expected_behavior,
            actual_behavior=actual_behavior,
            source_code=source_code,
            image_filename=image_filename,
            image_content_type=image_content_type,
            image_size_bytes=len(image_bytes) if image_bytes else 0,
            status="ANALYZING"
        )
        db.add(session)
        db.flush()

        # Call Gemini Service
        report, is_demo_fallback = await gemini_service.diagnose_fault(
            symptoms=symptoms,
            expected_behavior=expected_behavior,
            actual_behavior=actual_behavior,
            source_code=source_code,
            image_bytes=image_bytes,
            image_mime_type=image_content_type
        )

        # Store initial snapshot (Iteration 1)
        hypotheses_dicts = [h.model_dump() for h in report.hypotheses]
        snapshot = DiagnosisSnapshot(
            session_id=session.id,
            iteration_number=1,
            summary=report.problem_summary,
            hypotheses_json=json.dumps(hypotheses_dicts),
            recommended_test=report.recommended_test,
            expected_observation=report.expected_observation,
            additional_checks_json=json.dumps(report.additional_checks),
            safety_warning=report.safety_warning,
            follow_up_question=report.follow_up_question,
            delta_explanation="Initial diagnostic baseline generated from supplied evidence.",
            is_demo_fallback=is_demo_fallback
        )
        db.add(snapshot)
        session.status = "DIAGNOSED"
        db.commit()
        db.refresh(session)

        return format_session_detail(session)

    def get_session(self, db: Session, session_id: str) -> SessionDetailResponse:
        session = db.query(DiagnosticSession).filter(DiagnosticSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail=f"Diagnostic session '{session_id}' not found.")
        return format_session_detail(session)

    def list_sessions(self, db: Session, limit: int = 50) -> List[SessionSummaryResponse]:
        sessions = db.query(DiagnosticSession).order_by(DiagnosticSession.created_at.desc()).limit(limit).all()
        summaries = []
        for s in sessions:
            latest_repair = s.repairs[-1] if s.repairs else None
            summaries.append(
                SessionSummaryResponse(
                    id=s.id,
                    title=s.title,
                    symptoms=s.symptoms,
                    status=s.status,
                    iteration_count=len(s.snapshots),
                    has_image=bool(s.image_filename),
                    verification_status=latest_repair.verification_status if latest_repair else None,
                    created_at=s.created_at,
                    updated_at=s.updated_at
                )
            )
        return summaries

    async def submit_observation(
        self,
        db: Session,
        session_id: str,
        data: ObservationCreate
    ) -> SessionDetailResponse:
        session = db.query(DiagnosticSession).filter(DiagnosticSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")

        if not session.snapshots:
            raise HTTPException(status_code=400, detail="Cannot reevaluate a session with no diagnostic snapshot.")

        latest_snapshot = session.snapshots[-1]
        recommended_test = data.recommended_test or latest_snapshot.recommended_test

        # Record TestObservation
        observation = TestObservation(
            session_id=session.id,
            diagnosis_snapshot_id=latest_snapshot.id,
            hypothesis_id=data.hypothesis_id,
            recommended_test=recommended_test,
            user_observation=data.user_observation
        )
        db.add(observation)
        db.flush()

        # Reevaluate using Gemini
        reeval_report, is_demo_fallback = await gemini_service.reevaluate_hypotheses(
            symptoms=session.symptoms,
            previous_hypotheses_json=latest_snapshot.hypotheses_json,
            recommended_test=recommended_test,
            user_observation=data.user_observation,
            expected_behavior=session.expected_behavior,
            actual_behavior=session.actual_behavior,
            source_code=session.source_code
        )

        # Create new DiagnosisSnapshot (Iteration N + 1)
        next_iteration = latest_snapshot.iteration_number + 1
        hypotheses_dicts = [h.model_dump() for h in reeval_report.hypotheses]

        new_snapshot = DiagnosisSnapshot(
            session_id=session.id,
            iteration_number=next_iteration,
            summary=f"Iteration {next_iteration} — Reevaluated diagnosis based on user test observation.",
            hypotheses_json=json.dumps(hypotheses_dicts),
            recommended_test=reeval_report.recommended_test,
            expected_observation=reeval_report.expected_observation,
            additional_checks_json=json.dumps(reeval_report.additional_checks),
            safety_warning=reeval_report.safety_warning,
            follow_up_question=reeval_report.follow_up_question,
            delta_explanation=reeval_report.delta_explanation,
            is_demo_fallback=is_demo_fallback
        )
        db.add(new_snapshot)
        session.status = "REEVALUATED"
        db.commit()
        db.refresh(session)

        return format_session_detail(session)

    def record_repair(
        self,
        db: Session,
        session_id: str,
        data: RepairCreate
    ) -> SessionDetailResponse:
        session = db.query(DiagnosticSession).filter(DiagnosticSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")

        repair = RepairAttempt(
            session_id=session.id,
            repair_description=data.repair_description,
            expected_behavior=data.expected_behavior or session.expected_behavior,
            observed_behavior=data.observed_behavior,
            verification_status=data.verification_status,
            notes=data.notes
        )
        db.add(repair)

        # Update session status
        if data.verification_status == "VERIFIED_RESOLVED":
            session.status = "RESOLVED"
        elif data.verification_status == "UNRESOLVED":
            session.status = "UNRESOLVED"
        else:
            session.status = "INCONCLUSIVE"

        db.commit()
        db.refresh(session)
        return format_session_detail(session)

    def update_verification(
        self,
        db: Session,
        session_id: str,
        data: VerificationUpdate
    ) -> SessionDetailResponse:
        session = db.query(DiagnosticSession).filter(DiagnosticSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")

        if data.verification_status == "VERIFIED_RESOLVED":
            session.status = "RESOLVED"
        elif data.verification_status == "UNRESOLVED":
            session.status = "UNRESOLVED"
        else:
            session.status = "INCONCLUSIVE"

        db.commit()
        db.refresh(session)
        return format_session_detail(session)

session_service = SessionService()
