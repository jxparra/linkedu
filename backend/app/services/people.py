"""Construye la información pública de un usuario (nombre, estudios, etiqueta) para mostrarla en la app."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Company, Degree, Notification, School, StudentProfile, User
from app.schemas.posts import AuthorOut

LEVEL_BADGE = {"master": "Máster"}


def short_degree(name: str) -> str:
    for prefix in ("Grado en ", "Máster en ", "CFGS ", "CFGM "):
        if name.startswith(prefix):
            return name[len(prefix):]
    return name


def authors(db: Session, user_ids: set[int]) -> dict[int, AuthorOut]:
    if not user_ids:
        return {}
    rows = db.execute(
        select(User, StudentProfile, Company, School, Degree)
        .outerjoin(StudentProfile, StudentProfile.user_id == User.id)
        .outerjoin(Company, Company.user_id == User.id)
        .outerjoin(School, School.id == StudentProfile.school_id)
        .outerjoin(Degree, Degree.id == StudentProfile.degree_id)
        .where(User.id.in_(user_ids))
    ).all()
    out: dict[int, AuthorOut] = {}
    for user, profile, company, school, degree in rows:
        if company:
            name = company.name
            headline = ", ".join(x for x in (company.sector, company.location) if x) or None
            badge, avatar = "Empresa", company.logo_url
        elif profile:
            name = f"{profile.name} {profile.surname}"
            parts = [short_degree(degree.name) if degree else None, school.name if school else None, profile.location]
            headline = ", ".join(p for p in parts if p) or None
            if degree and degree.level in LEVEL_BADGE:
                badge = LEVEL_BADGE[degree.level]
            else:
                badge = f"{profile.course}º curso" if profile.course else None
            avatar = profile.avatar_url
        else:
            name, headline, badge, avatar = user.username or "Usuario", None, None, None
        out[user.id] = AuthorOut(
            id=user.id,
            name=name,
            username=user.username,
            avatar_url=avatar,
            role=user.role.value if user.role else None,
            headline=headline,
            badge=badge,
        )
    return out


def author(db: Session, user_id: int) -> AuthorOut | None:
    return authors(db, {user_id}).get(user_id)


def notify(db: Session, user_id: int, type: str, actor_id: int | None = None, **data) -> None:
    """Crea una notificación (sin hacer commit). No se notifica a uno mismo."""
    if actor_id is not None and actor_id == user_id:
        return
    db.add(Notification(user_id=user_id, type=type, data={"actor_id": actor_id, **data}))
