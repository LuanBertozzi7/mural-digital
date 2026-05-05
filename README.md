# Mural Digital

Plataforma comunitária de avisos para moradores de Pimenta Bueno — RO. Publique vagas de emprego, objetos perdidos, problemas urbanos, eventos, avisos e anúncios de compra. As postagens passam por moderação antes de aparecerem no feed público.

## Funcionalidades

- Feed com busca por texto e filtro por categoria
- Publicação anônima ou autenticada
- Moderação de posts pelo administrador
- Perfil com foto de avatar
- Recuperação de senha por e-mail
- Dark mode com preferência salva
- Deploy em container único (frontend + API juntos)

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | Node.js 20 · Fastify 5 · Prisma 6 · PostgreSQL 16 |
| Frontend | React 19 · Vite · React Router · Tailwind CSS 4 |
| Infra | Docker / Podman · nodemailer (SMTP) |

---

## Rodando com Docker

A forma mais simples de subir o projeto completo (frontend + backend + banco):

```bash
git clone https://github.com/LuanBertozzi7/mural-digital.git
cd mural-digital
```

Crie um arquivo `.env` na raiz com as variáveis obrigatórias:

```env
JWT_SECRET=string-aleatoria-de-pelo-menos-32-caracteres
FRONTEND_URL=http://localhost:3003

# SMTP para recuperação de senha (opcional em dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu@email.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=Mural Digital <noreply@seudominio.com>
```

Suba os containers:

```bash
docker compose up -d       # Docker
# ou
podman compose up -d       # Podman
```

A aplicação fica disponível em `http://localhost:3003`.

> **Sem SMTP configurado:** o link de reset de senha é impresso no log do container (`docker compose logs app`).

---

## Desenvolvimento local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (local ou via container)

### 1. Banco de dados

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
cp .env.example .env   # edite as variáveis necessárias
npm install
npx prisma migrate dev
node prisma/seed.js    # cria o usuário admin
npm run dev            # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

---

## Deploy em VPS (sem Docker)

### Pré-requisitos no servidor (Rocky Linux 9 / Ubuntu)

```bash
# Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# PM2 + Nginx
sudo npm install -g pm2
sudo dnf install -y nginx && sudo systemctl enable --now nginx

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

**`backend/.env`**:

```env
DATABASE_URL="postgresql://mural:senha-forte@localhost:5432/mural"
JWT_SECRET="string-aleatoria-longa-e-segura"
ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="senha-forte-do-admin"
ADMIN_NAME="Administrador"
PORT=3000
CORS_ORIGIN="https://seudominio.com"
FRONTEND_URL="https://seudominio.com"
NODE_ENV=production
```

**`frontend/.env`**:

```env
VITE_API_URL=https://seudominio.com
```

### Primeiro deploy

```bash
git clone https://github.com/LuanBertozzi7/mural-digital.git /var/www/mural-digital
cd /var/www/mural-digital/backend
npm install --omit=dev
npx prisma migrate deploy
node prisma/seed.js
pm2 start src/server.js --name mural-api
pm2 save && pm2 startup

cd ../frontend
npm install
npm run build
```

### Nginx

`/etc/nginx/conf.d/mural.conf`:

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

# HTTPS
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Atualizações

```bash
cd /var/www/mural-digital && git pull
cd backend && npm install --omit=dev && npx prisma migrate deploy && pm2 restart mural-api
cd ../frontend && npm run build
```

---

## Como contribuir

O projeto é aberto a contribuições de qualquer nível.

**Reportando problemas:** abra uma issue descrevendo o que aconteceu, o que era esperado e como reproduzir.

**Enviando código:**

1. Fork o repositório
2. Crie uma branch a partir de `main` (`git checkout -b minha-feature`)
3. Faça commits com mensagens claras seguindo [Conventional Commits](https://www.conventionalcommits.org/)
4. Abra um pull request descrevendo a mudança

Se a alteração for grande ou arquitetural, abra uma issue primeiro para alinhar antes de implementar.

---

## Licença

MIT
