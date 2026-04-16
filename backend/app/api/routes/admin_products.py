from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_admin
from app.models import AdminUser, Product
from app.schemas import ProductCreate, ProductOut, ProductUpdate


router = APIRouter()


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
    existing = db.execute(select(Product).where(Product.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Slug already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
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
    if "slug" in data and data["slug"] != product.slug:
        existing = db.execute(select(Product).where(Product.slug == data["slug"]))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="Slug already exists")

    for k, v in data.items():
        setattr(product, k, v)

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
    db.delete(product)
    db.commit()
    return None

