from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload, reports, neighbourhood
from app.models.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Proptyze API",
    description="Property analysis platform — video in, structured report out.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(neighbourhood.router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "proptyze-api", "version": "0.1.0"}
