"""Grupos de la sección Social: temáticas y sugerencias personalizadas.

La pantalla de Sugerencias tiene tres apartados → docs/decisiones/ADR-008-sugerencias-grupos.md

1. **Sugerencias para ti**: grupos de las temáticas de tu perfil (tus estudios o el sector de tu empresa,
   los grupos en los que ya estás y las publicaciones de grupos a las que has dado "me gusta").
2. **Populares cerca de ti**: grupos de temáticas que interesan a cualquiera (deportes, pisos, quedadas,
   idiomas…), no de tus estudios, con gente de tu provincia. Ordenados por popularidad.
3. **Más sugerencias**: mezcla, una y una, de grupos relacionados con tu perfil y de temáticas nuevas para ti,
   para que también descubras otras cosas. Las temáticas nuevas cambian de orden cada día.

Con pocos grupos se calcula todo en Python. Con miles habría que precalcular la popularidad en una tabla.
"""
import math
import random
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Community,
    CommunityDismissal,
    CommunityMember,
    Company,
    Degree,
    Follow,
    Like,
    Post,
    School,
    StudentProfile,
    User,
)
from app.services.people import short_degree

# clave → (nombre, interesa a cualquiera)
TOPICS: dict[str, tuple[str, bool]] = {
    # De un ámbito concreto (estudios o trabajo)
    "programacion": ("Programación", False),
    "tecnologia": ("Tecnología e IA", False),
    "diseno": ("Diseño", False),
    "salud": ("Salud y medicina", False),
    "psicologia": ("Psicología", False),
    "derecho": ("Derecho", False),
    "empresa": ("Empresa y emprendimiento", False),
    "ciencia": ("Ciencia", False),
    # Interesan a cualquiera
    "quedadas": ("Quedadas y ocio", True),
    "deportes": ("Deportes", True),
    "musica": ("Música", True),
    "videojuegos": ("Videojuegos", True),
    "cine": ("Cine y series", True),
    "viajes": ("Viajes y Erasmus", True),
    "pisos": ("Pisos y compañeros", True),
    "idiomas": ("Idiomas", True),
    "estudio": ("Estudiar juntos", True),
    "empleo": ("Prácticas y empleo", True),
    "voluntariado": ("Voluntariado", True),
    "fotografia": ("Fotografía", True),
    "cocina": ("Cocina", True),
    "lectura": ("Lectura", True),
    "arte": ("Arte y dibujo", True),
}

# Palabras del nombre de los estudios → temáticas relacionadas
DEGREE_TOPICS: list[tuple[str, list[str]]] = [
    ("Informática", ["programacion", "tecnologia"]),
    ("Aplicaciones", ["programacion", "tecnologia"]),
    ("Sistemas", ["tecnologia", "programacion"]),
    ("Diseño", ["diseno", "arte", "fotografia"]),
    ("Medicina", ["salud", "ciencia"]),
    ("Psicología", ["psicologia", "salud"]),
    ("Derecho", ["derecho", "empresa"]),
    ("Empresas", ["empresa", "empleo"]),
]

# Sector de la empresa → temáticas relacionadas
SECTOR_TOPICS: dict[str, list[str]] = {
    "Tecnología": ["programacion", "tecnologia"],
    "Eventos": ["quedadas", "musica"],
    "Hostelería": ["cocina", "quedadas"],
    "Diseño": ["diseno", "arte"],
    "Salud": ["salud", "psicologia"],
}

# Cuántos grupos de cada apartado se ven en la pantalla de Sugerencias
SECTION_SIZE = 10


def topic_label(key: str | None) -> str | None:
    return TOPICS[key][0] if key in TOPICS else None


def is_universal(key: str | None) -> bool:
    return bool(key in TOPICS and TOPICS[key][1])


def degree_topics(degree_name: str | None) -> list[str]:
    if not degree_name:
        return []
    out: list[str] = []
    for word, topics in DEGREE_TOPICS:
        if word in degree_name:
            out += [t for t in topics if t not in out]
    return out


def degree_short_label(name: str) -> str:
    """Nombre corto para las etiquetas: los ciclos con sus siglas (DAW, DAM, ASIR, SMR), el resto sin "Grado en"."""
    short = short_degree(name)
    if name.startswith(("CFGS ", "CFGM ")):
        return "".join(w[0] for w in short.split() if w[0].isupper())
    return short


@dataclass
class Interests:
    topics: dict[str, float] = field(default_factory=dict)  # temática → afinidad
    own_topics: set[str] = field(default_factory=set)  # las de tus estudios o tu sector
    own_label: str | None = None  # "estudias DAW" / "trabajas en Tecnología"
    province: str | None = None
    joined: set[int] = field(default_factory=set)
    dismissed: set[int] = field(default_factory=set)
    following: set[int] = field(default_factory=set)

    def add(self, topic: str | None, weight: float, cap: float = 6.0):
        if topic in TOPICS:
            self.topics[topic] = min(self.topics.get(topic, 0.0) + weight, cap)


def user_province(db: Session, user_id: int) -> str | None:
    row = db.execute(
        select(School.province, StudentProfile.location, Company.location)
        .select_from(User)
        .outerjoin(StudentProfile, StudentProfile.user_id == User.id)
        .outerjoin(School, School.id == StudentProfile.school_id)
        .outerjoin(Company, Company.user_id == User.id)
        .where(User.id == user_id)
    ).first()
    if not row:
        return None
    return row[0] or row[1] or row[2]


def interests(db: Session, user: User) -> Interests:
    me = Interests(province=user_province(db, user.id))
    profile = db.get(StudentProfile, user.id)
    company = db.get(Company, user.id)
    if profile:
        degree = db.get(Degree, profile.degree_id) if profile.degree_id else None
        for t in degree_topics(degree.name if degree else None):
            me.add(t, 3.0)
            me.own_topics.add(t)
        if degree:
            me.own_label = f"Porque estudias {degree_short_label(degree.name)}"
        me.add("estudio", 1.0)  # todo estudiante
    elif company:
        for t in SECTOR_TOPICS.get(company.sector or "", ["empresa", "empleo"]):
            me.add(t, 3.0)
            me.own_topics.add(t)
        me.own_label = f"Por tu sector: {company.sector}" if company.sector else "Por tu empresa"

    # Grupos en los que ya estás
    for cid, topic in db.execute(
        select(Community.id, Community.topic)
        .join(CommunityMember, CommunityMember.community_id == Community.id)
        .where(CommunityMember.user_id == user.id)
    ).all():
        me.joined.add(cid)
        me.add(topic, 2.0)
    # Publicaciones de grupos a las que has dado "me gusta"
    for (topic,) in db.execute(
        select(Community.topic)
        .join(Post, Post.community_id == Community.id)
        .join(Like, Like.post_id == Post.id)
        .where(Like.user_id == user.id, Community.topic.is_not(None))
        .limit(200)
    ).all():
        me.add(topic, 0.5)

    me.dismissed = set(db.scalars(select(CommunityDismissal.community_id).where(CommunityDismissal.user_id == user.id)))
    me.following = set(db.scalars(select(Follow.followed_id).where(Follow.follower_id == user.id)))
    return me


@dataclass
class GroupInfo:
    group: Community
    members: int = 0
    posts_week: int = 0
    local_members: int = 0  # miembros de tu provincia
    friends: int = 0  # gente que sigues que está en el grupo

    @property
    def popularity(self) -> float:
        return self.members + 4 * self.posts_week


def group_stats(db: Session, groups: list[Community], me: Interests | None = None) -> dict[int, GroupInfo]:
    """Miembros, publicaciones de la última semana y (si hay usuario) miembros de su zona y gente que sigue."""
    info = {g.id: GroupInfo(group=g) for g in groups}
    if not info:
        return info
    ids = list(info)
    for cid, n in db.execute(
        select(CommunityMember.community_id, func.count()).where(CommunityMember.community_id.in_(ids)).group_by(CommunityMember.community_id)
    ).all():
        info[cid].members = n
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    for cid, n in db.execute(
        select(Post.community_id, func.count())
        .where(Post.community_id.in_(ids), Post.created_at >= week_ago)
        .group_by(Post.community_id)
    ).all():
        info[cid].posts_week = n
    if me is None:
        return info
    if me.province:
        zone = func.coalesce(School.province, StudentProfile.location, Company.location)
        for cid, n in db.execute(
            select(CommunityMember.community_id, func.count())
            .select_from(CommunityMember)
            .outerjoin(StudentProfile, StudentProfile.user_id == CommunityMember.user_id)
            .outerjoin(School, School.id == StudentProfile.school_id)
            .outerjoin(Company, Company.user_id == CommunityMember.user_id)
            .where(CommunityMember.community_id.in_(ids), zone == me.province)
            .group_by(CommunityMember.community_id)
        ).all():
            info[cid].local_members = n
    if me.following:
        for cid, n in db.execute(
            select(CommunityMember.community_id, func.count())
            .where(CommunityMember.community_id.in_(ids), CommunityMember.user_id.in_(me.following))
            .group_by(CommunityMember.community_id)
        ).all():
            info[cid].friends = n
    return info


@dataclass
class Suggestion:
    info: GroupInfo
    reason: str


@dataclass
class Suggestions:
    for_you: list[Suggestion]
    nearby: list[Suggestion]
    more: list[Suggestion]
    province: str | None


def _for_you_reason(me: Interests, g: GroupInfo) -> str:
    topic = g.group.topic
    if topic in me.own_topics and me.own_label:
        return me.own_label
    if g.friends:
        return f"{g.friends} {'persona que sigues está' if g.friends == 1 else 'personas que sigues están'} aquí"
    return f"Te interesa {topic_label(topic)}"


def suggestions(db: Session, user: User) -> Suggestions:
    me = interests(db, user)
    groups = list(db.scalars(select(Community).where(Community.type == "group")))
    stats = group_stats(db, groups, me)
    # Los grupos de otra provincia (quedadas, pisos, deportes de otra ciudad) no se sugieren; los online sí
    elsewhere = lambda g: bool(me.province and g.group.province and g.group.province != me.province)  # noqa: E731
    pool = [g for g in stats.values() if g.group.id not in me.joined and g.group.id not in me.dismissed and not elsewhere(g)]

    def affinity(g: GroupInfo) -> float:
        return me.topics.get(g.group.topic or "", 0.0)

    def personal_score(g: GroupInfo) -> float:
        local = 2.0 if me.province and g.group.province == me.province else 0.0
        return affinity(g) * (1 + math.log1p(g.popularity)) + local + 1.5 * g.friends

    # 1. Sugerencias para ti: temáticas de tu perfil
    for_you_all = sorted((g for g in pool if affinity(g) > 0), key=personal_score, reverse=True)
    # Se queda con el 60 % más afín (mínimo 4, máximo 10); el resto va a "Más sugerencias" como "relacionado"
    shown = min(SECTION_SIZE, max(4, math.ceil(len(for_you_all) * 0.6)))
    for_you = [Suggestion(g, _for_you_reason(me, g)) for g in for_you_all[:shown]]
    reserved = {s.info.group.id for s in for_you}

    # 2. Populares cerca de ti: temáticas para cualquiera, en tu provincia, de más a menos populares
    def is_near(g: GroupInfo) -> bool:
        return bool(me.province) and (g.group.province == me.province or g.local_members >= 3)

    universal = [g for g in pool if is_universal(g.group.topic) and g.group.id not in reserved]
    near = sorted((g for g in universal if is_near(g)), key=lambda g: (g.popularity + 2 * g.local_members), reverse=True)
    nearby = [
        Suggestion(g, f"{g.local_members} {'persona' if g.local_members == 1 else 'personas'} de {me.province}" if g.local_members else f"Popular en {me.province}")
        for g in near
    ]
    if len(nearby) < 4:  # sin zona o con pocos grupos cerca: los más populares de toda la app
        taken = {s.info.group.id for s in nearby}
        rest = sorted((g for g in universal if g.group.id not in taken), key=lambda g: g.popularity, reverse=True)
        nearby += [Suggestion(g, "Popular en Linkedu") for g in rest[: 6 - len(nearby)]]
    reserved |= {s.info.group.id for s in nearby[:SECTION_SIZE]}

    # 3. Más sugerencias: una relacionada con tu perfil y otra de algo nuevo, alternando
    rest = [g for g in pool if g.group.id not in reserved]
    related = sorted((g for g in rest if affinity(g) > 0), key=personal_score, reverse=True)
    new_by_topic: dict[str, list[GroupInfo]] = {}
    for g in sorted((g for g in rest if affinity(g) == 0), key=lambda g: g.popularity, reverse=True):
        new_by_topic.setdefault(g.group.topic or "", []).append(g)
    # El orden de las temáticas nuevas depende de su popularidad, con un poco de azar que cambia cada día
    rng = random.Random(f"{user.id}-{date.today().isoformat()}")
    topic_order = sorted(new_by_topic, key=lambda t: new_by_topic[t][0].popularity * rng.uniform(0.5, 1.5), reverse=True)
    discovery: list[GroupInfo] = []
    while any(new_by_topic[t] for t in topic_order):  # una de cada temática por vuelta, para que haya variedad
        for t in topic_order:
            if new_by_topic[t]:
                discovery.append(new_by_topic[t].pop(0))
    more: list[Suggestion] = []
    for i in range(max(len(related), len(discovery))):
        if i < len(related):
            more.append(Suggestion(related[i], f"Relacionado con {topic_label(related[i].group.topic)}"))
        if i < len(discovery):
            more.append(Suggestion(discovery[i], f"Algo nuevo: {topic_label(discovery[i].group.topic)}"))

    return Suggestions(for_you=for_you, nearby=nearby, more=more, province=me.province)
