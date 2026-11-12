"""Estadísticas del usuario: rendimiento (público y contenido) y detalle de sus publicaciones."""
from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import func, select

from app.deps import DB, VerifiedUser
from app.models import Comment, Follow, Like, Post, Share, StatEvent
from app.services.stats import change_pct, periods

router = APIRouter(prefix="/stats", tags=["estadísticas"])


class Metric(BaseModel):
    value: int
    previous: int
    change_pct: float | None  # None: antes era 0


class Followers(BaseModel):
    total: int
    new: int
    change_pct: float | None


class Performance(BaseModel):
    days: int
    start: datetime
    end: datetime
    previous_start: datetime
    followers: Followers
    profile_views: Metric
    search_appearances: Metric
    post_impressions: Metric


class PostStats(BaseModel):
    id: int
    excerpt: str
    created_at: datetime
    impressions: int
    impressions_period: int
    likes: int
    comments: int
    shares: int


def _count(db: DB, owner: int, kind: str, since: datetime, until: datetime) -> int:
    return db.scalar(
        select(func.count()).select_from(StatEvent).where(
            StatEvent.owner_id == owner, StatEvent.kind == kind, StatEvent.created_at >= since, StatEvent.created_at < until
        )
    ) or 0


@router.get("/me", response_model=Performance)
def performance(user: VerifiedUser, db: DB, days: int = Query(default=7, ge=1, le=90)):
    prev_start, start, now = periods(days)

    def metric(kind: str) -> Metric:
        cur, prev = _count(db, user.id, kind, start, now), _count(db, user.id, kind, prev_start, start)
        return Metric(value=cur, previous=prev, change_pct=change_pct(cur, prev))

    total = db.scalar(select(func.count()).select_from(Follow).where(Follow.followed_id == user.id)) or 0
    new = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.followed_id == user.id, Follow.created_at >= start)
    ) or 0
    return Performance(
        days=days,
        start=start,
        end=now,
        previous_start=prev_start,
        followers=Followers(total=total, new=new, change_pct=change_pct(total, total - new)),
        profile_views=metric("profile_view"),
        search_appearances=metric("search_appearance"),
        post_impressions=metric("post_impression"),
    )


@router.get("/me/posts", response_model=list[PostStats])
def posts_stats(user: VerifiedUser, db: DB, days: int = Query(default=7, ge=1, le=90)):
    """Tus publicaciones con impresiones (totales y del periodo), me gusta, comentarios y compartidos."""
    _, start, _ = periods(days)
    posts = db.scalars(select(Post).where(Post.user_id == user.id).order_by(Post.created_at.desc()).limit(50)).all()
    ids = [p.id for p in posts]
    if not ids:
        return []

    def per_post(stmt) -> dict[int, int]:
        return dict(db.execute(stmt).all())

    impressions = per_post(
        select(StatEvent.post_id, func.count()).where(StatEvent.kind == "post_impression", StatEvent.post_id.in_(ids)).group_by(StatEvent.post_id)
    )
    recent = per_post(
        select(StatEvent.post_id, func.count())
        .where(StatEvent.kind == "post_impression", StatEvent.post_id.in_(ids), StatEvent.created_at >= start)
        .group_by(StatEvent.post_id)
    )
    likes = per_post(select(Like.post_id, func.count()).where(Like.post_id.in_(ids)).group_by(Like.post_id))
    comments = per_post(select(Comment.post_id, func.count()).where(Comment.post_id.in_(ids)).group_by(Comment.post_id))
    shares = per_post(select(Share.post_id, func.count()).where(Share.post_id.in_(ids)).group_by(Share.post_id))
    return [
        PostStats(
            id=p.id,
            excerpt=(p.content[:120] + ("…" if len(p.content) > 120 else "")) if p.content else "(Publicación con fotos o vídeo)",
            created_at=p.created_at,
            impressions=impressions.get(p.id, 0),
            impressions_period=recent.get(p.id, 0),
            likes=likes.get(p.id, 0),
            comments=comments.get(p.id, 0),
            shares=shares.get(p.id, 0),
        )
        for p in posts
    ]
