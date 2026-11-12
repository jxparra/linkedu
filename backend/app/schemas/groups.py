from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas.posts import AuthorOut


class TopicOut(BaseModel):
    key: str
    label: str
    universal: bool  # interesa a cualquiera (no es de un ámbito de estudios concreto)


class GroupCard(BaseModel):
    """Tarjeta de grupo (sugerencias, búsqueda)."""

    id: int
    name: str
    description: str | None
    topic: str | None
    topic_label: str | None
    privacy: str
    cover_url: str | None
    province: str | None
    members: int
    posts_week: int
    reason: str | None = None  # "Porque estudias DAW", "12 personas de Granada", "Algo nuevo: Música"
    is_member: bool = False


class SuggestionsOut(BaseModel):
    province: str | None
    for_you: list[GroupCard]
    nearby: list[GroupCard]
    more: list[GroupCard]


class MyGroup(BaseModel):
    id: int
    name: str
    topic: str | None
    privacy: str
    cover_url: str | None
    members: int
    role: str
    joined_at: datetime | None
    last_activity: datetime | None


class GroupOut(BaseModel):
    id: int
    name: str
    description: str | None
    type: str
    topic: str | None
    topic_label: str | None
    privacy: str
    cover_url: str | None
    province: str | None
    created_at: datetime | None
    members: int
    posts_week: int
    is_member: bool
    role: str | None  # admin | member | None
    admins: list[AuthorOut]
    member_preview: list[AuthorOut]
    following_in_group: list[AuthorOut]  # gente que sigues que está en el grupo
    can_see_content: bool


class MemberOut(BaseModel):
    user: AuthorOut
    role: str
    joined_at: datetime | None


class GroupIn(BaseModel):
    name: str = Field(min_length=3, max_length=80)
    privacy: Literal["public", "private"]
    topic: str = Field(max_length=40)
    description: str | None = Field(default=None, max_length=1000)
    province: str | None = Field(default=None, max_length=100)
    cover_url: str | None = Field(default=None, max_length=500)
    invite_ids: list[int] = Field(default_factory=list, max_length=50)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 3:
            raise ValueError("El nombre del grupo debe tener al menos 3 caracteres.")
        return v

    @field_validator("description", "province", "cover_url")
    @classmethod
    def empty_to_none(cls, v: str | None) -> str | None:
        return v.strip() or None if v else None


class InviteIn(BaseModel):
    user_ids: list[int] = Field(min_length=1, max_length=50)


class JoinOut(BaseModel):
    is_member: bool
    members: int
