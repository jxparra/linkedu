from datetime import timedelta

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import delete, func, or_, select

from app.deps import DB, VerifiedUser
from app.models import Comment, Community, CommunityMember, Follow, Like, Post, SavedPost, Share, User
from app.schemas.posts import CommunityRef, FollowOut, LikeOut, PostIn, PostOut, SaveOut, ShareOut, TrendOut, UserRef
from app.services.people import authors, notify
from app.services.stats import record

router = APIRouter(tags=["feed"])


def visible_to(user: User):
    """Condición: la publicación no es de un grupo privado, o eres miembro de ese grupo."""
    private = select(Community.id).where(Community.privacy == "private")
    mine = select(CommunityMember.community_id).where(CommunityMember.user_id == user.id)
    return or_(Post.community_id.is_(None), Post.community_id.not_in(private), Post.community_id.in_(mine))


def serialize(db: DB, posts: list[Post], me: User) -> list[PostOut]:
    if not posts:
        return []
    ids = [p.id for p in posts]
    likes = dict(db.execute(select(Like.post_id, func.count()).where(Like.post_id.in_(ids)).group_by(Like.post_id)).all())
    comments = dict(
        db.execute(select(Comment.post_id, func.count()).where(Comment.post_id.in_(ids)).group_by(Comment.post_id)).all()
    )
    shares = dict(db.execute(select(Share.post_id, func.count()).where(Share.post_id.in_(ids)).group_by(Share.post_id)).all())
    mine_liked = set(db.scalars(select(Like.post_id).where(Like.user_id == me.id, Like.post_id.in_(ids))))
    mine_shared = set(db.scalars(select(Share.post_id).where(Share.user_id == me.id, Share.post_id.in_(ids))))
    mine_saved = set(db.scalars(select(SavedPost.post_id).where(SavedPost.user_id == me.id, SavedPost.post_id.in_(ids))))
    following = set(db.scalars(select(Follow.followed_id).where(Follow.follower_id == me.id)))
    tagged_ids = {uid for p in posts for uid in (p.tagged_user_ids or [])}
    people = authors(db, {p.user_id for p in posts} | tagged_ids)
    communities = {
        c.id: c for c in db.scalars(select(Community).where(Community.id.in_({p.community_id for p in posts if p.community_id})))
    }
    out = []
    for p in posts:
        edited = bool(p.updated_at and p.created_at and p.updated_at - p.created_at > timedelta(seconds=5))
        c = communities.get(p.community_id) if p.community_id else None
        out.append(
            PostOut(
                id=p.id,
                type=p.type,
                content=p.content,
                image_url=p.image_url,
                media_type=p.media_type or ("image" if p.image_url else None),
                media=p.media or ([{"url": p.image_url, "type": p.media_type or "image"}] if p.image_url else []),
                feeling=p.feeling,
                location=p.location,
                tagged=[UserRef(id=uid, name=people[uid].name) for uid in (p.tagged_user_ids or []) if uid in people],
                created_at=p.created_at,
                edited=edited,
                author=people[p.user_id],
                community=CommunityRef(id=c.id, name=c.name, is_group=c.type == "group") if c else None,
                likes=likes.get(p.id, 0),
                comments=comments.get(p.id, 0),
                shares=shares.get(p.id, 0),
                liked_by_me=p.id in mine_liked,
                shared_by_me=p.id in mine_shared,
                saved_by_me=p.id in mine_saved,
                following_author=p.user_id in following,
                is_mine=p.user_id == me.id,
            )
        )
    return out


@router.get("/feed", response_model=list[PostOut])
def feed(
    user: VerifiedUser,
    db: DB,
    limit: int = Query(default=20, le=50),
    before: int | None = None,
    author_id: int | None = None,
):
    """Publicaciones recientes. Con `author_id`, solo las de ese usuario (para su perfil)."""
    stmt = select(Post).where(visible_to(user)).order_by(Post.created_at.desc(), Post.id.desc()).limit(limit)
    if before:
        stmt = stmt.where(Post.id < before)
    if author_id:
        stmt = stmt.where(Post.user_id == author_id)
    posts = list(db.scalars(stmt))
    # Impresiones para las estadísticas de quien publicó (las tuyas no cuentan)
    record(db, "post_impression", [p.user_id for p in posts], user.id, [p.id for p in posts])
    db.commit()
    return serialize(db, posts, user)


@router.post("/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(data: PostIn, user: VerifiedUser, db: DB):
    media = [m.model_dump() for m in data.media]
    if not media and data.image_url:
        media = [{"url": data.image_url, "type": data.media_type or "image"}]
    if not data.content.strip() and not media:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Escribe algo o añade una foto antes de publicar.")
    if data.community_id:
        if not db.get(CommunityMember, (data.community_id, user.id)):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Únete a la comunidad para publicar en ella.")
    tagged = [uid for uid in dict.fromkeys(data.tagged_user_ids) if uid != user.id and db.get(User, uid)]
    post = Post(
        user_id=user.id,
        content=data.content.strip(),
        type=data.type,
        community_id=data.community_id,
        image_url=media[0]["url"] if media else None,
        media_type=media[0]["type"] if media else None,
        media=media or None,
        feeling=data.feeling,
        location=data.location,
        tagged_user_ids=tagged or None,
    )
    db.add(post)
    db.flush()
    for uid in tagged:
        notify(db, uid, "tag", user.id, post_id=post.id)
    db.commit()
    db.refresh(post)
    return serialize(db, [post], user)[0]


@router.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int, user: VerifiedUser, db: DB):
    post = db.scalar(select(Post).where(Post.id == post_id, visible_to(user)))
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    return serialize(db, [post], user)[0]


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, user: VerifiedUser, db: DB):
    post = db.get(Post, post_id)
    if not post or post.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    db.delete(post)
    db.commit()


def _like_count(db: DB, post_id: int) -> int:
    return db.scalar(select(func.count()).select_from(Like).where(Like.post_id == post_id)) or 0


@router.post("/posts/{post_id}/like", response_model=LikeOut)
def like(post_id: int, user: VerifiedUser, db: DB):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    if not db.get(Like, (user.id, post_id)):
        db.add(Like(user_id=user.id, post_id=post_id))
        notify(db, post.user_id, "like", user.id, post_id=post_id)
        db.commit()
    return LikeOut(liked=True, likes=_like_count(db, post_id))


@router.delete("/posts/{post_id}/like", response_model=LikeOut)
def unlike(post_id: int, user: VerifiedUser, db: DB):
    db.execute(delete(Like).where(Like.user_id == user.id, Like.post_id == post_id))
    db.commit()
    return LikeOut(liked=False, likes=_like_count(db, post_id))


def _share_count(db: DB, post_id: int) -> int:
    return db.scalar(select(func.count()).select_from(Share).where(Share.post_id == post_id)) or 0


@router.post("/posts/{post_id}/share", response_model=ShareOut)
def share(post_id: int, user: VerifiedUser, db: DB):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    if not db.get(Share, (user.id, post_id)):
        db.add(Share(user_id=user.id, post_id=post_id))
        notify(db, post.user_id, "share", user.id, post_id=post_id)
        db.commit()
    return ShareOut(shared=True, shares=_share_count(db, post_id))


@router.delete("/posts/{post_id}/share", response_model=ShareOut)
def unshare(post_id: int, user: VerifiedUser, db: DB):
    db.execute(delete(Share).where(Share.user_id == user.id, Share.post_id == post_id))
    db.commit()
    return ShareOut(shared=False, shares=_share_count(db, post_id))


@router.get("/saved", response_model=list[PostOut])
def saved_posts(user: VerifiedUser, db: DB, limit: int = Query(default=50, le=100)):
    """Publicaciones guardadas, de la última que guardaste a la primera."""
    posts = db.scalars(
        select(Post)
        .join(SavedPost, SavedPost.post_id == Post.id)
        .where(SavedPost.user_id == user.id)
        .order_by(SavedPost.created_at.desc(), Post.id.desc())
        .limit(limit)
    ).all()
    return serialize(db, list(posts), user)


@router.post("/posts/{post_id}/save", response_model=SaveOut)
def save_post(post_id: int, user: VerifiedUser, db: DB):
    if not db.get(Post, post_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    if not db.get(SavedPost, (user.id, post_id)):
        db.add(SavedPost(user_id=user.id, post_id=post_id))
        db.commit()
    return SaveOut(saved=True)


@router.delete("/posts/{post_id}/save", response_model=SaveOut)
def unsave_post(post_id: int, user: VerifiedUser, db: DB):
    db.execute(delete(SavedPost).where(SavedPost.user_id == user.id, SavedPost.post_id == post_id))
    db.commit()
    return SaveOut(saved=False)


@router.post("/users/{user_id}/follow", response_model=FollowOut)
def follow(user_id: int, user: VerifiedUser, db: DB):
    if user_id == user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No puedes seguirte a ti mismo.")
    if not db.get(User, user_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos a ese usuario.")
    if not db.get(Follow, (user.id, user_id)):
        db.add(Follow(follower_id=user.id, followed_id=user_id))
        notify(db, user_id, "follow", user.id)
        db.commit()
    return FollowOut(following=True)


@router.delete("/users/{user_id}/follow", response_model=FollowOut)
def unfollow(user_id: int, user: VerifiedUser, db: DB):
    db.execute(delete(Follow).where(Follow.follower_id == user.id, Follow.followed_id == user_id))
    db.commit()
    return FollowOut(following=False)


@router.get("/trends", response_model=list[TrendOut])
def trends(db: DB, limit: int = Query(default=6, le=20)):
    """Comunidades con más publicaciones: lo que se mueve ahora en StudyHub."""
    posts = (
        select(Post.community_id, func.count().label("n"), func.max(Post.created_at).label("last"))
        .where(Post.community_id.is_not(None))
        .group_by(Post.community_id)
        .subquery()
    )
    members = select(CommunityMember.community_id, func.count().label("m")).group_by(CommunityMember.community_id).subquery()
    rows = db.execute(
        select(Community, posts.c.n, posts.c.last, func.coalesce(members.c.m, 0))
        .join(posts, posts.c.community_id == Community.id)
        .outerjoin(members, members.c.community_id == Community.id)
        .order_by(posts.c.n.desc(), posts.c.last.desc())
        .limit(limit)
    ).all()
    return [TrendOut(id=c.id, name=c.name, posts=n, members=m, last_activity=last) for c, n, last, m in rows]
