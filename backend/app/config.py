from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Proptyze API"
    debug: bool = True
    database_url: str = "postgresql://postgres:postgres@db:5432/proptyze"
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 500
    allowed_video_formats: list[str] = ["mp4", "mov", "avi"]

    class Config:
        env_file = ".env"


settings = Settings()
