from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models import Product
from app.schemas import ProductDetailOut, ProductOut


router = APIRouter()


@router.get("/products", response_model=list[ProductOut])
def list_products(is_new: bool | None = None, db: Session = Depends(get_db)):
    stmt = select(Product).order_by(Product.created_at.desc())
    if is_new is not None:
        stmt = stmt.where(Product.is_new == is_new)
    res = db.execute(stmt)
    return list(res.scalars().all())


@router.get("/products/{slug}", response_model=ProductDetailOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.slug == slug).options(selectinload(Product.videos))
    res = db.execute(stmt)
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

