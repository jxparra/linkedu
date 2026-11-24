from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.posts import AuthorOut

JobType = Literal["puntual", "practicas", "temporal", "indefinido", "freelance"]
Schedule = Literal["completa", "parcial", "flexible", "fines_semana"]
Modality = Literal["presencial", "hibrido", "remoto"]
PayPeriod = Literal["hora", "mes", "total"]
ApplicationStatus = Literal["enviada", "vista", "en_proceso", "aceptada", "rechazada"]


class CompanyRef(BaseModel):
    id: int
    name: str
    logo_url: str | None
    verified: bool
    sector: str | None = None
    location: str | None = None
    website: str | None = None


class DegreeRef(BaseModel):
    id: int
    name: str


class JobCardOut(BaseModel):
    """Lo que se ve de una oferta en la lista de resultados."""

    id: int
    title: str
    company: CompanyRef
    type: str
    category: str | None
    schedule: str | None
    modality: str | None
    location: str | None
    province: str | None
    pay: float | None
    pay_period: str | None
    deadline: date | None
    status: str
    created_at: datetime
    applicants: int
    my_status: str | None  # estado de mi candidatura, si me he inscrito
    matches_studies: bool  # recomendada para los estudios del estudiante
    summary: str | None = None  # resumen de la descripción para la tarjeta de la lista (~150 caracteres)


class JobOut(JobCardOut):
    description: str
    requirements: str | None
    vacancies: int
    degree: DegreeRef | None
    is_mine: bool
    my_message: str | None
    applied_at: datetime | None


class JobListOut(BaseModel):
    items: list[JobCardOut]
    total: int
    page: int
    pages: int
    facets: dict[str, dict[str, int]]  # cuántas ofertas hay de cada opción de los filtros


class JobIn(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=20, max_length=5000)
    requirements: str | None = Field(default=None, max_length=3000)
    type: JobType
    category: str = Field(max_length=60)
    schedule: Schedule
    modality: Modality
    location: str | None = Field(default=None, max_length=120)
    province: str = Field(min_length=2, max_length=60)
    pay: float | None = Field(default=None, ge=0, le=1_000_000)
    pay_period: PayPeriod | None = None
    vacancies: int = Field(default=1, ge=1, le=100)
    degree_id: int | None = None
    deadline: date | None = None


class StatusIn(BaseModel):
    status: Literal["abierta", "cerrada"]


class ApplyIn(BaseModel):
    message: str | None = Field(default=None, max_length=2000)


class ApplicationOut(BaseModel):
    """Candidatura vista por la empresa."""

    id: int
    student: AuthorOut
    message: str | None
    status: str
    created_at: datetime


class ApplicationStatusIn(BaseModel):
    status: ApplicationStatus


class MyApplicationOut(BaseModel):
    """Candidatura vista por el estudiante."""

    id: int
    job: JobCardOut
    status: str
    created_at: datetime
    updated_at: datetime
