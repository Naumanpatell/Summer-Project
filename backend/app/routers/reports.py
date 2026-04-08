from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["reports"])


@router.get("/reports")
async def list_reports():
    # TODO: query database for authenticated user's reports
    return {"reports": [], "total": 0}


@router.get("/reports/{report_id}")
async def get_report(report_id: str):
    # TODO: fetch from database
    raise HTTPException(status_code=404, detail="Report not found")


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    # TODO: delete from database and remove stored files
    raise HTTPException(status_code=404, detail="Report not found")


@router.get("/reports/{report_id}/pdf")
async def download_report_pdf(report_id: str):
    # TODO: generate and stream PDF
    raise HTTPException(status_code=404, detail="Report not found")


@router.get("/scans/{scan_id}/status")
async def scan_status(scan_id: str):
    # TODO: query processing status from database
    return {"scan_id": scan_id, "status": "queued", "progress": 0, "stage": "waiting"}
