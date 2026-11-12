from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AuthorOut(BaseModel):
    id: int
    name: str
    username: str | None
    avatar_url: str | None
    role: str | None
    headline: str | None  # "Ingeniería Informática, UGR, Granada"
    badge: str | None  # "2º", "Máster", "Empresa"


class CommunityRef(BaseModel):
    id: int
    name: str
    is_group: bool = False
    # Para la cabecera de las publicaciones de grupos y foros (portada + «Unirme»)
    type: str | None = None  # group | degree | school | general
    topic: str | None = None
    cover_url: str | None = None
    is_member: bool = False


class UserRef(BaseModel):
    id: int
    name: str


class MediaItem(BaseModel):
    url: str = Field(max_length=500)
    type: Literal["image", "video", "gif"]


class PostOut(BaseModel):
    id: int
    type: str
    content: str
    image_url: str | None
    media_type: str | None
    media: list[MediaItem]
    feeling: str | None
    location: str | None
    tagged: list[UserRef]
    created_at: datetime
    edited: bool
    author: AuthorOut
    community: CommunityRef | None
    likes: int
    comments: int
    shares: int
    liked_by_me: bool
    shared_by_me: bool
    saved_by_me: bool = False
    following_author: bool
    is_mine: bool


class PostIn(BaseModel):
    content: str = Field(default="", max_length=3000)
    type: Literal["general", "pregunta", "recurso", "debate"] = "general"
    community_id: int | None = None
    image_url: str | None = Field(default=None, max_length=500)
    media_type: Literal["image", "video", "gif"] | None = None
    media: list[MediaItem] = Field(default_factory=list, max_length=10)
    feeling: str | None = Field(default=None, max_length=60)
    location: str | None = Field(default=None, max_length=150)
    tagged_user_ids: list[int] = Field(default_factory=list, max_length=20)


class LikeOut(BaseModel):
    liked: bool
    likes: int


class ShareOut(BaseModel):
    shared: bool
    shares: int


class SaveOut(BaseModel):
    saved: bool


class FollowOut(BaseModel):
    following: bool


class TrendOut(BaseModel):
    id: int
    name: str
    posts: int
    members: int
    last_activity: datetime | None


class CommentOut(BaseModel):
    id: int
    post_id: int
    parent_id: int | None
    author: AuthorOut
    content: str
    image_url: str | None
    created_at: datetime
    likes: int
    liked_by_me: bool
    replies: int
    is_mine: bool
    can_delete: bool
    by_post_author: bool


class CommentIn(BaseModel):
    content: str = Field(default="", max_length=2000)
    parent_id: int | None = None
    image_url: str | None = Field(default=None, max_length=500)


class CommentLikeOut(BaseModel):
    liked: bool
    likes: int


class ReportIn(BaseModel):
    target_type: Literal["post", "comment", "user"]
    target_id: int
    reason: str = Field(default="Contenido inapropiado", max_length=300)
