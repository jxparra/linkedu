import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, select

from app.config import settings
from app.deps import DB, CurrentUser
from app.models import EmailVerification, User
from app.schemas.auth import LoginIn, MessageOut, RegisterIn, TokenOut, VerifyIn
from app.schemas.users import UserOut
from app.security import (
    create_access_token,
    generate_verification_code,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
log = logging.getLogger("studyhub")
MAX_ATTEMPTS = 5


def _is_expired(record: EmailVerification) -> bool:
    expires_at = record.expires_at
    if expires_at.tzinfo is None:  # SQLite no guarda la zona horaria
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at < datetime.now(timezone.utc)


def _send_code(db: DB, user: User) -> str:
    db.execute(delete(EmailVerification).where(EmailVerification.user_id == user.id))
    code = generate_verification_code()
    db.add(
        EmailVerification(
            user_id=user.id,
            code_hash=hash_password(code),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        )
    )
    db.commit()
    # TODO: enviar por email real (SMTP / Resend). De momento se muestra en consola.
    log.warning("Código de verificación para %s: %s", user.email, code)
    return code


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: DB):
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Ya hay una cuenta con este email. Inicia sesión o recupera tu contraseña.",
        )
    user = User(email=email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    code = _send_code(db, user)
    return TokenOut(access_token=create_access_token(user.id), dev_code=code if settings.debug else None)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: DB):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email o contraseña incorrectos.")
    return TokenOut(access_token=create_access_token(user.id))


@router.post("/verify", response_model=UserOut)
def verify_email(data: VerifyIn, user: CurrentUser, db: DB):
    if user.email_verified:
        return user
    record = db.scalar(select(EmailVerification).where(EmailVerification.user_id == user.id))
    if not record or _is_expired(record) or record.attempts >= MAX_ATTEMPTS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El código ha caducado. Pide uno nuevo.")
    if not verify_password(data.code, record.code_hash):
        record.attempts += 1
        db.commit()
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Código incorrecto. Revisa el email que te enviamos o pide uno nuevo.",
        )
    user.email_verified = True
    db.delete(record)
    db.commit()
    return user


@router.post("/resend", response_model=MessageOut)
def resend_code(user: CurrentUser, db: DB):
    if user.email_verified:
        return MessageOut(message="Tu email ya está verificado.")
    code = _send_code(db, user)
    return MessageOut(message="Te hemos enviado un código nuevo.", dev_code=code if settings.debug else None)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user
