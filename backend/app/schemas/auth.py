import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v) or not re.search(r"\d", v):
            raise ValueError("Usa al menos 8 caracteres, con una mayúscula y un número.")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class VerifyIn(BaseModel):
    code: str = Field(pattern=r"^\d{6}$")


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    dev_code: str | None = None  # solo en DEBUG, para probar sin servidor de email


class MessageOut(BaseModel):
    message: str
    dev_code: str | None = None
