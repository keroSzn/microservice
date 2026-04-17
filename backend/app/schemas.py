from datetime import datetime

from pydantic import ConfigDict
from pydantic import BaseModel, EmailStr, Field


class VideoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    youtube_url: str
    created_at: datetime


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    image_url: str | None = None
    is_new: bool
    created_at: datetime


class ProductDetailOut(ProductOut):
    model_config = ConfigDict(from_attributes=True)

    videos: list[VideoOut] = Field(default_factory=list)


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    image_url: str | None = None
    is_new: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    image_url: str | None = None
    is_new: bool | None = None


class VideoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    youtube_url: str = Field(min_length=5, max_length=500)


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: datetime


class AdminCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
