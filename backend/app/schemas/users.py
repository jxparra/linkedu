from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class StudentProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    surname: str
    bio: str | None
    avatar_url: str | None
    location: str | None
    school_id: int | None
    degree_id: int | None
    course: int | None


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    sector: str | None
    location: str | None
    logo_url: str | None
    website: str | None
    contact_name: str | None
    verified: bool


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    username: str | None
    role: str | None
    email_verified: bool
    onboarding_done: bool
    student_profile: StudentProfileOut | None = None
    company: CompanyOut | None = None


class AccountTypeIn(BaseModel):
    role: Literal["student", "company"]


class StudentIdentityIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    surname: str = Field(min_length=1, max_length=120)
    username: str = Field(pattern=r"^[a-z0-9_.]{3,30}$")
    location: str | None = Field(default=None, max_length=120)


class StudentStudiesIn(BaseModel):
    school_id: int
    degree_id: int
    course: int | None = Field(default=None, ge=1, le=6)
    is_over_16: bool


class CompanyIn(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    sector: str | None = Field(default=None, max_length=80)
    location: str | None = Field(default=None, max_length=120)
    website: HttpUrl | None = None
    contact_name: str | None = Field(default=None, max_length=150)


class JoinCommunitiesIn(BaseModel):
    community_ids: list[int]
