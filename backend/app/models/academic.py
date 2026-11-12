from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class School(Base):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    type: Mapped[str] = mapped_column(String(30))  # universidad | fp | instituto
    city: Mapped[str | None] = mapped_column(String(100))
    province: Mapped[str | None] = mapped_column(String(100))


class Degree(Base):
    __tablename__ = "degrees"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    level: Mapped[str] = mapped_column(String(30))  # fp_medio | fp_superior | grado | master


class SchoolDegree(Base):
    __tablename__ = "school_degrees"

    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id", ondelete="CASCADE"), primary_key=True)
    degree_id: Mapped[int] = mapped_column(ForeignKey("degrees.id", ondelete="CASCADE"), primary_key=True)


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    degree_id: Mapped[int] = mapped_column(ForeignKey("degrees.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    course: Mapped[int | None]
