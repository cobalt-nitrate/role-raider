import base64
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from fastapi import APIRouter, HTTPException, Query
from models import JobPatch
from services.db_service import list_jobs, get_job, patch_job, reset_all_failed

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _decode(url_b64: str) -> str:
    try:
        return base64.urlsafe_b64decode(url_b64.encode()).decode()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL encoding")


@router.get("")
def jobs(
    stage: str = Query("discovered"),
    min_score: int = Query(0),
    limit: int = Query(200),
    search: str = Query(""),
):
    return list_jobs(stage=stage, min_score=min_score, limit=limit, search=search)


@router.get("/{url_b64}")
def job_detail(url_b64: str):
    url = _decode(url_b64)
    job = get_job(url)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/{url_b64}")
def patch(url_b64: str, body: JobPatch):
    url = _decode(url_b64)
    patch_job(url, body.apply_status, body.apply_error)
    return {"ok": True}


@router.post("/reset-failed")
def reset_failed():
    count = reset_all_failed()
    return {"count": count}
