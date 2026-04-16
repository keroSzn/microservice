import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.media import ensure_dir, safe_filename
from app.db import get_db
from app.deps import get_current_admin
from app.models import AdminUser, Product, Video


router = APIRouter()


def _allowed_mimes() -> set[str]:
    return {m.strip() for m in settings.allowed_video_mime_types.split(",") if m.strip()}


@router.post("/{product_id}/videos", status_code=status.HTTP_201_CREATED)
async def upload_video(
    product_id: int,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if file.content_type not in _allowed_mimes():
        raise HTTPException(status_code=415, detail="Unsupported video type")

    base_dir = os.path.join(settings.media_dir, "videos", safe_filename(product.slug))
    ensure_dir(base_dir)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in {".mp4", ".webm"}:
        ext = ".mp4" if file.content_type == "video/mp4" else ".webm"

    stored_name = f"{uuid.uuid4().hex}{ext}"
    abs_path = os.path.join(base_dir, stored_name)
    rel_path = os.path.relpath(abs_path, settings.media_dir)

    max_bytes = settings.max_upload_mb * 1024 * 1024
    written = 0

    try:
        async with aiofiles.open(abs_path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(status_code=413, detail="File too large")
                await out.write(chunk)
    except HTTPException:
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
            except OSError:
                pass
        raise

    video = Video(
        product_id=product.id,
        title=title.strip(),
        file_path=rel_path.replace("\\", "/"),
        mime_type=file.content_type or "video/mp4",
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return {"id": video.id}


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Video).where(Video.id == video_id))
    video = res.scalar_one_or_none()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    file_path = video.file_path
    abs_path = file_path if os.path.isabs(file_path) else os.path.join(settings.media_dir, file_path)

    db.delete(video)
    db.commit()

    if os.path.exists(abs_path):
        try:
            os.remove(abs_path)
        except OSError:
            pass
    return None

