from datetime import datetime

from pydantic import ConfigDict
from pydantic import BaseModel, EmailStr, Field


class VideoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    mime_type: str
    duration_sec: int | None = None
    created_at: datetime


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    is_new: bool
    created_at: datetime


class ProductDetailOut(ProductOut):
    model_config = ConfigDict(from_attributes=True)

    videos: list[VideoOut] = Field(default_factory=list)


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=220)
    description: str | None = None
    image_url: str | None = None
    is_new: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    description: str | None = None
    image_url: str | None = None
    is_new: bool | None = None


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

