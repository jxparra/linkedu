import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import models  # noqa: F401  (registra los modelos)
from app.config import settings
from app.migrate import ensure_schema
from app.routers import auth, catalog, comments, discover, groups, jobs, messages, notifications, onboarding, posts, search, stats, uploads, users

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Para el MVP se crean las tablas (y columnas nuevas) al arrancar. Más adelante: Alembic.
    ensure_schema()
    _seed_jobs_if_empty()
    yield


def _seed_jobs_if_empty():
    """En desarrollo, si todavía no hay ofertas o estadísticas, se cargan las de prueba al arrancar
    (lo mismo que hace `python -m app.seed`), para que Empleo y Estadísticas no salgan vacías."""
    if not settings.debug:
        return
    from sqlalchemy import func, select

    from app.database import SessionLocal
    from app.models import Community, Job, School, StatEvent
    from app.seed import seed_catalog, seed_groups, seed_jobs, seed_stats

    db = SessionLocal()
    try:
        if not db.scalar(select(func.count()).select_from(School)):
            seed_catalog(db)
        if not db.scalar(select(func.count()).select_from(Job)):
            logging.getLogger("studyhub").info("Ofertas de prueba cargadas: %s", seed_jobs(db))
        if not db.scalar(select(func.count()).select_from(Community).where(Community.type == "group")):
            logging.getLogger("studyhub").info("Grupos de prueba cargados: %s", seed_groups(db))
        if not db.scalar(select(func.count()).select_from(StatEvent)):
            logging.getLogger("studyhub").info("Estadísticas de prueba cargadas: %s", seed_stats(db))
    except Exception:  # noqa: BLE001 - si falla, la app arranca igual
        logging.getLogger("studyhub").exception("No se pudieron cargar las ofertas de prueba")
        db.rollback()
    finally:
        db.close()


app = FastAPI(title="Linkedu API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["sistema"])
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(catalog.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(messages.router)
app.include_router(search.router)
app.include_router(uploads.router)
app.include_router(jobs.router)
app.include_router(stats.router)
app.include_router(groups.router)
app.include_router(discover.router)

settings.upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_path), name="uploads")
