from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.deps import get_current_admin
from app.models import AdminUser
from app.schemas import AdminCreateIn, AdminOut, AdminLoginIn, TokenOut


router = APIRouter()


@router.post("/login", response_model=TokenOut)
def login(payload: AdminLoginIn, db: Session = Depends(get_db)):
    res = db.execute(select(AdminUser).where(AdminUser.email == payload.email))
    user = res.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.email)
    return TokenOut(access_token=token)


@router.get("/admins", response_model=list[AdminOut])
def list_admins(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(AdminUser).order_by(AdminUser.created_at.desc()))
    return list(res.scalars().all())


@router.post("/admins", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
def create_admin(
    payload: AdminCreateIn,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    existing = db.execute(select(AdminUser).where(AdminUser.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı.")

    user = AdminUser(email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

