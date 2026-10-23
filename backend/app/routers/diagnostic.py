import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.schemas import (
    SessionDetailResponse,
    SessionSummaryResponse,
    ObservationCreate,
    RepairCreate,
    VerificationUpdate
)
from backend.app.services.session_service import session_service

logger = logging.getLogger("faultforge.router")

router = APIRouter(prefix="/api", tags=["Diagnostics"])


@router.post(
    "/diagnose",
    response_model=SessionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new diagnostic session with multimodal evidence"
)
async def start_diagnosis(
    symptoms: str = Form(..., description="Observed symptoms or problem description"),
    expected_behavior: Optional[str] = Form(None, description="Expected operational behavior"),
    actual_behavior: Optional[str] = Form(None, description="Actual observed behavior"),
    source_code: Optional[str] = Form(None, description="Microcontroller or script source code"),
    image: Optional[UploadFile] = File(None, description="Circuit or breadboard photograph (max 8MB)"),
    db: Session = Depends(get_db)
):
    """
    Ingests user problem description, code, and optional circuit photo,
    calls Google Gemini for multimodal reasoning, and persists the diagnostic session.
    """
    if not symptoms or not symptoms.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Symptoms / problem description is required."
        )

    image_bytes = None
    image_filename = None
    image_content_type = None

    if image and image.filename:
        # Check MIME type
        content_type = image.content_type or ""
        if content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Allowed: JPG, PNG, WEBP."
            )

        # Read and check size
        image_bytes = await image.read()
        if len(image_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image size exceeds 8 MB limit ({len(image_bytes)} bytes)."
            )

        image_filename = image.filename
        image_content_type = content_type

    try:
        session_detail = await session_service.create_session(
            db=db,
            symptoms=symptoms.strip(),
            expected_behavior=expected_behavior.strip() if expected_behavior else None,
            actual_behavior=actual_behavior.strip() if actual_behavior else None,
            source_code=source_code.strip() if source_code else None,
            image_filename=image_filename,
            image_content_type=image_content_type,
            image_bytes=image_bytes
        )
        return session_detail
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create diagnostic session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diagnostic analysis failed: {str(e)}"
        )


@router.get(
    "/sessions",
    response_model=List[SessionSummaryResponse],
    summary="List all diagnostic sessions"
)
def list_sessions(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve summaries of historical diagnostic sessions."""
    return session_service.list_sessions(db=db, limit=limit)


@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailResponse,
    summary="Get full details and history for a diagnostic session"
)
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Retrieve full timeline of snapshots, observations, and repairs for a session."""
    return session_service.get_session(db=db, session_id=session_id)


@router.post(
    "/sessions/{session_id}/observations",
    response_model=SessionDetailResponse,
    summary="Submit test observation and reevaluate hypotheses"
)
async def submit_observation(
    session_id: str,
    payload: ObservationCreate,
    db: Session = Depends(get_db)
):
    """
    Submits user test results against an active diagnosis,
    invokes Gemini to update hypothesis rankings, and creates a new snapshot iteration.
    """
    try:
        return await session_service.submit_observation(db=db, session_id=session_id, data=payload)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Observation reevaluation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process observation: {str(e)}"
        )


@router.post(
    "/sessions/{session_id}/repairs",
    response_model=SessionDetailResponse,
    summary="Record a repair attempt and its verification outcome"
)
def record_repair(
    session_id: str,
    payload: RepairCreate,
    db: Session = Depends(get_db)
):
    """Records hardware/software repair actions and user-reported verification status."""
    return session_service.record_repair(db=db, session_id=session_id, data=payload)


@router.patch(
    "/sessions/{session_id}/verification",
    response_model=SessionDetailResponse,
    summary="Update repair verification outcome"
)
def update_verification(
    session_id: str,
    payload: VerificationUpdate,
    db: Session = Depends(get_db)
):
    """Directly update session verification status (VERIFIED_RESOLVED, UNRESOLVED, INCONCLUSIVE)."""
    return session_service.update_verification(db=db, session_id=session_id, data=payload)
