"""Role Raider — FastAPI backend."""

import sys
from contextlib import asynccontextmanager
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from role_raider.config import load_env, ensure_dirs
from role_raider.database import init_db
from role_raider import __version__

from routes import stats, jobs, pipeline, apply, settings, stream


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_env()
    ensure_dirs()
    init_db()
    yield


app = FastAPI(title="Role Raider API", version=__version__, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                   "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router)
app.include_router(jobs.router)
app.include_router(pipeline.router)
app.include_router(apply.router)
app.include_router(settings.router)
app.include_router(stream.router)


@app.get("/health")
def health():
    from role_raider.config import get_tier, TIER_LABELS, DB_PATH
    tier = get_tier()
    return {"status": "ok", "version": __version__, "tier": tier,
            "tier_label": TIER_LABELS[tier], "db_path": str(DB_PATH)}
