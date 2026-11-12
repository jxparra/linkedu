"""Registro de los datos que se ven en Estadísticas (como el panel de LinkedIn).

- Visualizaciones del perfil: cuando otra persona abre tu perfil.
- Apariciones en búsquedas: cuando sales en los resultados del buscador de otra persona.
- Impresiones de publicaciones: cuando una publicación tuya aparece en el inicio de otra persona.

Cada persona cuenta una sola vez al día por cada cosa, para que recargar la página no infle los números.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import StatEvent


def _today_start() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def record(db: Session, kind: str, owner_ids: list[int], actor_id: int, post_ids: list[int | None] | None = None) -> None:
    """Apunta un evento por cada dueño (o por cada publicación). No hace commit."""
    pairs = list(zip(owner_ids, post_ids or [None] * len(owner_ids)))
    pairs = [(o, p) for o, p in pairs if o != actor_id]  # lo tuyo no cuenta
    if not pairs:
        return
    seen = set(
        db.execute(
            select(StatEvent.owner_id, StatEvent.post_id).where(
                StatEvent.kind == kind,
                StatEvent.actor_id == actor_id,
                StatEvent.owner_id.in_({o for o, _ in pairs}),
                StatEvent.created_at >= _today_start(),
            )
        ).all()
    )
    for owner, post in dict.fromkeys(pairs):
        if (owner, post) not in seen:
            db.add(StatEvent(owner_id=owner, kind=kind, actor_id=actor_id, post_id=post))


def periods(days: int) -> tuple[datetime, datetime, datetime]:
    """(inicio del periodo anterior, inicio del periodo actual, ahora)."""
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    return start - timedelta(days=days), start, now


def change_pct(current: int, previous: int) -> float | None:
    """Variación en %. None si antes era 0 y ahora no (no se puede calcular)."""
    if previous == 0:
        return 0.0 if current == 0 else None
    return round((current - previous) / previous * 100, 1)
