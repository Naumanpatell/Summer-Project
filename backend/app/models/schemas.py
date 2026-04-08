from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScanStatus(BaseModel):
    scan_id: str
    status: str  # queued | processing | complete | failed
    progress: int
    stage: str


class ReportSummary(BaseModel):
    id: str
    created_at: datetime
    score: Optional[int] = None
    grade: Optional[str] = None
    status: str


class DetectionResult(BaseModel):
    label: str
    confidence: float
    frame_index: int
    bounding_box: list[float]


class Report(BaseModel):
    id: str
    scan_id: str
    created_at: datetime
    score: int
    grade: str
    ai_summary: Optional[str] = None
    detections: list[DetectionResult] = []
