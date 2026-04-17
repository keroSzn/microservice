# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm config set strict-ssl false && npm ci

COPY . .

# Nginx aynı origin'den sunacağı için API_BASE_URL boş → relative path kullanılır.
# Eğer ayrı bir domain/port kullanılıyorsa build-arg ile geçin:
# docker compose build --build-arg VITE_API_BASE_URL=https://api.domain.com
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Build çıktısını nginx html dizinine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Proje içindeki nginx.conf'u container'a kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
