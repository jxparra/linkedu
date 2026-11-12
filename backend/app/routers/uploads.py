import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.config import settings
from app.deps import VerifiedUser

router = APIRouter(tags=["archivos"])

ALLOWED = {
    "image/jpeg": ("image", ".jpg"),
    "image/png": ("image", ".png"),
    "image/webp": ("image", ".webp"),
    "image/gif": ("gif", ".gif"),
    "video/mp4": ("video", ".mp4"),
    "video/webm": ("video", ".webm"),
    "video/quicktime": ("video", ".mov"),
}


class UploadOut(BaseModel):
    url: str
    media_type: str


@router.post("/uploads", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload(file: UploadFile, user: VerifiedUser):
    content_type = (file.content_type or "").split(";")[0]
    if content_type not in ALLOWED:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Formato no admitido. Usa JPG, PNG, WebP, GIF, MP4 o WebM.")
    kind, ext = ALLOWED[content_type]
    data = await file.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"El archivo pesa más de {settings.max_upload_mb} MB.")
    name = f"{uuid.uuid4().hex}{ext}"
    Path(settings.upload_path, name).write_bytes(data)
    return UploadOut(url=f"/uploads/{name}", media_type=kind)
