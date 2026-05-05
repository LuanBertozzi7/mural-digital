# ── Stage 1: build do frontend ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend/ ./frontend/

# VITE_API_URL vazio: em produção o frontend e a API ficam na mesma origem,
# então as chamadas são relativas (ex: /api/posts).
RUN cd frontend && VITE_API_URL="" npm run build

# ── Stage 2: imagem de produção ──────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Build do frontend vai para public/ (servido pelo Fastify em produção)
COPY --from=frontend-build /app/frontend/dist ./public

# Diretório de uploads persistido via volume no compose
RUN mkdir -p uploads/avatars

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3003

ENTRYPOINT ["/entrypoint.sh"]
