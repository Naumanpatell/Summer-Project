from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    # TODO: validate format, save file, kick off background pipeline
    allowed = ["video/mp4", "video/quicktime", "video/x-msvideo"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    return {"scan_id": "placeholder-scan-id", "status": "queued", "filename": file.filename}
