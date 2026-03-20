import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from fastapi import APIRouter
from services.db_service import get_stats

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
def stats():
    return get_stats()
