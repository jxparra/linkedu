from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://studyhub:studyhub@localhost:5432/studyhub"
    secret_key: str = "dev-secret-solo-para-desarrollo-cambiar-en-produccion"
    access_token_minutes: int = 60 * 24
    frontend_url: str = "http://localhost:3000"
    debug: bool = True
    upload_dir: str = "uploads"
    max_upload_mb: int = 25

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir).resolve()


settings = Settings()
