# Reklam Proje (Torku ürün & reklam platformu)

Bu proje iki klasörden oluşur:
- `backend/`: FastAPI + SQLAlchemy ile API (ürünler, admin, video upload + HTTP Range streaming)
- `frontend/`: React + Vite + TypeScript + Tailwind ile web arayüzü (kullanıcı + admin panel)

## Çalıştırma (lokal)

### Backend

1) Sanal ortam ve paketler:

```bash
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
copy backend/.env.example backend/.env
```

2) API’yi çalıştır:

```bash
backend/.venv/Scripts/python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

3) Swagger:
- `http://127.0.0.1:8000/docs`

Varsayılan admin hesabı `backend/.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD` değerleridir.

### Frontend

Bu repo Node.js gerektirir. Windows’ta Node.js kurduktan sonra:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Uygulama:
- `http://localhost:5173`
- Admin panel: `http://localhost:5173/admin/login`

## Postgres + pgAdmin (Docker)

Postgres ve pgAdmin'i ayağa kaldırmak için:

```bash
docker compose up -d
```

`backend/.env` içinde DB URL'i şu şekilde olmalı:

```env
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/reklam_proje"
```

pgAdmin arayüzü:
- URL: `http://localhost:5050`
- Email: `admin@reklam.com`
- Password: `admin123`

pgAdmin içinde server eklemek için:
- Name: `reklam-proje-postgres`
- Host name/address: `postgres` (Docker içinden) veya `host.docker.internal` (Windows host üzerinden)
- Port: `5432`
- Maintenance database: `reklam_proje`
- Username: `postgres`
- Password: `postgres`

## CORS

Backend CORS, `backend/.env` içindeki `CORS_ORIGINS` ile yönetilir (virgülle ayrılmış liste).

## Nginx (prod notu)

Örnek bir reverse proxy konfigürasyonu `infra/nginx.conf` dosyasında var.
