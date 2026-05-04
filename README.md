# Mural Digital

Plataforma comunitária para moradores de Pimenta Bueno - RO publicarem postagens locais (vagas, perdidos, problemas urbanos, avisos, eventos, compras), filtradas por categoria e bairro, com moderação por admins.

## Stack

- **Backend:** Node.js 20 · Fastify 5 · Prisma 6 · PostgreSQL 16
- **Frontend:** React 18 · Vite 5 · React Router 6 · Tailwind CSS 4
- **Infra dev:** Podman/Docker (apenas para o Postgres)

---

## Setup do zero

### 1. Banco de dados

```bash
# Com Docker
docker compose up -d

# Com Podman
podman run -d --name mural-postgres \
  -e POSTGRES_USER=mural -e POSTGRES_PASSWORD=mural -e POSTGRES_DB=mural \
  -p 5432:5432 docker.io/library/postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # edite as variáveis se necessário
npm install
npx prisma migrate dev
node prisma/seed.js         # cria o admin definido no .env
npm run dev                 # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## Variáveis de ambiente (`backend/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql://mural:mural@localhost:5432/mural` | String de conexão Postgres |
| `JWT_SECRET` | — | Segredo para assinar tokens JWT (troque em prod) |
| `ADMIN_EMAIL` | `admin@mural.local` | E-mail do admin criado pelo seed |
| `ADMIN_PASSWORD` | `trocar-em-prod` | Senha do admin (troque em prod) |
| `ADMIN_NAME` | `Administrador` | Nome exibido do admin |
| `PORT` | `3000` | Porta do servidor |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem permitida pelo CORS |
| `NODE_ENV` | — | `production` desativa o pino-pretty |

---

## API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | — | Smoke test |
| GET | `/api/posts` | — | Feed paginado (20/pág). Query: `category`, `neighborhood`, `q`, `page` |
| POST | `/api/posts` | opcional | Cria post PENDING. Token → associa userId |
| POST | `/api/auth/register` | — | Cadastro. Retorna `{ token, user }` |
| POST | `/api/auth/login` | — | Login. Retorna `{ token, user }` |
| GET | `/api/me/posts` | sim | Posts do usuário autenticado |
| GET | `/api/admin/posts` | admin | Lista todos, query `?status=` |
| PATCH | `/api/admin/posts/:id` | admin | Altera status (`PENDING`/`APPROVED`/`REJECTED`) |
| DELETE | `/api/admin/posts/:id` | admin | Remove post |

---

## Smoke tests

```bash
# Health
curl localhost:3000/api/health

# Post anônimo
curl -X POST localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste","description":"Desc","category":"AVISOS","neighborhood":"Centro"}'

# Login admin
curl -X POST localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mural.local","password":"trocar-em-prod"}'

# Aprovar post (substituir TOKEN e ID)
curl -X PATCH localhost:3000/api/admin/posts/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'
```

---

## Próximos passos (fora do escopo do MVP)

- **Upload de imagens** — armazenamento em S3/R2, campo `imageUrl` no Post
- **Mapa interativo** — Leaflet + OpenStreetMap com pin por bairro
- **E-mail** — confirmação de cadastro e recuperação de senha (Nodemailer/Resend)
- **Rate limit** — `@fastify/rate-limit` para evitar spam
- **Captcha** — proteção no formulário de post anônimo
- **Edição de post** — `PATCH /api/me/posts/:id` para o próprio autor
- **Perfil editável** — nome e senha
- **Multi-cidade** — campo `city` no Post, filtro no feed
- **Notificações** — aviso ao autor quando post for aprovado/rejeitado
