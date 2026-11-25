from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import DB, VerifiedUser
from app.models import Community, CommunityMember, Company, Degree, Message, School, StudentProfile, User, UserRole
from app.services.people import notify
from app.schemas.users import (
    AccountTypeIn,
    CompanyIn,
    JoinCommunitiesIn,
    StudentIdentityIn,
    StudentStudiesIn,
    UserOut,
)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


def _require_role(user: User, *roles: UserRole):
    if user.role not in roles:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta acción no está disponible para tu tipo de cuenta.")


@router.post("/account-type", response_model=UserOut)
def set_account_type(data: AccountTypeIn, user: VerifiedUser, db: DB):
    if user.role and user.onboarding_done:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tu tipo de cuenta ya está definido.")
    user.role = UserRole(data.role)
    db.commit()
    return user


@router.put("/student/identity", response_model=UserOut)
def student_identity(data: StudentIdentityIn, user: VerifiedUser, db: DB):
    _require_role(user, UserRole.student, UserRole.teacher)
    taken = db.scalar(select(User).where(User.username == data.username, User.id != user.id))
    if taken:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ese nombre de usuario ya está cogido. Prueba con otro.")
    user.username = data.username
    profile = user.student_profile or StudentProfile(user_id=user.id, name=data.name, surname=data.surname)
    profile.name, profile.surname, profile.location = data.name, data.surname, data.location
    if user.role == UserRole.teacher and data.teaches is not None:
        profile.teaches = data.teaches.strip() or None
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


@router.put("/student/studies", response_model=UserOut)
def student_studies(data: StudentStudiesIn, user: VerifiedUser, db: DB):
    _require_role(user, UserRole.student, UserRole.teacher)
    if not user.student_profile:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Completa primero tu nombre y usuario.")
    teacher = user.role == UserRole.teacher
    if not teacher and not data.is_over_16:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Debes tener 16 años o más para usar Linkedu.")
    if not db.get(School, data.school_id) or not db.get(Degree, data.degree_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos ese centro o esos estudios.")
    p = user.student_profile
    # Un docente es mayor de edad y no tiene curso
    p.school_id, p.degree_id, p.course, p.is_over_16 = data.school_id, data.degree_id, None if teacher else data.course, True
    if teacher:
        p.teaches = (data.teaches or "").strip() or None
    db.commit()
    db.refresh(user)
    return user


@router.put("/company", response_model=UserOut)
def company_profile(data: CompanyIn, user: VerifiedUser, db: DB):
    _require_role(user, UserRole.company)
    company = user.company or Company(user_id=user.id, name=data.name)
    company.name = data.name
    company.sector, company.location, company.contact_name = data.sector, data.location, data.contact_name
    company.website = str(data.website) if data.website else None
    db.add(company)
    db.commit()
    db.refresh(user)
    return user


@router.post("/communities", response_model=UserOut)
def join_communities(data: JoinCommunitiesIn, user: VerifiedUser, db: DB):
    _require_role(user, UserRole.student, UserRole.teacher)
    existing = set(db.scalars(select(CommunityMember.community_id).where(CommunityMember.user_id == user.id)))
    valid = set(db.scalars(select(Community.id).where(Community.id.in_(data.community_ids))))
    for cid in valid - existing:
        db.add(CommunityMember(community_id=cid, user_id=user.id))
    db.commit()
    return user


@router.post("/finish", response_model=UserOut)
def finish(user: VerifiedUser, db: DB):
    if user.role == UserRole.student and not (user.student_profile and user.student_profile.school_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Te falta indicar dónde estudias.")
    if user.role == UserRole.teacher and not (user.student_profile and user.student_profile.school_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Te falta indicar dónde das clase.")
    if user.role == UserRole.company and not user.company:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Te faltan los datos de la empresa.")
    if user.role is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Elige primero tu tipo de cuenta.")
    if not user.onboarding_done:
        notify(db, user.id, "welcome")
        team = db.scalar(select(User).where(User.username == "studyhub", User.id != user.id))
        if team:
            db.add(Message(
                sender_id=team.id,
                recipient_id=user.id,
                content="¡Hola! Bienvenido a Linkedu 👋 Si tienes cualquier duda o sugerencia, escríbenos por aquí.",
            ))
    user.onboarding_done = True
    db.commit()
    return user
