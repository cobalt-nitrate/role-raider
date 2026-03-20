"""In-memory registry for long-running subprocess tasks."""

import subprocess
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Optional

from .log_capture import strip_ansi

MAX_LINES = 5000
EVICT_AFTER = 600  # seconds


@dataclass
class TaskEntry:
    task_id: str
    proc: subprocess.Popen
    lines: list[str] = field(default_factory=list)
    status: str = "running"   # running | completed | failed | stopped
    started_at: float = field(default_factory=time.time)
    _lock: threading.Lock = field(default_factory=threading.Lock)


class TaskManager:
    def __init__(self):
        self._tasks: dict[str, TaskEntry] = {}
        self._lock = threading.Lock()
        # One slot per task type to enforce "only one at a time"
        self._pipeline_task: Optional[str] = None
        self._apply_task: Optional[str] = None
        threading.Thread(target=self._evict_loop, daemon=True).start()

    def register(self, task_id: str, proc: subprocess.Popen, kind: str = "pipeline") -> None:
        entry = TaskEntry(task_id=task_id, proc=proc)
        with self._lock:
            self._tasks[task_id] = entry
            if kind == "pipeline":
                self._pipeline_task = task_id
            elif kind == "apply":
                self._apply_task = task_id

        t = threading.Thread(target=self._reader, args=(entry,), daemon=True)
        t.start()

    def _reader(self, entry: TaskEntry) -> None:
        for raw in entry.proc.stdout:
            line = strip_ansi(raw.rstrip("\n"))
            if line:
                with entry._lock:
                    entry.lines.append(line)
                    if len(entry.lines) > MAX_LINES:
                        entry.lines = entry.lines[-MAX_LINES:]
        entry.proc.wait()
        with entry._lock:
            entry.status = "completed" if entry.proc.returncode == 0 else "failed"
            entry.lines.append("__DONE__" if entry.status == "completed" else "__ERROR__")

    def get_lines(self, task_id: str, since: int = 0) -> tuple[list[str], str]:
        with self._lock:
            entry = self._tasks.get(task_id)
        if not entry:
            return [], "not_found"
        with entry._lock:
            return entry.lines[since:], entry.status

    def get_status(self, task_id: str) -> Optional[str]:
        with self._lock:
            entry = self._tasks.get(task_id)
        return entry.status if entry else None

    def stop(self, task_id: str) -> bool:
        with self._lock:
            entry = self._tasks.get(task_id)
        if entry and entry.status == "running":
            entry.proc.terminate()
            with entry._lock:
                entry.status = "stopped"
                entry.lines.append("__DONE__")
            return True
        return False

    def active_pipeline(self) -> Optional[str]:
        with self._lock:
            tid = self._pipeline_task
        if tid and self.get_status(tid) == "running":
            return tid
        return None

    def active_apply(self) -> Optional[str]:
        with self._lock:
            tid = self._apply_task
        if tid and self.get_status(tid) == "running":
            return tid
        return None

    def task_info(self, task_id: str) -> Optional[dict]:
        with self._lock:
            entry = self._tasks.get(task_id)
        if not entry:
            return None
        with entry._lock:
            return {
                "task_id": task_id,
                "status": entry.status,
                "started_at": entry.started_at,
                "line_count": len(entry.lines),
            }

    def _evict_loop(self):
        while True:
            time.sleep(60)
            now = time.time()
            with self._lock:
                to_del = [
                    tid for tid, e in self._tasks.items()
                    if e.status != "running" and now - e.started_at > EVICT_AFTER
                ]
                for tid in to_del:
                    del self._tasks[tid]


task_manager = TaskManager()
