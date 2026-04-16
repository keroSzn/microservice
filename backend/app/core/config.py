from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Torku Ürün & Reklam API"
    environment: str = "dev"

    cors_origins: str = "http://localhost:5173"

    database_url: str = "sqlite:///./dev.db"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 gün

    admin_email: str = "admin@example.com"
    admin_password: str = "admin12345"

    media_dir: str = "./media"
    max_upload_mb: int = 250
    allowed_video_mime_types: str = "video/mp4,video/webm"
    allowed_image_mime_types: str = "image/jpeg,image/png,image/webp,image/gif"
    max_image_upload_mb: int = 10


settings = Settings()

