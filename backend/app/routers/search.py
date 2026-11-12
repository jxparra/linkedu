from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import func, or_, select

from app.deps import DB, VerifiedUser
from app.models import Community, CommunityMember, Company, StudentProfile, User
from app.schemas.posts import AuthorOut
from app.services.people import authors
from app.services.stats import record

router = APIRouter(tags=["búsqueda"])


class CommunityHit(BaseModel):
    id: int
    name: str
    members: int


class SearchOut(BaseModel):
    users: list[AuthorOut]
    communities: list[CommunityHit]


@router.get("/search", response_model=SearchOut)
def search(user: VerifiedUser, db: DB, q: str = Query(min_length=1, max_length=100)):
    like = f"%{q.strip()}%"
    full_name = StudentProfile.name + " " + StudentProfile.surname
    user_ids = db.scalars(
        select(User.id)
        .outerjoin(StudentProfile, StudentProfile.user_id == User.id)
        .outerjoin(Company, Company.user_id == User.id)
        .where(User.onboarding_done.is_(True), User.id != user.id)
        .where(or_(full_name.ilike(like), User.username.ilike(like), Company.name.ilike(like)))
        .limit(8)
    ).all()
    people = authors(db, set(user_ids))
    if user_ids:
        record(db, "search_appearance", list(user_ids), user.id)
        db.commit()
    members = select(CommunityMember.community_id, func.count().label("m")).group_by(CommunityMember.community_id).subquery()
    rows = db.execute(
        select(Community, func.coalesce(members.c.m, 0))
        .outerjoin(members, members.c.community_id == Community.id)
        .where(Community.name.ilike(like))
        .limit(6)
    ).all()
    return SearchOut(
        users=[people[i] for i in user_ids if i in people],
        communities=[CommunityHit(id=c.id, name=c.name, members=m) for c, m in rows],
    )
