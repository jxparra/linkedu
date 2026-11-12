"""Migración mínima para el MVP.

`create_all` crea tablas nuevas pero no añade columnas a tablas que ya existen.
Esto añade las columnas que falten (siempre como NULL) para no tener que borrar
la base de datos cada vez que cambia un modelo. Más adelante: Alembic.
"""
import logging

from sqlalchemy import inspect, text

from app.database import Base, engine

log = logging.getLogger("studyhub")


def ensure_schema():
    Base.metadata.create_all(engine)
    insp = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            existing = {c["name"] for c in insp.get_columns(table.name)}
            for col in table.columns:
                if col.name in existing:
                    continue
                col_type = col.type.compile(dialect=engine.dialect)
                conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN "{col.name}" {col_type}'))
                log.warning("Columna añadida: %s.%s", table.name, col.name)
