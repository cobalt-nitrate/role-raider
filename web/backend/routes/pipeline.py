import sys
import subprocess
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from fastapi import APIRouter, HTTPException
from models import PipelineRunRequest
from services.task_manager import task_manager

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

PROJECT_ROOT = Path(__file__).parent.parent.parent


@router.post("/run")
def run_pipeline(req: PipelineRunRequest):
    if task_manager.active_pipeline():
        raise HTTPException(status_code=409, detail="A pipeline is already running")

    cmd = [
        sys.executable, "-m", "role_raider.cli", "run",
        *req.stages,
        "--min-score", str(req.min_score),
        "--workers", str(req.workers),
        "--validation", req.validation,
    ]
    if req.stream:
        cmd.append("--stream")
    if req.dry_run:
        cmd.append("--dry-run")

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
    task_manager.register(task_id, proc, kind="pipeline")
    return {"task_id": task_id}


@router.get("/status")
def pipeline_status():
    tid = task_manager.active_pipeline()
    if tid:
        info = task_manager.task_info(tid)
        return {"running": True, **info}
    return {"running": False, "task_id": None}


@router.post("/stop")
def stop_pipeline():
    tid = task_manager.active_pipeline()
    if not tid:
        raise HTTPException(status_code=404, detail="No running pipeline")
    task_manager.stop(tid)
    return {"ok": True}
