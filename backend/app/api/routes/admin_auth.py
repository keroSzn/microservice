from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.db import get_db
from app.models import AdminUser
from app.schemas import AdminLoginIn, TokenOut


router = APIRouter()


@router.post("/login", response_model=TokenOut)
def login(payload: AdminLoginIn, db: Session = Depends(get_db)):
    res = db.execute(select(AdminUser).where(AdminUser.email == payload.email))
    user = res.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.email)
    return TokenOut(access_token=token)

