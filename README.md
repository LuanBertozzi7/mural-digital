# Mural Digital

Plataforma comunitária para moradores de Pimenta Bueno - RO publicarem postagens locais: vagas de emprego, objetos perdidos, problemas urbanos, avisos, eventos e compras. As postagens são filtradas por categoria e bairro e passam por moderação antes de aparecerem no feed.

## Stack

- **Backend:** Node.js 20 · Fastify 5 · Prisma 6 · PostgreSQL 16
- **Frontend:** React 19 · Vite · React Router · Tailwind CSS 4

---

## Desenvolvimento local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (local ou via Docker/Podman)

### 1. Banco de dados

Com Docker:

```bash
docker compose up -d
```

Com Podman:

```bash
podman run -d --name mural-postgres \
  -e POSTGRES_USER=mural \
  -e POSTGRES_PASSWORD=mural \
  -e POSTGRES_DB=mural \
  -p 5432:5432 docker.io/library/postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

O servidor sobe em `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A interface sobe em `http://localhost:5173`.

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

# Banco e usuário
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
git clone https://github.com/LuanBertozzi7/mural-digital.git /var/www/mural-digital
cd /var/www/mural-digital

# Backend
cd backend
npm install --omit=dev
npx prisma migrate deploy
node prisma/seed.js
pm2 start src/server.js --name mural-api
pm2 save
pm2 startup   # siga as instruções exibidas pelo comando

# Frontend (build estático)
cd ../frontend
npm install
npm run build
```

### Nginx

Crie `/etc/nginx/conf.d/mural.conf`:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    root /var/www/mural-digital/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### HTTPS

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Atualizacoes

```bash
cd /var/www/mural-digital
git pull

cd backend
npm install --omit=dev
npx prisma migrate deploy
pm2 restart mural-api

cd ../frontend
npm run build
```

---

## Como contribuir

O projeto e aberto a contribuicoes. Qualquer pessoa pode ajudar, independente do nivel de experiencia.

### Reportando problemas

Encontrou um bug ou tem uma sugestao? Abra uma issue no GitHub descrevendo:

- O que aconteceu e o que era esperado
- Passos para reproduzir (se for bug)
- Versao do Node.js e sistema operacional

### Enviando codigo

1. Faca um fork do repositorio
2. Crie uma branch a partir de `main` com um nome descritivo (`git checkout -b minha-feature`)
3. Faca as alteracoes e commits com mensagens claras
4. Abra um pull request descrevendo o que foi feito e por que

### Boas praticas

- Mantenha o escopo das mudancas pequeno e focado
- Se a mudanca for grande ou arquitetural, abra uma issue primeiro para discutir antes de codar
- Teste localmente antes de enviar o PR

---

## Licenca

MIT
