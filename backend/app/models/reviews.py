from sqlalchemy import CheckConstraint, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.mixins import Timestamps


class Review(Timestamps, Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "target_type", "target_id"),
        CheckConstraint("rating_general BETWEEN 1 AND 5"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    target_type: Mapped[str] = mapped_column(String(20))  # school | degree | subject
    target_id: Mapped[int]
    rating_general: Mapped[int]
    rating_dificultad: Mapped[int | None]
    rating_utilidad: Mapped[int | None]
    comment: Mapped[str | None] = mapped_column(Text)
