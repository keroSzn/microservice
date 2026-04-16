from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_admin
from app.models import AdminUser, Product, Video
from app.schemas import VideoCreate, VideoOut


router = APIRouter()


@router.post("/{product_id}/videos", response_model=VideoOut, status_code=status.HTTP_201_CREATED)
def add_video(
    product_id: int,
    payload: VideoCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    res = db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    video = Video(
        product_id=product.id,
        title=payload.title.strip(),
        youtube_url=payload.youtube_url.strip(),
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


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

    db.delete(video)
    db.commit()
    return None
