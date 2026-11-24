from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func, select, update

from app.deps import DB, VerifiedUser
from app.models import Community, Job, Notification, Post
from app.schemas.posts import AuthorOut
from app.services.people import authors

router = APIRouter(prefix="/notifications", tags=["notificaciones"])

TEXTS = {
    "like": "ha indicado que le gusta tu publicación",
    "follow": "ha empezado a seguirte",
    "comment": "ha comentado tu publicación",
    "share": "ha compartido tu publicación",
    "reply": "ha respondido a tu comentario",
    "comment_like": "ha indicado que le gusta tu comentario",
    "tag": "te ha etiquetado en una publicación",
    "welcome": "Te damos la bienvenida a Linkedu. Completa tu perfil y únete a comunidades de tus estudios.",
    "job": "ha publicado una oferta que encaja con tus estudios",
    "job_application": "se ha inscrito en tu oferta",
    "application_status": "ha actualizado tu candidatura",
    "group_invite": "te ha invitado a unirte a un grupo",
    "group_join": "se ha unido a tu grupo",
}


class NotificationOut(BaseModel):
    id: int
    type: str
    text: str
    actor: AuthorOut | None
    post_excerpt: str | None
    job_id: int | None = None
    job_title: str | None = None
    group_id: int | None = None
    group_name: str | None = None
    read: bool
    created_at: datetime


class CountOut(BaseModel):
    unread: int


@router.get("", response_model=list[NotificationOut])
def list_notifications(user: VerifiedUser, db: DB):
    items = db.scalars(
        select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc(), Notification.id.desc()).limit(50)
    ).all()
    actor_ids = {n.data.get("actor_id") for n in items if n.data and n.data.get("actor_id")}
    people = authors(db, actor_ids)
    post_ids = {n.data.get("post_id") for n in items if n.data and n.data.get("post_id")}
    posts = {p.id: p for p in db.scalars(select(Post).where(Post.id.in_(post_ids)))} if post_ids else {}
    job_ids = {n.data.get("job_id") for n in items if n.data and n.data.get("job_id")}
    jobs = {j.id: j for j in db.scalars(select(Job).where(Job.id.in_(job_ids)))} if job_ids else {}
    group_ids = {n.data.get("group_id") for n in items if n.data and n.data.get("group_id")}
    groups = {g.id: g for g in db.scalars(select(Community).where(Community.id.in_(group_ids)))} if group_ids else {}
    out = []
    for n in items:
        data = n.data or {}
        post = posts.get(data.get("post_id"))
        excerpt = (post.content[:90] + ("…" if len(post.content) > 90 else "")) if post and post.content else None
        out.append(
            NotificationOut(
                id=n.id,
                type=n.type,
                text=data.get("text") or TEXTS.get(n.type, ""),
                actor=people.get(data.get("actor_id")),
                post_excerpt=excerpt,
                job_id=data.get("job_id") if data.get("job_id") in jobs else None,
                job_title=jobs[data["job_id"]].title if data.get("job_id") in jobs else None,
                group_id=data.get("group_id") if data.get("group_id") in groups else None,
                group_name=groups[data["group_id"]].name if data.get("group_id") in groups else None,
                read=n.read,
                created_at=n.created_at,
            )
        )
    return out


@router.get("/unread-count", response_model=CountOut)
def unread_count(user: VerifiedUser, db: DB):
    n = db.scalar(select(func.count()).select_from(Notification).where(Notification.user_id == user.id, Notification.read.is_(False)))
    return CountOut(unread=n or 0)


@router.post("/read-all", response_model=CountOut)
def read_all(user: VerifiedUser, db: DB):
    db.execute(update(Notification).where(Notification.user_id == user.id, Notification.read.is_(False)).values(read=True))
    db.commit()
    return CountOut(unread=0)
