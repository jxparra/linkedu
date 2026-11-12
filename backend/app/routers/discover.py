"""Panel «Publicaciones de interés»: publicaciones, personas y foros/grupos recomendados según tu perfil."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func, select

from app.deps import DB, VerifiedUser
from app.models import Comment, Community, CommunityMember, Follow, Like, Post, StudentProfile, User
from app.routers.groups import _card, forums
from app.routers.posts import visible_to
from app.schemas.groups import GroupCard
from app.schemas.posts import AuthorOut
from app.services import groups as svc
from app.services.people import authors

router = APIRouter(prefix="/discover", tags=["descubrir"])

POSTS_DAYS = 30


class InterestPost(BaseModel):
    id: int
    excerpt: str
    author: str
    community: str | None
    created_at: datetime
    likes: int
    comments: int
    reason: str  # «De tu foro de DAW», «En Programadores de Granada», «De alguien de tu carrera»


class PersonSuggestion(BaseModel):
    user: AuthorOut
    reason: str  # «Estudia DAW», «De tu centro», «La siguen 2 personas que sigues»


class DiscoverOut(BaseModel):
    posts: list[InterestPost]
    people: list[PersonSuggestion]
    communities: list[GroupCard]


def _excerpt(text: str, size: int = 120) -> str:
    text = " ".join(text.split())
    return text if len(text) <= size else text[: size - 1].rsplit(" ", 1)[0] + "…"


@router.get("", response_model=DiscoverOut)
def discover(user: VerifiedUser, db: DB):
    me = svc.interests(db, user)
    sp = db.get(StudentProfile, user.id)
    degree_id, school_id = (sp.degree_id, sp.school_id) if sp else (None, None)
    following = set(db.scalars(select(Follow.followed_id).where(Follow.follower_id == user.id)))

    # --- Publicaciones de interés -------------------------------------------------
    since = datetime.now(timezone.utc) - timedelta(days=POSTS_DAYS)
    recent = list(
        db.scalars(
            select(Post)
            .where(visible_to(user), Post.user_id != user.id, Post.created_at >= since, Post.content != "")
            .order_by(Post.created_at.desc())
            .limit(300)
        )
    )
    ids = [p.id for p in recent]
    likes = dict(db.execute(select(Like.post_id, func.count()).where(Like.post_id.in_(ids)).group_by(Like.post_id)).all())
    comments = dict(db.execute(select(Comment.post_id, func.count()).where(Comment.post_id.in_(ids)).group_by(Comment.post_id)).all())
    communities = {c.id: c for c in db.scalars(select(Community).where(Community.id.in_({p.community_id for p in recent if p.community_id})))}
    same_degree = set(db.scalars(select(StudentProfile.user_id).where(StudentProfile.degree_id == degree_id))) if degree_id else set()
    people = authors(db, {p.user_id for p in recent})

    def post_reason(p: Post) -> tuple[float, str] | None:
        c = communities.get(p.community_id) if p.community_id else None
        if c and c.type == "degree" and c.target_id == degree_id:
            return 6, f"De tu foro de {svc.degree_short_label(c.name)}"
        if c and c.type == "school" and c.target_id == school_id:
            return 5, "De tu centro de estudios"
        if c and c.topic and me.topics.get(c.topic, 0) > 0:
            return 2 + min(me.topics[c.topic], 3), f"En {c.name}"
        if p.user_id in same_degree:
            return 3, "De alguien de tu carrera"
        if p.user_id in following:
            return 0.5, "De alguien a quien sigues"
        if c and c.type == "general":
            return 1, f"En {c.name}"
        return None

    scored = []
    for p in recent:
        r = post_reason(p)
        if not r:
            continue
        age_days = (datetime.now(timezone.utc) - p.created_at.replace(tzinfo=p.created_at.tzinfo or timezone.utc)).days
        engagement = likes.get(p.id, 0) + 2 * comments.get(p.id, 0)
        # Pesa más que sea de tu perfil que la popularidad (que se limita para que no lo tape todo)
        scored.append((2 * r[0] + min(engagement, 6) * 0.4 - age_days * 0.1, p, r[1]))
    scored.sort(key=lambda x: x[0], reverse=True)
    posts_out = []
    seen_communities: set[int | None] = set()
    for _, p, reason in scored:
        # Variedad: como mucho una publicación por comunidad
        if p.community_id and p.community_id in seen_communities:
            continue
        seen_communities.add(p.community_id)
        c = communities.get(p.community_id) if p.community_id else None
        posts_out.append(
            InterestPost(
                id=p.id,
                excerpt=_excerpt(p.content),
                author=people[p.user_id].name if p.user_id in people else "",
                community=c.name if c else None,
                created_at=p.created_at,
                likes=likes.get(p.id, 0),
                comments=comments.get(p.id, 0),
                reason=reason,
            )
        )
        if len(posts_out) == 3:
            break

    # --- Personas para seguir ----------------------------------------------------
    candidates = list(
        db.execute(
            select(User.id, StudentProfile.degree_id, StudentProfile.school_id)
            .outerjoin(StudentProfile, StudentProfile.user_id == User.id)
            .where(User.id != user.id, User.onboarding_done.is_(True), User.id.not_in(following or {0}))
        ).all()
    )
    followed_by_friends = dict(
        db.execute(
            select(Follow.followed_id, func.count())
            .where(Follow.follower_id.in_(following or {0}))
            .group_by(Follow.followed_id)
        ).all()
    )
    my_groups = select(CommunityMember.community_id).where(CommunityMember.user_id == user.id)
    shared_groups = dict(
        db.execute(
            select(CommunityMember.user_id, func.count()).where(CommunityMember.community_id.in_(my_groups)).group_by(CommunityMember.user_id)
        ).all()
    )
    ranked = []
    for uid, d, s in candidates:
        score, reason = 0.0, None
        if degree_id and d == degree_id:
            score += 4
            reason = "Estudia lo mismo que tú"
        if school_id and s == school_id:
            score += 3
            reason = reason or "De tu centro de estudios"
        friends = followed_by_friends.get(uid, 0)
        if friends:
            score += 1.5 * friends
            reason = reason or (f"La siguen {friends} personas que sigues" if friends > 1 else "La sigue alguien a quien sigues")
        groups_in_common = shared_groups.get(uid, 0)
        if groups_in_common:
            score += 0.5 * groups_in_common
            reason = reason or (f"{groups_in_common} grupos en común" if groups_in_common > 1 else "1 grupo en común")
        if score > 0:
            ranked.append((score, uid, reason))
    ranked.sort(key=lambda x: (x[0], -x[1]), reverse=True)
    top = ranked[:3]
    infos = authors(db, {uid for _, uid, _ in top})
    people_out = [PersonSuggestion(user=infos[uid], reason=reason) for _, uid, reason in top if uid in infos]

    # --- Foros y grupos para unirse ------------------------------------------------
    own_forums = [f for f in forums(user, db, q="").suggested if f.reason and not f.reason.startswith("Para todos")]
    groups_for_you = [_card(s.info, s.reason) for s in svc.suggestions(db, user).for_you]
    mixed: list[GroupCard] = []
    # Alterna grupo y foro para que salgan de los dos tipos
    for i in range(3):
        for source in (groups_for_you, own_forums) if i % 2 == 0 else (own_forums, groups_for_you):
            if source and len(mixed) < 3:
                mixed.append(source.pop(0))
                break

    return DiscoverOut(posts=posts_out, people=people_out, communities=mixed)
