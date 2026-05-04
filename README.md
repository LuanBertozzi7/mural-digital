# Mural Digital

Plataforma comunitária para moradores de Pimenta Bueno - RO publicarem postagens locais (vagas, perdidos, problemas urbanos, avisos, eventos, compras), filtradas por categoria e bairro, com moderação por admins.

## Stack

- **Backend:** Node.js 20 · Fastify 5 · Prisma 6 · PostgreSQL 16
- **Frontend:** React 18 · Vite 5 · React Router 6 · Tailwind CSS 4

---

## Desenvolvimento local

### 1. Banco de dados

```bash
# Docker
docker compose up -d

# Podman
podman run -d --name mural-postgres \
  -e POSTGRES_USER=mural -e POSTGRES_PASSWORD=mural -e POSTGRES_DB=mural \
  -p 5432:5432 docker.io/library/postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # edite as variáveis
npm install
npx prisma migrate dev
node prisma/seed.js
npm run dev                 # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # edite VITE_API_URL se necessário
npm install
npm run dev                 # http://localhost:5173
```

---

## Deploy na VPS (Rocky Linux 9)

### Pré-requisitos

```bash
# Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo dnf install -y nginx
sudo systemctl enable --now nginx

# PostgreSQL 16
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql16-server
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl enable --now postgresql-16

# Criar banco e usuário
sudo -u postgres psql -c "CREATE USER mural WITH PASSWORD 'senha-forte';"
sudo -u postgres psql -c "CREATE DATABASE mural OWNER mural;"
```

### Variáveis de ambiente

**`backend/.env`** (produção):
```env
DATABASE_URL="postgresql://mural:senha-forte@localhost:5432/mural"
JWT_SECRET="string-aleatoria-longa-e-segura"
ADMIN_EMAIL="seu@email.com"
ADMIN_PASSWORD="senha-forte-do-admin"
ADMIN_NAME="Administrador"
PORT=3000
CORS_ORIGIN="https://seudominio.com"
NODE_ENV=production
```

**`frontend/.env`** (produção):
```env
VITE_API_URL=https://seudominio.com
```

### Deploy

```bash
# Clonar e instalar
git clone https://github.com/LuanBertozzi7/mural-digital.git /var/www/mural-digital
cd /var/www/mural-digital

# Backend
cd backend
npm install --omit=dev
npx prisma migrate deploy
node prisma/seed.js
pm2 start src/server.js --name mural-api
pm2 save
pm2 startup   # seguir as instruções do comando

# Frontend (build estático)
cd ../frontend
npm install
npm run build   # gera dist/
```

### Nginx

Criar `/etc/nginx/conf.d/mural.conf`:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    # Frontend (build estático)
    root /var/www/mural-digital/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads (avatares)
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### HTTPS (Certbot)

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Atualizações futuras

```bash
cd /var/www/mural-digital
git pull

# Backend
cd backend && npm install --omit=dev
npx prisma migrate deploy
pm2 restart mural-api

# Frontend
cd ../frontend && npm run build
```

---

## API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | — | Smoke test |
| GET | `/api/posts` | — | Feed paginado. Query: `category`, `q`, `page` |
| POST | `/api/posts` | opcional | Cria post PENDING |
| POST | `/api/auth/register` | — | Cadastro → `{ token, user }` |
| POST | `/api/auth/login` | — | Login → `{ token, user }` |
| GET | `/api/me/profile` | sim | Perfil do usuário |
| PATCH | `/api/me/profile` | sim | Atualiza nome e bairro |
| POST | `/api/me/avatar` | sim | Upload de foto de perfil |
| GET | `/api/me/posts` | sim | Posts do usuário |
| PATCH | `/api/me/posts/:id` | sim | Edita post próprio (volta a PENDING) |
| DELETE | `/api/me/posts/:id` | sim | Exclui post próprio |
| GET | `/api/admin/posts` | admin | Lista todos com filtro `?status=` |
| PATCH | `/api/admin/posts/:id` | admin | Altera status |
| DELETE | `/api/admin/posts/:id` | admin | Remove post |

---

## Próximos passos

- Upload de imagens nos posts
- Mapa interativo (Leaflet + OpenStreetMap)
- E-mail de notificação (aprovação/rejeição)
- Rate limit (`@fastify/rate-limit`)
- Multi-cidade
