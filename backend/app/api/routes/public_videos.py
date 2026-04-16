import os

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.media import parse_http_range
from app.core.config import settings
from app.db import get_db
from app.models import Video


router = APIRouter()


@router.get("/videos/{video_id}/stream")
def stream_video(
    video_id: int,
    range_header: str | None = Header(default=None, alias="Range"),
    db: Session = Depends(get_db),
):
    res = db.execute(select(Video).where(Video.id == video_id))
    video = res.scalar_one_or_none()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    file_path = video.file_path
    if not os.path.isabs(file_path):
        file_path = os.path.join(settings.media_dir, file_path)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing")

    file_size = os.path.getsize(file_path)
    byte_range = parse_http_range(range_header, file_size)

    def file_iterator(start: int, end: int, chunk_size: int = 1024 * 1024):
        with open(file_path, "rb") as f:
            f.seek(start)
            remaining = end - start + 1
            while remaining > 0:
                chunk = f.read(min(chunk_size, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk

    headers = {"Accept-Ranges": "bytes"}

    if byte_range is None:
        headers["Content-Length"] = str(file_size)
        return StreamingResponse(
            file_iterator(0, file_size - 1),
            media_type=video.mime_type,
            headers=headers,
        )

    start, end = byte_range.start, byte_range.end
    content_length = end - start + 1
    headers.update(
        {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(content_length),
        }
    )
    return StreamingResponse(
        file_iterator(start, end),
        media_type=video.mime_type,
        status_code=206,
        headers=headers,
    )

