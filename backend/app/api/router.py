from fastapi import APIRouter

from app.api.routes import admin_auth, admin_products, admin_videos, public_products, public_videos


api_router = APIRouter(prefix="/api")

api_router.include_router(public_products.router, tags=["public"])
api_router.include_router(public_videos.router, tags=["public"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin-auth"])
api_router.include_router(admin_products.router, prefix="/admin/products", tags=["admin-products"])
api_router.include_router(admin_videos.router, prefix="/admin/products", tags=["admin-videos"])

