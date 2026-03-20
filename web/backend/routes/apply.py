import sys
import subprocess
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from fastapi import APIRouter, HTTPException
from models import ApplyRequest
from services.task_manager import task_manager
from services.db_service import patch_job, reset_all_failed

router = APIRouter(prefix="/apply", tags=["apply"])

PROJECT_ROOT = Path(__file__).parent.parent.parent


@router.post("/start")
def start_apply(req: ApplyRequest):
    if task_manager.active_apply():
        raise HTTPException(status_code=409, detail="Auto-apply is already running")

    cmd = [
        sys.executable, "-m", "role_raider.cli", "apply",
        "--limit", str(req.limit),
        "--workers", str(req.workers),
        "--min-score", str(req.min_score),
        "--model", req.model,
    ]
    if req.headless:
        cmd.append("--headless")
    if req.dry_run:
        cmd.append("--dry-run")
    if req.continuous:
        cmd.append("--continuous")
    if req.target_url:
        cmd += ["--url", req.target_url]

    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        cwd=PROJECT_ROOT,
        env={**__import__("os").environ},
    )
    task_id = str(uuid.uuid4())
    task_manager.register(task_id, proc, kind="apply")
    return {"task_id": task_id}


@router.get("/status")
def apply_status():
    tid = task_manager.active_apply()
    if tid:
        info = task_manager.task_info(tid)
        return {"running": True, **info}
    return {"running": False, "task_id": None}


@router.post("/stop")
def stop_apply():
    tid = task_manager.active_apply()
    if not tid:
        raise HTTPException(status_code=404, detail="No running apply session")
    task_manager.stop(tid)
    return {"ok": True}


@router.post("/mark-applied")
def mark_applied(body: dict):
    url = body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url required")
    patch_job(url, "applied")
    return {"ok": True}


@router.post("/mark-failed")
def mark_failed(body: dict):
    url = body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url required")
    patch_job(url, "failed", body.get("reason"))
    return {"ok": True}


@router.post("/reset-failed")
def reset_failed():
    count = reset_all_failed()
    return {"count": count}
