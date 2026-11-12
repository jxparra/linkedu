"""Sugerencias de puestos de trabajo para el buscador de Empleo.

Los nombres de puestos salen de ESCO, la clasificación europea de ocupaciones de la Comisión Europea
(https://esco.ec.europa.eu). Es gratuita, no necesita clave y tiene unas 3.000 ocupaciones en español con
muchísimas variantes ("camarero de barra", "camarero de pisos", "sumiller"...). Es la que usa, por ejemplo,
el buscador de Monster España.

Si no hay internet o ESCO no responde, se usa la lista local de abajo para que el buscador siga funcionando.
Las respuestas se guardan en memoria para no repetir la misma consulta.
"""
import logging
import re
import time
import unicodedata

import httpx

log = logging.getLogger("studyhub")

ESCO_SEARCH = "https://ec.europa.eu/esco/api/search"
TIMEOUT = 3.0
CACHE_SECONDS = 24 * 3600
_cache: dict[str, tuple[float, list[str]]] = {}

# Lista de reserva (sin internet): puestos habituales para estudiantes y recién titulados
LOCAL_OCCUPATIONS = [
    "Administrativo/a", "Agente de atención al cliente", "Agente inmobiliario/a", "Analista de datos", "Analista financiero/a",
    "Animador/a sociocultural", "Arquitecto/a", "Asesor/a comercial", "Asistente de dirección", "Au pair",
    "Auxiliar administrativo/a", "Auxiliar de clínica dental", "Auxiliar de enfermería", "Auxiliar de farmacia",
    "Auxiliar de geriatría", "Auxiliar de laboratorio", "Ayudante de cocina", "Azafato/a de congresos", "Azafato/a de eventos",
    "Barista", "Bibliotecario/a", "Camarero/a", "Camarero/a de pisos", "Canguro", "Cajero/a", "Carpintero/a",
    "Carretillero/a", "Cocinero/a", "Comercial", "Community manager", "Conductor/a de reparto", "Contable",
    "Coordinador/a de eventos", "Creador/a de contenido", "Delineante", "Dependiente/a", "Desarrollador/a backend",
    "Desarrollador/a frontend", "Desarrollador/a web", "Desarrollador/a de aplicaciones móviles", "Diseñador/a gráfico",
    "Diseñador/a UX/UI", "Educador/a infantil", "Electricista", "Encuestador/a", "Enfermero/a", "Entrenador/a personal",
    "Fisioterapeuta", "Fotógrafo/a", "Fontanero/a", "Gestor/a de redes sociales", "Guía turístico/a", "Higienista dental",
    "Ilustrador/a", "Informático/a", "Ingeniero/a civil", "Ingeniero/a de software", "Ingeniero/a industrial",
    "Instalador/a de placas solares", "Jardinero/a", "Limpiador/a", "Logopeda", "Maestro/a de primaria", "Maquetador/a web",
    "Mecánico/a", "Monitor/a de campamento", "Monitor/a de comedor", "Monitor/a de ocio y tiempo libre", "Monitor/a deportivo",
    "Mozo/a de almacén", "Niñero/a", "Operario/a de producción", "Paralegal", "Peluquero/a", "Periodista", "Pintor/a",
    "Preparador/a de pedidos", "Profesor/a de idiomas", "Profesor/a de inglés", "Profesor/a de matemáticas",
    "Profesor/a particular", "Programador/a", "Promotor/a de ventas", "Psicólogo/a", "Recepcionista",
    "Recepcionista de hotel", "Redactor/a", "Repartidor/a", "Reponedor/a", "Secretario/a", "Socorrista",
    "Soporte técnico informático", "Técnico/a de laboratorio", "Técnico/a de marketing", "Técnico/a de recursos humanos",
    "Técnico/a de selección", "Técnico/a de sistemas", "Teleoperador/a", "Traductor/a", "Veterinario/a", "Visual merchandiser",
]


def _norm(s: str) -> str:
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower().strip()


def _local(q: str, limit: int) -> list[str]:
    nq = _norm(q)
    starts = [o for o in LOCAL_OCCUPATIONS if _norm(o).startswith(nq)]
    contains = [o for o in LOCAL_OCCUPATIONS if nq in _norm(o) and o not in starts]
    return (starts + contains)[:limit]


def _compact(masc: str, fem: str) -> str | None:
    """"camarero de pisos" + "camarera de pisos" → "camarero/a de pisos" (como lo escribe InfoJobs)."""
    a, b = masc.split(), fem.split()
    if len(a) != len(b):
        return None
    words = []
    for x, y in zip(a, b):
        if x == y:
            words.append(x)
        elif x.endswith("o") and y == x[:-1] + "a":
            words.append(x + "/a")
        elif y == x + "a":
            words.append(x + "/a")
        elif x.endswith("e") and y == x[:-1] + "a":  # jefe/jefa
            words.append(x[:-1] + "e/a")
        else:
            return None
    return " ".join(words)


def _tidy(label: str) -> str:
    """ESCO escribe los puestos en minúscula y con las dos formas ("camarero/camarera"):
    se juntan en una ("Camarero/a") y se pone la primera letra en mayúscula."""
    label = label.strip()
    parts = [p.strip() for p in label.split("/")]
    if len(parts) == 2 and " " not in parts[1][:1]:
        label = _compact(parts[0], parts[1]) or label
    return label[:1].upper() + label[1:]


def _key(label: str) -> str:
    """Clave para no repetir el mismo puesto escrito de dos formas."""
    return _norm(re.sub(r"(\w)/as?\b", r"\1", label).split("/")[0])


async def _esco(q: str, limit: int) -> list[str]:
    params = {"text": q, "language": "es", "type": "occupation", "limit": limit, "full": "false"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        res = await client.get(ESCO_SEARCH, params=params, headers={"Accept": "application/json"})
        res.raise_for_status()
        results = res.json().get("_embedded", {}).get("results", [])
    titles = []
    for r in results:
        label = (r.get("preferredLabel") or {}).get("es") or r.get("title")
        if label:
            titles.append(_tidy(label))
    return titles


async def suggest(q: str, limit: int = 8) -> tuple[list[str], str]:
    """Devuelve (puestos, fuente). La fuente es "esco" o "local"."""
    q = q.strip()
    if len(q) < 2:
        return [], "local"
    key = f"{_norm(q)}:{limit}"
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < CACHE_SECONDS:
        return hit[1], "esco"
    try:
        esco = await _esco(q, limit)
    except (httpx.HTTPError, ValueError) as e:
        log.warning("ESCO no disponible (%s); uso la lista local de puestos", e)
        return _local(q, limit), "local"
    # Primero los de ESCO; si salen pocos, se completan con los locales sin repetir
    merged: list[str] = []
    seen: set[str] = set()
    for t in esco + _local(q, limit):
        if _key(t) not in seen:
            seen.add(_key(t))
            merged.append(t)
    merged = merged[:limit]
    _cache[key] = (time.time(), merged)
    return merged, "esco"
