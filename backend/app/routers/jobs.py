"""Empleo: búsqueda de ofertas (al estilo InfoJobs), publicar ofertas e inscribirse."""
import math
import re
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.deps import DB, VerifiedUser
from app.models import Company, Degree, Job, JobApplication, User, UserRole
from app.schemas.jobs import (
    ApplicationOut,
    ApplicationStatusIn,
    ApplyIn,
    CompanyRef,
    DegreeRef,
    JobCardOut,
    JobIn,
    JobListOut,
    JobOut,
    MyApplicationOut,
    StatusIn,
)
from app.services.people import authors, notify

router = APIRouter(prefix="/jobs", tags=["empleo"])

PAGE_SIZE = 10
ABROAD = "Extranjero"
STATUS_TEXT = {
    "vista": "ha leído tu candidatura",
    "en_proceso": "ha pasado tu candidatura a «En proceso»",
    "aceptada": "te ha seleccionado para su oferta",
    "rechazada": "ha descartado tu candidatura",
}
FACETS = ("type", "modality", "schedule", "category")
POSTED = (1, 7, 15)  # últimas 24 horas, 7 días, 15 días


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def _utcnow() -> datetime:
    # Sin zona horaria: así se compara bien tanto en SQLite como en PostgreSQL
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _is_open():
    return [Job.status == "abierta", or_(Job.deadline.is_(None), Job.deadline >= date.today())]


def _variants(term: str) -> list[str]:
    """Variantes de búsqueda de un puesto para encontrar las ofertas aunque se escriban distinto:
    "Camarero/a de pisos" → también "Camarero de pisos" y "Camarera de pisos";
    "camarero/camarera" (formato de ESCO) → "camarero" y "camarera"."""
    out = [term]
    masc = re.sub(r"(\w)/as?\b", r"\1", term)  # Camarero/a → Camarero
    fem = re.sub(r"(\w)/a\b", r"\1a", re.sub(r"o/as?\b", "a", term))  # Camarero/a → Camarera, Profesor/a → Profesora
    out += [masc, fem]
    if "/" in masc:  # alternativas completas: "camarero de barra/camarera de barra"
        out += [p.strip() for p in re.split(r"[/,]", masc)]
    return [v for v in dict.fromkeys(out) if len(v.strip()) >= 2]


def _student_degree(user: User) -> int | None:
    return user.student_profile.degree_id if user.student_profile else None


def _summary(text: str | None, limit: int = 150) -> str | None:
    """Resumen corto para la tarjeta: la descripción en una línea, cortada en una palabra completa."""
    if not text:
        return None
    flat = " ".join(text.split())
    if len(flat) <= limit:
        return flat
    cut = flat[:limit].rsplit(" ", 1)[0].rstrip(",.;:")
    return cut + "…"


def _cards(db: Session, user: User, jobs: list[Job]) -> list[JobCardOut]:
    if not jobs:
        return []
    ids = [j.id for j in jobs]
    companies = {c.user_id: c for c in db.scalars(select(Company).where(Company.user_id.in_({j.company_id for j in jobs})))}
    counts = dict(
        db.execute(
            select(JobApplication.job_id, func.count()).where(JobApplication.job_id.in_(ids)).group_by(JobApplication.job_id)
        ).all()
    )
    mine = dict(
        db.execute(
            select(JobApplication.job_id, JobApplication.status).where(
                JobApplication.job_id.in_(ids), JobApplication.student_id == user.id
            )
        ).all()
    )
    degree = _student_degree(user)
    out = []
    for j in jobs:
        c = companies[j.company_id]
        out.append(
            JobCardOut(
                id=j.id,
                title=j.title,
                company=CompanyRef(id=c.user_id, name=c.name, logo_url=c.logo_url, verified=c.verified,
                                   sector=c.sector, location=c.location, website=c.website),
                type=j.type,
                category=j.category,
                schedule=j.schedule,
                modality=j.modality or ("remoto" if j.remote else "presencial"),
                location=j.location,
                province=j.province,
                pay=float(j.pay) if j.pay is not None else None,
                pay_period=j.pay_period,
                deadline=j.deadline,
                status=j.status,
                created_at=j.created_at,
                applicants=counts.get(j.id, 0),
                my_status=mine.get(j.id),
                matches_studies=bool(degree and j.degree_id == degree),
                summary=_summary(j.description),
            )
        )
    return out


def _detail(db: Session, user: User, job: Job) -> JobOut:
    card = _cards(db, user, [job])[0]
    app = db.scalar(select(JobApplication).where(JobApplication.job_id == job.id, JobApplication.student_id == user.id))
    degree = db.get(Degree, job.degree_id) if job.degree_id else None
    return JobOut(
        **card.model_dump(),
        description=job.description,
        requirements=job.requirements,
        vacancies=job.vacancies or 1,
        degree=DegreeRef(id=degree.id, name=degree.name) if degree else None,
        is_mine=job.company_id == user.id,
        my_message=app.message if app else None,
        applied_at=app.created_at if app else None,
    )


def _get_job(db: Session, job_id: int) -> Job:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Esta oferta ya no existe.")
    return job


def _own_job(db: Session, user: User, job_id: int) -> Job:
    job = _get_job(db, job_id)
    if job.company_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo la empresa que publicó la oferta puede hacer esto.")
    return job


def _require_company(user: User):
    if user.role != UserRole.company or not user.company:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo las empresas pueden publicar ofertas.")


def _require_student(user: User):
    if user.role != UserRole.student:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo los estudiantes pueden inscribirse en ofertas.")


# ---------------------------------------------------------------------------
# Búsqueda
# ---------------------------------------------------------------------------
@router.get("", response_model=JobListOut)
def search_jobs(
    user: VerifiedUser,
    db: DB,
    q: str | None = Query(default=None, max_length=100, description="Puesto, empresa o palabra clave"),
    province: str | None = Query(default=None, max_length=60, description="Provincia, 'Extranjero' o vacío para toda España"),
    type: list[str] = Query(default=[]),
    modality: list[str] = Query(default=[]),
    schedule: list[str] = Query(default=[]),
    category: list[str] = Query(default=[]),
    posted: int | None = Query(default=None, description="Publicadas en los últimos N días"),
    for_me: bool = Query(default=False, description="Solo las recomendadas para mis estudios"),
    sort: str = Query(default="relevance", pattern="^(relevance|recent|pay)$"),
    page: int = Query(default=1, ge=1),
):
    # Cada filtro guarda sus condiciones por separado para poder contar las opciones de los demás (facetas)
    conds: dict[str, list] = {"base": _is_open()}
    term = (q or "").strip()
    if term:
        # "camarero/camarera" o "Camarero/a" (puestos de ESCO): vale cualquiera de las variantes
        variants = _variants(term)
        conds["q"] = [
            or_(*[f.ilike(f"%{v}%") for v in variants for f in (Job.title, Job.description, Job.category, Company.name)])
        ]
    if province and province.lower() not in ("toda españa", "todas"):
        if province == ABROAD:
            conds["province"] = [Job.province == ABROAD]
        else:
            # Las ofertas en remoto también sirven a quien busca en su provincia
            conds["province"] = [or_(Job.province == province, Job.modality == "remoto")]
    for field, values in (("type", type), ("modality", modality), ("schedule", schedule), ("category", category)):
        if values:
            conds[field] = [getattr(Job, field).in_(values)]
    if posted:
        conds["posted"] = [Job.created_at >= _utcnow() - timedelta(days=posted)]
    degree = _student_degree(user)
    if for_me:
        conds["for_me"] = [Job.degree_id == degree] if degree else [Job.id.is_(None)]

    def where(skip: str | None = None) -> list:
        return [c for key, cs in conds.items() if key != skip for c in cs]

    base = select(Job).join(Company, Company.user_id == Job.company_id)
    total = db.scalar(select(func.count()).select_from(base.where(*where()).subquery())) or 0

    order = []
    if sort == "pay":
        order = [Job.pay.is_(None), Job.pay.desc()]
    elif sort == "relevance":
        if term:
            order.append(case((or_(*[Job.title.ilike(f"%{v}%") for v in _variants(term)]), 0), else_=1))
        if degree:
            order.append(case((Job.degree_id == degree, 0), else_=1))
    order += [Job.created_at.desc(), Job.id.desc()]

    pages = max(1, math.ceil(total / PAGE_SIZE))
    jobs = db.scalars(base.where(*where()).order_by(*order).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)).all()

    facets: dict[str, dict[str, int]] = {}
    for field in FACETS:
        col = getattr(Job, field)
        rows = db.execute(
            select(col, func.count()).select_from(Job).join(Company, Company.user_id == Job.company_id)
            .where(*where(field), col.is_not(None)).group_by(col)
        ).all()
        facets[field] = {k: n for k, n in rows}
    facets["posted"] = {}
    for days in POSTED:
        n = db.scalar(
            select(func.count()).select_from(Job).join(Company, Company.user_id == Job.company_id)
            .where(*where("posted"), Job.created_at >= _utcnow() - timedelta(days=days))
        )
        facets["posted"][str(days)] = n or 0

    return JobListOut(items=_cards(db, user, list(jobs)), total=total, page=page, pages=pages, facets=facets)


# ---------------------------------------------------------------------------
# Rutas fijas (van antes de /{job_id})
# ---------------------------------------------------------------------------
@router.get("/mine", response_model=list[JobCardOut])
def my_jobs(user: VerifiedUser, db: DB):
    """Ofertas publicadas por la empresa, abiertas y cerradas."""
    _require_company(user)
    jobs = db.scalars(select(Job).where(Job.company_id == user.id).order_by(Job.created_at.desc(), Job.id.desc())).all()
    return _cards(db, user, list(jobs))


@router.get("/applications/mine", response_model=list[MyApplicationOut])
def my_applications(user: VerifiedUser, db: DB):
    """Candidaturas del estudiante."""
    _require_student(user)
    apps = db.scalars(
        select(JobApplication).where(JobApplication.student_id == user.id).order_by(JobApplication.updated_at.desc())
    ).all()
    jobs = {j.id: j for j in db.scalars(select(Job).where(Job.id.in_([a.job_id for a in apps])))} if apps else {}
    cards = {c.id: c for c in _cards(db, user, list(jobs.values()))}
    return [
        MyApplicationOut(id=a.id, job=cards[a.job_id], status=a.status, created_at=a.created_at, updated_at=a.updated_at)
        for a in apps
        if a.job_id in cards
    ]


@router.patch("/applications/{application_id}", response_model=ApplicationOut)
def update_application(application_id: int, body: ApplicationStatusIn, user: VerifiedUser, db: DB):
    """La empresa cambia el estado de una candidatura y se avisa al estudiante."""
    app = db.get(JobApplication, application_id)
    if not app:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Esta candidatura ya no existe.")
    job = _own_job(db, user, app.job_id)
    if app.status != body.status:
        app.status = body.status
        if body.status in STATUS_TEXT:
            notify(db, app.student_id, "application_status", actor_id=user.id, job_id=job.id,
                   text=STATUS_TEXT[body.status])
        db.commit()
    return ApplicationOut(id=app.id, student=authors(db, {app.student_id})[app.student_id], message=app.message,
                          status=app.status, created_at=app.created_at)


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(body: JobIn, user: VerifiedUser, db: DB):
    _require_company(user)
    if body.degree_id and not db.get(Degree, body.degree_id):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Esos estudios no existen.")
    job = Job(company_id=user.id, remote=body.modality == "remoto", status="abierta", **body.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return _detail(db, user, job)


# ---------------------------------------------------------------------------
# Una oferta
# ---------------------------------------------------------------------------
@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, user: VerifiedUser, db: DB):
    job = _get_job(db, job_id)
    if job.status != "abierta" and job.company_id != user.id:
        # Una oferta cerrada solo la ve quien la publicó o quien estaba inscrito
        inscrito = db.scalar(select(JobApplication.id).where(JobApplication.job_id == job.id, JobApplication.student_id == user.id))
        if not inscrito:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Esta oferta ya no está disponible.")
    return _detail(db, user, job)


@router.put("/{job_id}", response_model=JobOut)
def edit_job(job_id: int, body: JobIn, user: VerifiedUser, db: DB):
    job = _own_job(db, user, job_id)
    for k, v in body.model_dump().items():
        setattr(job, k, v)
    job.remote = body.modality == "remoto"
    db.commit()
    db.refresh(job)
    return _detail(db, user, job)


@router.patch("/{job_id}/status", response_model=JobOut)
def set_status(job_id: int, body: StatusIn, user: VerifiedUser, db: DB):
    job = _own_job(db, user, job_id)
    job.status = body.status
    db.commit()
    db.refresh(job)
    return _detail(db, user, job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, user: VerifiedUser, db: DB):
    job = _own_job(db, user, job_id)
    db.query(JobApplication).filter(JobApplication.job_id == job.id).delete()
    db.delete(job)
    db.commit()


@router.post("/{job_id}/apply", response_model=JobOut)
def apply(job_id: int, body: ApplyIn, user: VerifiedUser, db: DB):
    _require_student(user)
    job = _get_job(db, job_id)
    if job.status != "abierta" or (job.deadline and job.deadline < date.today()):
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta oferta ya no admite inscripciones.")
    if db.scalar(select(JobApplication.id).where(JobApplication.job_id == job.id, JobApplication.student_id == user.id)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya estás inscrito en esta oferta.")
    message = (body.message or "").strip() or None
    db.add(JobApplication(job_id=job.id, student_id=user.id, message=message))
    notify(db, job.company_id, "job_application", actor_id=user.id, job_id=job.id)
    db.commit()
    return _detail(db, user, job)


@router.delete("/{job_id}/apply", response_model=JobOut)
def withdraw(job_id: int, user: VerifiedUser, db: DB):
    job = _get_job(db, job_id)
    app = db.scalar(select(JobApplication).where(JobApplication.job_id == job.id, JobApplication.student_id == user.id))
    if not app:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No estabas inscrito en esta oferta.")
    db.delete(app)
    db.commit()
    return _detail(db, user, job)


@router.get("/{job_id}/applications", response_model=list[ApplicationOut])
def list_applications(job_id: int, user: VerifiedUser, db: DB):
    """Candidatos de una oferta. Al abrir la lista, las nuevas pasan a «CV leído»."""
    job = _own_job(db, user, job_id)
    apps = db.scalars(select(JobApplication).where(JobApplication.job_id == job.id).order_by(JobApplication.created_at.desc())).all()
    people = authors(db, {a.student_id for a in apps})
    changed = False
    for a in apps:
        if a.status == "enviada":
            a.status = "vista"
            notify(db, a.student_id, "application_status", actor_id=user.id, job_id=job.id, text=STATUS_TEXT["vista"])
            changed = True
    if changed:
        db.commit()
    return [
        ApplicationOut(id=a.id, student=people[a.student_id], message=a.message, status=a.status, created_at=a.created_at)
        for a in apps
        if a.student_id in people
    ]
