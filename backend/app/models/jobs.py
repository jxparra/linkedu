from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.mixins import Timestamps


class Job(Timestamps, Base):
    """Oferta de trabajo puntual, prácticas o empleo publicada por una empresa."""

    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.user_id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(20))  # puntual | practicas | temporal | indefinido | freelance
    category: Mapped[str | None] = mapped_column(String(60))
    schedule: Mapped[str | None] = mapped_column(String(20))  # completa | parcial | flexible | fines_semana
    modality: Mapped[str | None] = mapped_column(String(20))  # presencial | hibrido | remoto
    pay: Mapped[float | None] = mapped_column(Numeric(10, 2))
    pay_period: Mapped[str | None] = mapped_column(String(10))  # hora | mes | total
    location: Mapped[str | None] = mapped_column(String(120))  # ciudad
    province: Mapped[str | None] = mapped_column(String(60), index=True)  # provincia o "Extranjero"
    remote: Mapped[bool] = mapped_column(Boolean, default=False)
    vacancies: Mapped[int | None] = mapped_column(default=1)
    degree_id: Mapped[int | None] = mapped_column(ForeignKey("degrees.id", ondelete="SET NULL"))  # estudios recomendados
    deadline: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="abierta")  # abierta | cerrada


class JobApplication(Timestamps, Base):
    __tablename__ = "job_applications"
    __table_args__ = (UniqueConstraint("job_id", "student_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    message: Mapped[str | None] = mapped_column(Text)
    # enviada (inscrito) | vista (CV leído) | en_proceso | aceptada (seleccionado) | rechazada (descartado)
    status: Mapped[str] = mapped_column(String(20), default="enviada")
