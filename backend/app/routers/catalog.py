from fastapi import APIRouter, Query
from sqlalchemy import func, or_, select

from app.deps import DB
from app.models import Community, CommunityMember, Degree, School, SchoolDegree
from app.schemas.catalog import CommunityOut, DegreeOut, OccupationsOut, SchoolOut
from app.services.occupations import suggest

router = APIRouter(prefix="/catalog", tags=["catálogo"])


@router.get("/schools", response_model=list[SchoolOut])
def list_schools(db: DB, q: str = Query(default="", max_length=100)):
    stmt = select(School).order_by(School.name).limit(20)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(School.name.ilike(like), School.city.ilike(like)))
    return db.scalars(stmt).all()


@router.get("/degrees", response_model=list[DegreeOut])
def list_degrees(db: DB, q: str = Query(default="", max_length=100), school_id: int | None = None):
    stmt = select(Degree).order_by(Degree.name).limit(20)
    if school_id:
        stmt = stmt.join(SchoolDegree, SchoolDegree.degree_id == Degree.id).where(SchoolDegree.school_id == school_id)
    if q:
        stmt = stmt.where(Degree.name.ilike(f"%{q}%"))
    return db.scalars(stmt).all()


@router.get("/communities/suggested", response_model=list[CommunityOut])
def suggested_communities(db: DB, degree_id: int | None = None, school_id: int | None = None):
    members = (
        select(CommunityMember.community_id, func.count().label("n"))
        .group_by(CommunityMember.community_id)
        .subquery()
    )
    stmt = select(Community, func.coalesce(members.c.n, 0)).outerjoin(members, members.c.community_id == Community.id)
    filters = [Community.type == "general"]
    if degree_id:
        filters.append((Community.type == "degree") & (Community.target_id == degree_id))
    if school_id:
        filters.append((Community.type == "school") & (Community.target_id == school_id))
    rows = db.execute(stmt.where(or_(*filters)).limit(8)).all()
    return [CommunityOut(id=c.id, name=c.name, description=c.description, type=c.type, members=n) for c, n in rows]


@router.get("/occupations", response_model=OccupationsOut)
async def occupations(q: str = Query(default="", max_length=100), limit: int = Query(default=8, ge=1, le=20)):
    """Puestos de trabajo que empiezan o contienen el texto (ESCO, con lista local de reserva)."""
    items, source = await suggest(q, limit)
    return OccupationsOut(items=items, source=source)
