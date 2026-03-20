"""Thin wrappers around role_raider.database for use by FastAPI routes."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from role_raider.database import get_connection, get_stats as _get_stats, get_jobs_by_stage


def get_stats() -> dict:
    conn = get_connection()
    return _get_stats(conn)


def list_jobs(stage: str = "discovered", min_score: int = 0,
              limit: int = 200, search: str = "") -> list[dict]:
    conn = get_connection()
    jobs = get_jobs_by_stage(conn, stage=stage, min_score=min_score or None, limit=limit)
    if search:
        q = search.lower()
        jobs = [j for j in jobs if q in (j.get("title") or "").lower()
                or q in (j.get("location") or "").lower()
                or q in (j.get("site") or "").lower()]
    return jobs


def get_job(url: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM jobs WHERE url = ?", (url,)).fetchone()
    if not row:
        return None
    return dict(zip(row.keys(), row))


def patch_job(url: str, apply_status: str, apply_error: str | None = None) -> bool:
    conn = get_connection()
    if apply_status == "applied":
        from datetime import datetime, timezone
        conn.execute(
            "UPDATE jobs SET apply_status=?, applied_at=?, apply_error=NULL WHERE url=?",
            ("applied", datetime.now(timezone.utc).isoformat(), url),
        )
    elif apply_status == "failed":
        conn.execute(
            "UPDATE jobs SET apply_status=?, apply_error=? WHERE url=?",
            ("failed", apply_error, url),
        )
    elif apply_status == "reset":
        conn.execute(
            "UPDATE jobs SET apply_status=NULL, apply_error=NULL, applied_at=NULL, "
            "apply_attempts=0 WHERE url=?",
            (url,),
        )
    conn.commit()
    return True


def reset_all_failed() -> int:
    conn = get_connection()
    cur = conn.execute(
        "UPDATE jobs SET apply_status=NULL, apply_error=NULL, apply_attempts=0 "
        "WHERE apply_status='failed'"
    )
    conn.commit()
    return cur.rowcount
