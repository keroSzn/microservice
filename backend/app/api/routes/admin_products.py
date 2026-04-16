import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.media import ensure_dir
from app.db import get_db
from app.deps import get_current_admin
from app.models import AdminUser, Product
from app.schemas import ProductCreate, ProductOut, ProductUpdate


router = APIRouter()


def _allowed_image_mimes() -> set[str]:
    return {m.strip() for m in settings.allowed_image_mime_types.split(",") if m.strip()}


@router.get("", response_model=list[ProductOut])
def admin_list_products(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).order_by(Product.created_at.desc()))
    return list(res.scalars().all())


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def admin_get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(product, k, v)

    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/image", response_model=ProductOut)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if file.content_type not in _allowed_image_mimes():
        raise HTTPException(status_code=415, detail="Unsupported image type")

    base_dir = os.path.join(settings.media_dir, "images")
    ensure_dir(base_dir)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"

    stored_name = f"{uuid.uuid4().hex}{ext}"
    abs_path = os.path.join(base_dir, stored_name)

    max_bytes = settings.max_image_upload_mb * 1024 * 1024
    written = 0

    try:
        async with aiofiles.open(abs_path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(status_code=413, detail="Image too large")
                await out.write(chunk)
    except HTTPException:
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
            except OSError:
                pass
        raise

    if product.image_url:
        old_path = os.path.join(settings.media_dir, product.image_url.lstrip("/"))
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    product.image_url = f"images/{stored_name}"
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.image_url:
        img_path = os.path.join(settings.media_dir, product.image_url.lstrip("/"))
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except OSError:
                pass

    db.delete(product)
    db.commit()
    return None
