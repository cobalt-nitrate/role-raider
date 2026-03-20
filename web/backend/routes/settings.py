import copy
import json
import os
import sys
import shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import yaml
from fastapi import APIRouter, HTTPException, UploadFile, File
from models import EnvUpdate, SearchesUpdate

router = APIRouter(prefix="/settings", tags=["settings"])

from role_raider.config import (
    PROFILE_PATH, SEARCH_CONFIG_PATH, ENV_PATH, RESUME_PATH, get_tier, TIER_LABELS,
    get_chrome_path, load_env
)

ALLOWED_ENV_KEYS = {
    "GEMINI_API_KEY", "OPENAI_API_KEY", "LLM_URL", "LLM_MODEL",
    "CHROME_PATH", "CAPSOLVER_API_KEY",
}


def _mask_profile(p: dict) -> dict:
    p = copy.deepcopy(p)
    if "personal" in p:
        p["personal"]["password"] = ""
    return p


@router.get("/profile")
def get_profile():
    if not PROFILE_PATH.exists():
        return {}
    data = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
    return _mask_profile(data)


@router.put("/profile")
def put_profile(body: dict):
    existing = {}
    if PROFILE_PATH.exists():
        existing = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))

    # Merge deeply
    for section, values in body.items():
        if isinstance(values, dict) and section in existing and isinstance(existing[section], dict):
            existing[section].update({k: v for k, v in values.items() if v != ""})
        else:
            existing[section] = values

    # Never overwrite password with empty
    incoming_pw = body.get("personal", {}).get("password", "")
    if not incoming_pw and "personal" in existing:
        pass  # keep existing password

    PROFILE_PATH.write_text(json.dumps(existing, indent=2), encoding="utf-8")
    return {"ok": True}


@router.get("/searches")
def get_searches():
    if not SEARCH_CONFIG_PATH.exists():
        return {"content": ""}
    return {"content": SEARCH_CONFIG_PATH.read_text(encoding="utf-8")}


@router.put("/searches")
def put_searches(body: SearchesUpdate):
    try:
        yaml.safe_load(body.content)
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {e}")
    tmp = SEARCH_CONFIG_PATH.with_suffix(".tmp")
    tmp.write_text(body.content, encoding="utf-8")
    os.replace(tmp, SEARCH_CONFIG_PATH)
    return {"ok": True}


@router.get("/env")
def get_env():
    load_env()
    result = {}
    for key in ALLOWED_ENV_KEYS:
        val = os.environ.get(key, "")
        result[key] = "set" if val else ""
    return result


@router.put("/env")
def put_env(body: EnvUpdate):
    if body.key not in ALLOWED_ENV_KEYS:
        raise HTTPException(status_code=400, detail=f"Key '{body.key}' not allowed")
    # Read existing .env
    lines = []
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines()

    updated = False
    new_lines = []
    for line in lines:
        if line.startswith(f"{body.key}=") or line.startswith(f"# {body.key}="):
            if body.value:
                new_lines.append(f"{body.key}={body.value}")
            updated = True
        else:
            new_lines.append(line)

    if not updated and body.value:
        new_lines.append(f"{body.key}={body.value}")

    ENV_PATH.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    load_env()
    return {"ok": True}


@router.get("/resume")
def get_resume():
    if not RESUME_PATH.exists():
        return {"exists": False, "size_bytes": 0, "preview": ""}
    text = RESUME_PATH.read_text(encoding="utf-8")
    return {"exists": True, "size_bytes": len(text.encode()), "preview": text[:500]}


@router.put("/resume")
async def put_resume(file: UploadFile = File(...)):
    content = await file.read()
    RESUME_PATH.write_bytes(content)
    return {"ok": True}


@router.get("/doctor")
def doctor():
    load_env()
    results = []

    results.append({"check": "profile.json", "status": "ok" if PROFILE_PATH.exists() else "missing",
                    "note": str(PROFILE_PATH) if PROFILE_PATH.exists() else "Run init wizard"})

    from role_raider.config import RESUME_PATH as RP
    results.append({"check": "resume.txt", "status": "ok" if RP.exists() else "missing",
                    "note": str(RP) if RP.exists() else "Upload your resume"})

    results.append({"check": "searches.yaml", "status": "ok" if SEARCH_CONFIG_PATH.exists() else "warn",
                    "note": str(SEARCH_CONFIG_PATH) if SEARCH_CONFIG_PATH.exists() else "Using example config"})

    try:
        import jobspy  # noqa
        results.append({"check": "python-jobspy", "status": "ok", "note": "Job board scraping available"})
    except ImportError:
        results.append({"check": "python-jobspy", "status": "warn", "note": "pip install python-jobspy"})

    has_gemini = bool(os.environ.get("GEMINI_API_KEY"))
    has_openai = bool(os.environ.get("OPENAI_API_KEY"))
    has_local = bool(os.environ.get("LLM_URL"))
    if has_gemini:
        results.append({"check": "LLM API key", "status": "ok", "note": f"Gemini ({os.environ.get('LLM_MODEL','gemini-2.0-flash')})"})
    elif has_openai:
        results.append({"check": "LLM API key", "status": "ok", "note": f"OpenAI ({os.environ.get('LLM_MODEL','gpt-4o-mini')})"})
    elif has_local:
        results.append({"check": "LLM API key", "status": "ok", "note": f"Local: {os.environ.get('LLM_URL')}"})
    else:
        results.append({"check": "LLM API key", "status": "missing", "note": "Set GEMINI_API_KEY in .env"})

    claude_bin = shutil.which("claude")
    results.append({"check": "Claude Code CLI", "status": "ok" if claude_bin else "missing",
                    "note": claude_bin or "Install from claude.ai/code"})

    try:
        chrome = get_chrome_path()
        results.append({"check": "Chrome", "status": "ok", "note": chrome})
    except FileNotFoundError:
        results.append({"check": "Chrome", "status": "missing", "note": "Install Chrome"})

    npx = shutil.which("npx")
    results.append({"check": "Node.js (npx)", "status": "ok" if npx else "missing",
                    "note": npx or "Install Node.js 18+"})

    cap = os.environ.get("CAPSOLVER_API_KEY")
    results.append({"check": "CapSolver", "status": "ok" if cap else "optional",
                    "note": "CAPTCHA solving enabled" if cap else "Optional — needed for CAPTCHA sites"})

    tier = get_tier()
    return {"checks": results, "tier": tier, "tier_label": TIER_LABELS[tier]}
