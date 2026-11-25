from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://studyhub:studyhub@localhost:5432/studyhub"
    secret_key: str = "dev-secret-solo-para-desarrollo-cambiar-en-produccion"
    access_token_minutes: int = 60 * 24
    frontend_url: str = "http://localhost:3000"
    # Otros orígenes permitidos por expresión regular (p. ej. las vistas previas de Vercel: https://.*\.vercel\.app)
    frontend_origin_regex: str | None = None
    # Copia de la base de datos de demostración (y sus imágenes) que se restaura si la base de datos no existe.
    # En el servidor gratuito el disco se borra en cada reinicio: así siempre arranca con los datos de prueba.
    demo_snapshot: str | None = None
    debug: bool = True
    upload_dir: str = "uploads"
    max_upload_mb: int = 25

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir).resolve()


settings = Settings()
