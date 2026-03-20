from typing import Optional
from pydantic import BaseModel


class PipelineRunRequest(BaseModel):
    stages: list[str] = ["all"]
    min_score: int = 7
    workers: int = 1
    stream: bool = False
    dry_run: bool = False
    validation: str = "normal"


class ApplyRequest(BaseModel):
    limit: int = 1
    workers: int = 1
    min_score: int = 7
    model: str = "haiku"
    headless: bool = False
    dry_run: bool = False
    continuous: bool = False
    target_url: Optional[str] = None


class JobPatch(BaseModel):
    apply_status: str   # applied | failed | reset
    apply_error: Optional[str] = None


class EnvUpdate(BaseModel):
    key: str
    value: str


class SearchesUpdate(BaseModel):
    content: str


class ResumeUpload(BaseModel):
    content: str
