from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.schemas import HealthResponse
from backend.app.services.gemini_service import gemini_service

router = APIRouter(tags=["Health"])

@router.get("/", response_model=HealthResponse)
@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint reporting backend service, database, and Gemini integration state."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        gemini_configured=gemini_service.is_configured,
        gemini_model=settings.GEMINI_MODEL,
        database_status=db_status
    )
