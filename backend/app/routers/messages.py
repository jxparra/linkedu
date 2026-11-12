from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select, update

from app.deps import DB, VerifiedUser
from app.models import Message, User
from app.schemas.posts import AuthorOut
from app.services.people import authors

router = APIRouter(prefix="/messages", tags=["mensajes"])


class ConversationOut(BaseModel):
    user: AuthorOut
    last_message: str
    last_from_me: bool
    last_at: datetime
    unread: int


class MessageOut(BaseModel):
    id: int
    content: str
    from_me: bool
    created_at: datetime


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CountOut(BaseModel):
    unread: int


@router.get("/unread-count", response_model=CountOut)
def unread_count(user: VerifiedUser, db: DB):
    n = db.scalar(select(func.count()).select_from(Message).where(Message.recipient_id == user.id, Message.read_at.is_(None)))
    return CountOut(unread=n or 0)


@router.get("/conversations", response_model=list[ConversationOut])
def conversations(user: VerifiedUser, db: DB):
    msgs = db.scalars(
        select(Message)
        .where(or_(Message.sender_id == user.id, Message.recipient_id == user.id))
        .order_by(Message.created_at.desc(), Message.id.desc())
    ).all()
    latest: dict[int, Message] = {}
    unread: dict[int, int] = {}
    for m in msgs:
        other = m.recipient_id if m.sender_id == user.id else m.sender_id
        latest.setdefault(other, m)
        if m.recipient_id == user.id and m.read_at is None:
            unread[other] = unread.get(other, 0) + 1
    people = authors(db, set(latest))
    return [
        ConversationOut(
            user=people[o],
            last_message=m.content,
            last_from_me=m.sender_id == user.id,
            last_at=m.created_at,
            unread=unread.get(o, 0),
        )
        for o, m in latest.items()
        if o in people
    ]


@router.get("/with/{other_id}", response_model=list[MessageOut])
def thread(other_id: int, user: VerifiedUser, db: DB):
    pair = or_(
        and_(Message.sender_id == user.id, Message.recipient_id == other_id),
        and_(Message.sender_id == other_id, Message.recipient_id == user.id),
    )
    msgs = db.scalars(select(Message).where(pair).order_by(Message.created_at, Message.id)).all()
    db.execute(
        update(Message)
        .where(Message.sender_id == other_id, Message.recipient_id == user.id, Message.read_at.is_(None))
        .values(read_at=datetime.now(timezone.utc))
    )
    db.commit()
    return [MessageOut(id=m.id, content=m.content, from_me=m.sender_id == user.id, created_at=m.created_at) for m in msgs]


@router.post("/with/{other_id}", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send(other_id: int, data: MessageIn, user: VerifiedUser, db: DB):
    if other_id == user.id or not db.get(User, other_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos a ese usuario.")
    m = Message(sender_id=user.id, recipient_id=other_id, content=data.content.strip())
    db.add(m)
    db.commit()
    db.refresh(m)
    return MessageOut(id=m.id, content=m.content, from_me=True, created_at=m.created_at)
