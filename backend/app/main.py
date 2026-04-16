from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, select

from app.api.router import api_router
from app.core.config import settings
from app.core.media import ensure_dir
from app.core.security import hash_password
from app.db import SessionLocal, engine
from app.models import AdminUser, Base


app = FastAPI(title=settings.app_name)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


def _needs_schema_migration() -> bool:
    insp = inspect(engine)
    if not insp.has_table("products"):
        return False
    columns = {c["name"] for c in insp.get_columns("products")}
    return "slug" in columns


@app.on_event("startup")
def on_startup():
    ensure_dir(settings.media_dir)

    if _needs_schema_migration():
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)

    app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")

    db = SessionLocal()
    try:
        res = db.execute(select(AdminUser).where(AdminUser.email == settings.admin_email))
        user = res.scalar_one_or_none()
        if user is None:
            db.add(
                AdminUser(
                    email=settings.admin_email,
                    password_hash=hash_password(settings.admin_password),
                )
            )
            db.commit()
    finally:
        db.close()
