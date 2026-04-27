import os
import uuid
import shutil

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.models.database import Scan, get_db
from app.services.video_processor import process_video

router = APIRouter(tags=["upload"])

ALLOWED_CONTENT_TYPES = {
    "video/mp4",
    "video/quicktime",   
    "video/x-msvideo",  
}

ALLOWED_EXTENSIONS = {"mp4", "mov", "avi"}

MAX_BYTES = settings.max_upload_size_mb * 1024 * 1024


@router.post("/upload", status_code=202)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f("Unsupported file type '{file.content_type}'. Accepted: MP4, MOV, AVI."),
        )

    # Validate extension as a second check (content_type can be spoofed client-side)
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f("Unsupported file extension '.{ext}'. Accepted: .mp4, .mov, .avi."),
        )

    # Read file into memory to check size before writing to disk
    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {settings.max_upload_size_mb}MB size limit.",
        )

    # Persist to upload directory
    os.makedirs(settings.upload_dir, exist_ok=True)
    scan_id = str(uuid.uuid4())
    dest_filename = f"{scan_id}.{ext}"
    dest_path = os.path.join(settings.upload_dir, dest_filename)

    with open(dest_path, "wb") as f:
        f.write(contents)

    # Create scan record in the database
    scan = Scan(
        id=scan_id,
        filename=file.filename,
        status="queued",
        progress=0,
        stage="waiting",
    )
    db.add(scan)
    db.commit()

    # Kick off the processing pipeline as a background task
    background_tasks.add_task(process_video, scan_id, dest_path)

    return {
        "scan_id": scan_id,
        "status": "queued",
        "filename": file.filename,
    }
