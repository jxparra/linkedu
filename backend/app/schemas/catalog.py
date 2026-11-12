from pydantic import BaseModel, ConfigDict


class SchoolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    type: str
    city: str | None
    province: str | None


class DegreeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    level: str


class CommunityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str | None
    type: str
    members: int = 0


class OccupationsOut(BaseModel):
    items: list[str]
    source: str  # "esco" (Comisión Europea) o "local"
