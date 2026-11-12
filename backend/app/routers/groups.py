"""Grupos de la sección Social: sugerencias, tus grupos, crear, unirse, publicaciones y miembros."""
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import delete, func, select

from app.deps import DB, VerifiedUser
from app.models import (
    Comment,
    Community,
    CommunityDismissal,
    CommunityMember,
    Follow,
    Like,
    Post,
    SavedPost,
    Share,
    StudentProfile,
    User,
)
from app.routers.posts import serialize
from app.schemas.groups import (
    ForumsOut,
    GroupCard,
    GroupIn,
    GroupOut,
    InviteIn,
    JoinOut,
    MemberOut,
    MyGroup,
    SuggestionsOut,
    TopicOut,
)
from app.schemas.posts import PostOut
from app.services import groups as svc
from app.services.people import authors, notify

router = APIRouter(prefix="/groups", tags=["grupos"])


def _privacy(c: Community) -> str:
    return c.privacy or "public"


def _card(info: svc.GroupInfo, reason: str | None = None, is_member: bool = False) -> GroupCard:
    g = info.group
    return GroupCard(
        id=g.id,
        name=g.name,
        description=g.description,
        topic=g.topic,
        topic_label=svc.topic_label(g.topic),
        privacy=_privacy(g),
        cover_url=g.cover_url,
        province=g.province,
        members=info.members,
        posts_week=info.posts_week,
        reason=reason,
        is_member=is_member,
        type=g.type,
    )


def _get(db: DB, group_id: int) -> Community:
    c = db.get(Community, group_id)
    if not c:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos ese grupo.")
    return c


def _membership(db: DB, group_id: int, user_id: int) -> CommunityMember | None:
    return db.get(CommunityMember, (group_id, user_id))


def _require_admin(db: DB, group: Community, user: User) -> None:
    m = _membership(db, group.id, user.id)
    if not m or m.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo los administradores del grupo pueden hacer esto.")


def _can_see(db: DB, group: Community, user: User) -> bool:
    return _privacy(group) == "public" or _membership(db, group.id, user.id) is not None


def _check_topic(topic: str) -> None:
    if topic not in svc.TOPICS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Elige una temática de la lista.")


def _invite(db: DB, group: Community, user: User, user_ids: list[int]) -> int:
    members = set(db.scalars(select(CommunityMember.user_id).where(CommunityMember.community_id == group.id)))
    valid = set(db.scalars(select(User.id).where(User.id.in_(user_ids), User.onboarding_done.is_(True))))
    sent = 0
    for uid in dict.fromkeys(user_ids):
        if uid in valid and uid not in members and uid != user.id:
            notify(db, uid, "group_invite", user.id, group_id=group.id)
            sent += 1
    return sent


# ---------------------------------------------------------------------------
# Rutas fijas (van antes que /groups/{group_id})
# ---------------------------------------------------------------------------


@router.get("/topics", response_model=list[TopicOut])
def topics():
    return [TopicOut(key=k, label=label, universal=u) for k, (label, u) in svc.TOPICS.items()]


@router.get("/suggestions", response_model=SuggestionsOut)
def suggestions(
    user: VerifiedUser,
    db: DB,
    section: Literal["for_you", "nearby", "more"] | None = None,
    limit: int = Query(default=svc.SECTION_SIZE, ge=1, le=60),
):
    """Las tres listas de la pantalla Sugerencias. Con `section` solo esa, más larga (para "Ver todo")."""
    s = svc.suggestions(db, user)
    cut = lambda items, name: [_card(x.info, x.reason) for x in items[:limit]] if section in (None, name) else []  # noqa: E731
    more_limit = limit if section == "more" else 24
    return SuggestionsOut(
        province=s.province,
        for_you=cut(s.for_you, "for_you"),
        nearby=cut(s.nearby, "nearby"),
        more=[_card(x.info, x.reason) for x in s.more[:more_limit]] if section in (None, "more") else [],
    )


@router.get("", response_model=list[GroupCard])
def search_groups(user: VerifiedUser, db: DB, q: str = Query(default="", max_length=100), topic: str | None = None):
    """Buscar grupos por nombre, descripción o temática."""
    stmt = select(Community).where(Community.type == "group")
    text = q.strip()
    if text:
        like = f"%{text}%"
        keys = [k for k, (label, _) in svc.TOPICS.items() if text.lower() in label.lower()]
        cond = Community.name.ilike(like) | Community.description.ilike(like)
        if keys:
            cond = cond | Community.topic.in_(keys)
        stmt = stmt.where(cond)
    if topic:
        stmt = stmt.where(Community.topic == topic)
    groups = list(db.scalars(stmt.limit(200)))
    stats = svc.group_stats(db, groups)
    mine = set(db.scalars(select(CommunityMember.community_id).where(CommunityMember.user_id == user.id)))
    ordered = sorted(stats.values(), key=lambda g: g.popularity, reverse=True)[:40]
    return [_card(g, is_member=g.group.id in mine) for g in ordered]


FORUM_TYPES = ("degree", "school", "general")


@router.get("/forums", response_model=ForumsOut)
def forums(user: VerifiedUser, db: DB, q: str = Query(default="", max_length=100)):
    """Foros (comunidades de estudios, de centros y generales). Primero los de tus estudios y tu centro."""
    stmt = select(Community).where(Community.type.in_(FORUM_TYPES))
    text = q.strip()
    if text:
        stmt = stmt.where(Community.name.ilike(f"%{text}%") | Community.description.ilike(f"%{text}%"))
    all_forums = list(db.scalars(stmt))
    stats = svc.group_stats(db, all_forums)
    joined = dict(
        db.execute(
            select(CommunityMember.community_id, CommunityMember.joined_at).where(
                CommunityMember.user_id == user.id, CommunityMember.community_id.in_([f.id for f in all_forums])
            )
        ).all()
    )
    sp = db.get(StudentProfile, user.id)
    degree_id, school_id = (sp.degree_id, sp.school_id) if sp else (None, None)

    def reason(c: Community) -> str | None:
        if c.type == "degree" and c.target_id == degree_id:
            return f"Porque estudias {svc.degree_short_label(c.name)}"
        if c.type == "school" and c.target_id == school_id:
            return "Tu centro de estudios"
        if c.type == "general":
            return "Para todos los estudiantes"
        return None

    def score(info: svc.GroupInfo) -> tuple:
        c = info.group
        mine = (c.type == "degree" and c.target_id == degree_id) or (c.type == "school" and c.target_id == school_id)
        return (2 if mine else 1 if c.type == "general" else 0, info.popularity)

    mine = sorted((stats[f.id] for f in all_forums if f.id in joined), key=lambda i: str(joined[i.group.id] or ""), reverse=True)
    others = sorted((stats[f.id] for f in all_forums if f.id not in joined), key=score, reverse=True)[:30]
    return ForumsOut(
        mine=[_card(i, reason(i.group), is_member=True) for i in mine],
        suggested=[_card(i, reason(i.group)) for i in others],
    )


@router.get("/mine", response_model=list[MyGroup])
def my_groups(user: VerifiedUser, db: DB, sort: Literal["activity", "name", "joined"] = "activity"):
    """Grupos a los que te has unido."""
    rows = db.execute(
        select(Community, CommunityMember)
        .join(CommunityMember, CommunityMember.community_id == Community.id)
        .where(CommunityMember.user_id == user.id, Community.type == "group")
    ).all()
    ids = [c.id for c, _ in rows]
    last = dict(db.execute(select(Post.community_id, func.max(Post.created_at)).where(Post.community_id.in_(ids)).group_by(Post.community_id)).all())
    stats = svc.group_stats(db, [c for c, _ in rows])
    out = [
        MyGroup(
            id=c.id,
            name=c.name,
            topic=c.topic,
            privacy=_privacy(c),
            cover_url=c.cover_url,
            members=stats[c.id].members,
            role=m.role or "member",
            joined_at=m.joined_at,
            last_activity=last.get(c.id),
        )
        for c, m in rows
    ]
    if sort == "name":
        out.sort(key=lambda g: g.name.lower())
    elif sort == "joined":
        out.sort(key=lambda g: str(g.joined_at or ""), reverse=True)
    else:
        out.sort(key=lambda g: str(g.last_activity or g.joined_at or ""), reverse=True)
    return out


@router.get("/feed", response_model=list[PostOut])
def groups_feed(user: VerifiedUser, db: DB, limit: int = Query(default=20, le=50), before: int | None = None):
    """Publicaciones de los grupos a los que te has unido (Tu feed)."""
    mine = select(CommunityMember.community_id).join(Community, Community.id == CommunityMember.community_id).where(
        CommunityMember.user_id == user.id, Community.type == "group"
    )
    stmt = select(Post).where(Post.community_id.in_(mine)).order_by(Post.created_at.desc(), Post.id.desc()).limit(limit)
    if before:
        stmt = stmt.where(Post.id < before)
    return serialize(db, list(db.scalars(stmt)), user)


@router.post("", response_model=GroupOut, status_code=status.HTTP_201_CREATED)
def create_group(data: GroupIn, user: VerifiedUser, db: DB):
    _check_topic(data.topic)
    exists = db.scalar(select(Community.id).where(Community.type == "group", func.lower(Community.name) == data.name.lower()))
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya hay un grupo con ese nombre. Prueba con otro.")
    group = Community(
        name=data.name,
        description=data.description,
        type="group",
        topic=data.topic,
        privacy=data.privacy,
        province=data.province,
        cover_url=data.cover_url,
        creator_id=user.id,
    )
    db.add(group)
    db.flush()
    db.add(CommunityMember(community_id=group.id, user_id=user.id, role="admin"))
    db.flush()
    _invite(db, group, user, data.invite_ids)
    db.commit()
    return get_group(group.id, user, db)


# ---------------------------------------------------------------------------
# Un grupo
# ---------------------------------------------------------------------------


@router.get("/{group_id}", response_model=GroupOut)
def get_group(group_id: int, user: VerifiedUser, db: DB):
    g = _get(db, group_id)
    info = svc.group_stats(db, [g])[g.id]
    me = _membership(db, g.id, user.id)
    admin_ids = list(db.scalars(select(CommunityMember.user_id).where(CommunityMember.community_id == g.id, CommunityMember.role == "admin")))
    preview_ids = list(
        db.scalars(select(CommunityMember.user_id).where(CommunityMember.community_id == g.id).order_by(CommunityMember.joined_at.desc()).limit(8))
    )
    following = list(
        db.scalars(
            select(CommunityMember.user_id)
            .join(Follow, (Follow.followed_id == CommunityMember.user_id) & (Follow.follower_id == user.id))
            .where(CommunityMember.community_id == g.id)
            .limit(3)
        )
    )
    people = authors(db, set(admin_ids) | set(preview_ids) | set(following))
    return GroupOut(
        id=g.id,
        name=g.name,
        description=g.description,
        type=g.type,
        topic=g.topic,
        topic_label=svc.topic_label(g.topic),
        privacy=_privacy(g),
        cover_url=g.cover_url,
        province=g.province,
        created_at=g.created_at,
        members=info.members,
        posts_week=info.posts_week,
        is_member=me is not None,
        role=(me.role or "member") if me else None,
        admins=[people[i] for i in admin_ids if i in people],
        member_preview=[people[i] for i in preview_ids if i in people],
        following_in_group=[people[i] for i in following if i in people],
        can_see_content=_can_see(db, g, user),
    )


@router.put("/{group_id}", response_model=GroupOut)
def update_group(group_id: int, data: GroupIn, user: VerifiedUser, db: DB):
    g = _get(db, group_id)
    _require_admin(db, g, user)
    _check_topic(data.topic)
    clash = db.scalar(
        select(Community.id).where(Community.type == "group", func.lower(Community.name) == data.name.lower(), Community.id != g.id)
    )
    if clash:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya hay un grupo con ese nombre. Prueba con otro.")
    g.name, g.description, g.topic, g.privacy = data.name, data.description, data.topic, data.privacy
    g.province, g.cover_url = data.province, data.cover_url
    db.commit()
    return get_group(g.id, user, db)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group_id: int, user: VerifiedUser, db: DB):
    """Elimina el grupo y sus publicaciones (si no, las de un grupo privado pasarían a ser públicas)."""
    g = _get(db, group_id)
    _require_admin(db, g, user)
    post_ids = list(db.scalars(select(Post.id).where(Post.community_id == g.id)))
    if post_ids:
        for model in (Like, Share, SavedPost, Comment):
            db.execute(delete(model).where(model.post_id.in_(post_ids)))
        db.execute(delete(Post).where(Post.id.in_(post_ids)))
    db.execute(delete(CommunityMember).where(CommunityMember.community_id == g.id))
    db.execute(delete(CommunityDismissal).where(CommunityDismissal.community_id == g.id))
    db.delete(g)
    db.commit()


def _members_count(db: DB, group_id: int) -> int:
    return db.scalar(select(func.count()).select_from(CommunityMember).where(CommunityMember.community_id == group_id)) or 0


@router.post("/{group_id}/join", response_model=JoinOut)
def join(group_id: int, user: VerifiedUser, db: DB):
    g = _get(db, group_id)
    if not _membership(db, g.id, user.id):
        db.add(CommunityMember(community_id=g.id, user_id=user.id, role="member"))
        db.execute(delete(CommunityDismissal).where(CommunityDismissal.user_id == user.id, CommunityDismissal.community_id == g.id))
        for admin_id in db.scalars(select(CommunityMember.user_id).where(CommunityMember.community_id == g.id, CommunityMember.role == "admin")):
            notify(db, admin_id, "group_join", user.id, group_id=g.id)
        db.commit()
    return JoinOut(is_member=True, members=_members_count(db, g.id))


@router.delete("/{group_id}/join", response_model=JoinOut)
def leave(group_id: int, user: VerifiedUser, db: DB):
    """Salir del grupo. Si eras el único administrador, pasa a serlo quien lleve más tiempo dentro."""
    g = _get(db, group_id)
    m = _membership(db, g.id, user.id)
    if m:
        was_admin = m.role == "admin"
        db.delete(m)
        db.flush()
        if was_admin and not db.scalar(
            select(CommunityMember.user_id).where(CommunityMember.community_id == g.id, CommunityMember.role == "admin")
        ):
            oldest = db.scalar(
                select(CommunityMember).where(CommunityMember.community_id == g.id).order_by(CommunityMember.joined_at).limit(1)
            )
            if oldest:
                oldest.role = "admin"
        db.commit()
    return JoinOut(is_member=False, members=_members_count(db, g.id))


@router.post("/{group_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
def dismiss(group_id: int, user: VerifiedUser, db: DB):
    """Quitar un grupo de tus sugerencias (la "X" de la tarjeta)."""
    _get(db, group_id)
    if not db.get(CommunityDismissal, (user.id, group_id)):
        db.add(CommunityDismissal(user_id=user.id, community_id=group_id))
        db.commit()


@router.delete("/{group_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
def undo_dismiss(group_id: int, user: VerifiedUser, db: DB):
    db.execute(delete(CommunityDismissal).where(CommunityDismissal.user_id == user.id, CommunityDismissal.community_id == group_id))
    db.commit()


@router.get("/{group_id}/posts", response_model=list[PostOut])
def group_posts(group_id: int, user: VerifiedUser, db: DB, limit: int = Query(default=20, le=50), before: int | None = None):
    g = _get(db, group_id)
    if not _can_see(db, g, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Este grupo es privado. Únete para ver sus publicaciones.")
    stmt = select(Post).where(Post.community_id == g.id).order_by(Post.created_at.desc(), Post.id.desc()).limit(limit)
    if before:
        stmt = stmt.where(Post.id < before)
    return serialize(db, list(db.scalars(stmt)), user)


@router.get("/{group_id}/members", response_model=list[MemberOut])
def members(group_id: int, user: VerifiedUser, db: DB):
    g = _get(db, group_id)
    if not _can_see(db, g, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Este grupo es privado. Únete para ver quién está.")
    rows = db.execute(
        select(CommunityMember.user_id, CommunityMember.role, CommunityMember.joined_at)
        .where(CommunityMember.community_id == g.id)
        .order_by(CommunityMember.joined_at)
        .limit(500)
    ).all()
    people = authors(db, {uid for uid, _, _ in rows})
    out = [MemberOut(user=people[uid], role=role or "member", joined_at=joined) for uid, role, joined in rows if uid in people]
    out.sort(key=lambda m: m.role != "admin")  # administradores primero
    return out


@router.post("/{group_id}/invite")
def invite(group_id: int, data: InviteIn, user: VerifiedUser, db: DB):
    g = _get(db, group_id)
    if not _membership(db, g.id, user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Únete al grupo para invitar a otras personas.")
    sent = _invite(db, g, user, data.user_ids)
    db.commit()
    return {"sent": sent}
