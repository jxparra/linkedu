from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import delete, func, select

from app.deps import DB, VerifiedUser
from app.models import Comment, CommentLike, Post, Report, User
from app.routers.posts import visible_to
from app.schemas.posts import CommentIn, CommentLikeOut, CommentOut, ReportIn
from app.services.people import authors, notify

router = APIRouter(tags=["comentarios"])


def serialize_comments(db: DB, comments: list[Comment], me: User, post: Post) -> list[CommentOut]:
    if not comments:
        return []
    ids = [c.id for c in comments]
    likes = dict(
        db.execute(select(CommentLike.comment_id, func.count()).where(CommentLike.comment_id.in_(ids)).group_by(CommentLike.comment_id)).all()
    )
    replies = dict(
        db.execute(select(Comment.parent_id, func.count()).where(Comment.parent_id.in_(ids)).group_by(Comment.parent_id)).all()
    )
    mine = set(db.scalars(select(CommentLike.comment_id).where(CommentLike.user_id == me.id, CommentLike.comment_id.in_(ids))))
    people = authors(db, {c.user_id for c in comments})
    return [
        CommentOut(
            id=c.id,
            post_id=c.post_id,
            parent_id=c.parent_id,
            author=people[c.user_id],
            content=c.content,
            image_url=c.image_url,
            created_at=c.created_at,
            likes=likes.get(c.id, 0),
            liked_by_me=c.id in mine,
            replies=replies.get(c.id, 0),
            is_mine=c.user_id == me.id,
            can_delete=c.user_id == me.id or post.user_id == me.id,
            by_post_author=c.user_id == post.user_id,
        )
        for c in comments
        if c.user_id in people
    ]


@router.get("/posts/{post_id}/comments", response_model=list[CommentOut])
def list_comments(
    post_id: int,
    user: VerifiedUser,
    db: DB,
    sort: Literal["relevant", "recent", "all"] = Query(default="relevant"),
):
    """Todos los comentarios (y respuestas) de una publicación.

    - relevant: los del autor y los que tienen más "me gusta" y respuestas primero
    - recent: los más nuevos primero
    - all: en orden cronológico
    """
    post = db.scalar(select(Post).where(Post.id == post_id, visible_to(user)))  # no las de grupos privados ajenos
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    comments = list(db.scalars(select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at, Comment.id)))
    out = serialize_comments(db, comments, user, post)
    top = [c for c in out if c.parent_id is None]
    replies = [c for c in out if c.parent_id is not None]
    if sort == "recent":
        top.sort(key=lambda c: c.created_at, reverse=True)
    elif sort == "relevant":
        top.sort(key=lambda c: (c.is_mine, c.likes * 2 + c.replies * 3, c.created_at), reverse=True)
    return top + replies


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, data: CommentIn, user: VerifiedUser, db: DB):
    post = db.scalar(select(Post).where(Post.id == post_id, visible_to(user)))  # no las de grupos privados ajenos
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa publicación.")
    if not data.content.strip() and not data.image_url:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Escribe algo antes de comentar.")
    parent = None
    if data.parent_id:
        parent = db.get(Comment, data.parent_id)
        if not parent or parent.post_id != post_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos el comentario al que respondes.")
        if parent.parent_id:  # solo un nivel de respuestas, como en Facebook
            parent = db.get(Comment, parent.parent_id)
    c = Comment(post_id=post_id, user_id=user.id, parent_id=parent.id if parent else None,
                content=data.content.strip(), image_url=data.image_url)
    db.add(c)
    db.flush()
    notify(db, post.user_id, "comment", user.id, post_id=post_id)
    if parent and parent.user_id != post.user_id:
        notify(db, parent.user_id, "reply", user.id, post_id=post_id)
    db.commit()
    db.refresh(c)
    return serialize_comments(db, [c], user, post)[0]


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, user: VerifiedUser, db: DB):
    c = db.get(Comment, comment_id)
    post = db.get(Post, c.post_id) if c else None
    if not c or not post or (c.user_id != user.id and post.user_id != user.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos ese comentario.")
    db.execute(delete(Comment).where(Comment.parent_id == c.id))
    db.delete(c)
    db.commit()


def _likes(db: DB, comment_id: int) -> int:
    return db.scalar(select(func.count()).select_from(CommentLike).where(CommentLike.comment_id == comment_id)) or 0


@router.post("/comments/{comment_id}/like", response_model=CommentLikeOut)
def like_comment(comment_id: int, user: VerifiedUser, db: DB):
    c = db.get(Comment, comment_id)
    if not c:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos ese comentario.")
    if not db.get(CommentLike, (user.id, comment_id)):
        db.add(CommentLike(user_id=user.id, comment_id=comment_id))
        notify(db, c.user_id, "comment_like", user.id, post_id=c.post_id)
        db.commit()
    return CommentLikeOut(liked=True, likes=_likes(db, comment_id))


@router.delete("/comments/{comment_id}/like", response_model=CommentLikeOut)
def unlike_comment(comment_id: int, user: VerifiedUser, db: DB):
    db.execute(delete(CommentLike).where(CommentLike.user_id == user.id, CommentLike.comment_id == comment_id))
    db.commit()
    return CommentLikeOut(liked=False, likes=_likes(db, comment_id))


@router.post("/reports", status_code=status.HTTP_201_CREATED)
def report(data: ReportIn, user: VerifiedUser, db: DB):
    db.add(Report(reporter_id=user.id, target_type=data.target_type, target_id=data.target_id, reason=data.reason))
    db.commit()
    return {"message": "Gracias por avisar. Lo revisaremos lo antes posible."}
