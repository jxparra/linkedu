from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select

from app.deps import DB, VerifiedUser
from app.models import CommunityMember, Community, Follow, Post
from app.schemas.posts import AuthorOut, CommunityRef
from app.services.people import author
from app.services.stats import record

router = APIRouter(prefix="/users", tags=["usuarios"])


class ProfileOut(BaseModel):
    user: AuthorOut
    posts: int
    followers: int
    following: int
    is_me: bool
    followed_by_me: bool
    communities: list[CommunityRef]


@router.get("/{user_id}", response_model=ProfileOut)
def profile(user_id: int, me: VerifiedUser, db: DB):
    info = author(db, user_id)
    if not info:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos a ese usuario.")
    count = lambda stmt: db.scalar(stmt) or 0  # noqa: E731
    communities = db.scalars(
        select(Community).join(CommunityMember, CommunityMember.community_id == Community.id).where(CommunityMember.user_id == user_id)
    ).all()
    if user_id != me.id:
        record(db, "profile_view", [user_id], me.id)
        db.commit()
    return ProfileOut(
        user=info,
        posts=count(select(func.count()).select_from(Post).where(Post.user_id == user_id)),
        followers=count(select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)),
        following=count(select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)),
        is_me=user_id == me.id,
        followed_by_me=bool(db.get(Follow, (me.id, user_id))),
        communities=[CommunityRef(id=c.id, name=c.name) for c in communities],
    )
