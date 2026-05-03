# Mural Digital — Spec de Execução

> CLAUDE.md do projeto. Onboarding completo do agente em uma leitura. Mantenha curto e específico.

## What
Plataforma web comunitária para moradores de Pimenta Bueno - RO publicarem postagens locais (vagas, perdidos, problemas urbanos, avisos, eventos, compras), filtradas por categoria e bairro, com moderação por admins. Cadastro é opcional: dá pra postar como anônimo ou criar conta.

## Why
WhatsApp e Facebook misturam tudo, sem filtro nem moderação. Esta plataforma centraliza, classifica e modera. Como o público-alvo é uma cidade só (comunidade pequena), riscos de spam e abuso são gerenciáveis com moderação manual no MVP.

## Ambiente de desenvolvimento
- **Sistema:** Ubuntu Linux (máquina de desenvolvimento local, não a VPS de produção)
- **Pasta do projeto:** já tem `git init` feito e `origin` apontando para um repositório no GitHub. Pode commitar e dar `git push` direto.
- **Onde rodar:** todo desenvolvimento e teste roda local nesta máquina. A VPS Rocky 9 só recebe deploy depois que o MVP estiver funcional (fase posterior, fora do escopo deste md).
- **Branch:** trabalhe em `main` mesmo, sem PR. Commits pequenos com mensagens descritivas (`feat`, `chore`, `fix`).

## Stack (verificada e fixada)
- **Runtime:** Node.js 20 LTS
- **Backend:** Fastify 5, `@fastify/cors`, `@fastify/jwt`, `fastify-plugin`, `bcryptjs`, `dotenv`
- **ORM/DB:** Prisma 6 + PostgreSQL 16 (não usar Prisma 7, é ESM-only com breaking changes)
- **Frontend:** React 18 + Vite 5 + React Router 6 + Tailwind CSS 4
- **Validação:** JSON Schema nativo do Fastify (Ajv embutido)
- **Linguagem:** JavaScript puro com módulos ES (`"type": "module"` no package.json)
- **Infra dev:** Docker Compose só para o Postgres; back e front rodam local via `npm run dev`

> Tailwind 4 não usa `tailwind.config.js` nem `postcss.config.js`. Usa o plugin `@tailwindcss/vite` e `@import "tailwindcss"` no CSS. Tema customizado vai em `@theme { ... }` direto no CSS.

## Escopo (MoSCoW)

**Must** — sem isso não tem produto:
- `GET /api/health` retornando `{ status: "ok" }` (smoke test)
- Submissão de post (anônima ou logada)
- Feed paginado com filtros por categoria e bairro
- Cadastro de user (`POST /api/auth/register`)
- Login universal (`POST /api/auth/login`) emitindo JWT com `{ userId, role }`
- Painel admin: aprovar, rejeitar, remover
- `GET /api/me/posts` para user acompanhar próprios posts
- Seed de admin via variáveis de ambiente

**Should** — entra se sobrar tempo:
- Ordenação por data no feed
- Badges de status no painel admin e em `/me/posts`
- `@fastify/helmet` para security headers básicos
- Logger formatado em dev (pino-pretty)

**Could** — só se tudo o resto estiver fechado:
- Busca textual no feed
- Tema escuro
- Paginação infinita

**Won't (esta entrega)** — listar como TODO no README:
- Upload de imagens
- Mapa interativo (futuro: Leaflet + OSM)
- E-mail (registro, recuperação de senha)
- Captcha e rate limit (`@fastify/rate-limit`)
- Edição/exclusão de post próprio
- Perfil editável
- Multi-cidade

---

## User stories e critérios de aceitação

**US1 — Visitante vê o feed**
`GET /api/posts` retorna apenas `APPROVED`, paginado em 20, com campo `author` derivado: nome do user ou "Anônimo". Front renderiza cards com título, descrição, bairro, categoria, autor e data formatada.

**US2 — Visitante envia post anônimo**
`POST /api/posts` sem token cria post com `status=PENDING` e `userId=null`, retorna 201 com o post criado. Form em `/submit` mostra "postando como Anônimo" e reseta após sucesso.

**US3 — Usuário se cadastra**
`POST /api/auth/register` cria User com `role=USER`, retorna `{ token, user }`. Email duplicado → 409. Senha < 6 caracteres → 400.

**US4 — Login universal**
`POST /api/auth/login` retorna `{ token, user: { id, name, role } }` para credenciais válidas. Front guarda em `localStorage`, redireciona ADMIN para `/admin` e USER para `/`.

**US5 — Usuário logado posta**
`POST /api/posts` com token válido cria post com `userId` preenchido. Feed e `/me/posts` exibem nome do user em vez de "Anônimo".

**US6 — Usuário acompanha próprios posts**
`GET /api/me/posts` retorna posts onde `userId = req.user.userId`, ordenados desc por data. Página `/me/posts` exibe lista com badge colorido por status.

**US7 — Admin modera**
`GET /api/admin/posts?status=` lista filtrado, `PATCH /api/admin/posts/:id` muda status, `DELETE` remove. UI atualiza sem reload.

---

## Arquitetura
```
[ React SPA :5173 ] ──HTTP/JSON──▶ [ Fastify API :3000 ] ──Prisma──▶ [ PostgreSQL :5432 ]
```
CORS aberto em dev para `http://localhost:5173`. Token JWT no header `Authorization: Bearer <token>`. JWT expira em 7 dias.

## Estrutura
```
mural-digital/
├── docker-compose.yml          # apenas postgres + volume nomeado
├── README.md                   # setup do zero, troubleshooting, lista de TODOs (Won't)
├── backend/
│   ├── package.json            # "type": "module"
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── server.js           # entrypoint
│       ├── plugins/
│       │   ├── prisma.js       # decorate fastify.prisma
│       │   └── auth.js         # decorate authenticate, requireAdmin, optionalAuth
│       └── routes/
│           ├── health.js
│           ├── auth.js         # register, login
│           ├── posts.js        # GET público, POST com optionalAuth
│           ├── me.js           # prefix /me, requer authenticate
│           └── admin.js        # prefix /admin, requer requireAdmin
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             # router
        ├── index.css           # @import "tailwindcss"
        ├── api.js              # fetch wrapper, anexa token automaticamente
        ├── auth.js             # getUser(), isLoggedIn(), logout()
        ├── components/
        │   ├── Header.jsx      # login/logout, links contextuais por role
        │   └── PostCard.jsx
        └── pages/
            ├── Feed.jsx
            ├── Submit.jsx
            ├── Login.jsx       # universal
            ├── Register.jsx
            ├── MyPosts.jsx
            └── AdminPanel.jsx
```

## Modelo de dados
```prisma
enum Category { VAGAS PERDIDOS PROBLEMAS AVISOS EVENTOS COMPRAS }
enum PostStatus { PENDING APPROVED REJECTED }
enum Role { USER ADMIN }

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  posts        Post[]
}

model Post {
  id           Int        @id @default(autoincrement())
  title        String
  description  String
  category     Category
  neighborhood String
  status       PostStatus @default(PENDING)
  userId       Int?
  user         User?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([status, category, neighborhood])
}
```

## API
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | não | Smoke test, retorna `{ status: "ok" }` |
| GET | `/api/posts?category=&neighborhood=&page=` | não | Lista APPROVED, 20/página, com `author` derivado |
| POST | `/api/posts` | opcional | Cria PENDING. Body: title, description, category, neighborhood. Token → associa userId |
| POST | `/api/auth/register` | não | Body: name, email, password. 201 → `{ token, user }`. 409 se email duplicado |
| POST | `/api/auth/login` | não | Body: email, password. 200 → `{ token, user }`. 401 se credenciais inválidas |
| GET | `/api/me/posts` | sim | Posts do user logado, qualquer status |
| GET | `/api/admin/posts?status=` | admin | Lista todos com filtro opcional |
| PATCH | `/api/admin/posts/:id` | admin | Body: `{ status }` |
| DELETE | `/api/admin/posts/:id` | admin | Remove |

**Erros padronizados** — sempre `{ error: string, details?: any }`:
- 400 — body inválido (validação JSON Schema falhou)
- 401 — sem token ou token expirado em rota protegida
- 403 — token válido mas role insuficiente
- 404 — recurso não existe
- 409 — conflito (email duplicado no register)
- 500 — erro inesperado, mensagem genérica `"internal server error"` (detalhes só no log)

## Plugin de auth — pattern obrigatório
```js
// src/plugins/auth.js
import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: '7d' }
  })

  fastify.decorate('authenticate', async (req, reply) => {
    try { await req.jwtVerify() }
    catch { reply.code(401).send({ error: 'unauthorized' }) }
  })

  fastify.decorate('requireAdmin', async (req, reply) => {
    try {
      await req.jwtVerify()
      if (req.user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'forbidden' })
      }
    } catch {
      reply.code(401).send({ error: 'unauthorized' })
    }
  })

  fastify.decorate('optionalAuth', async (req) => {
    try { await req.jwtVerify() } catch { /* sem token, segue anônimo */ }
  })
})
```
Aplicar em rotas via `{ onRequest: [fastify.authenticate] }` (ou `requireAdmin` ou `optionalAuth`).

## Variáveis de ambiente (`backend/.env.example`)
```
DATABASE_URL="postgresql://mural:mural@localhost:5432/mural"
JWT_SECRET="trocar-em-prod-com-string-aleatoria-longa"
ADMIN_EMAIL="admin@mural.local"
ADMIN_PASSWORD="trocar-em-prod"
ADMIN_NAME="Administrador"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

## Scripts (`backend/package.json`)
```json
"scripts": {
  "dev": "node --watch src/server.js",
  "start": "node src/server.js",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "node prisma/seed.js",
  "prisma:studio": "prisma studio",
  "db:reset": "prisma migrate reset"
}
```

## Vertical slice (ordem de execução)
A ideia é fechar um caminho end-to-end mínimo antes de expandir. Comece simples, valide, depois adicione.

**Slice 0 — App roda**
1. `docker-compose.yml` com postgres 16
2. `cd backend && npm init -y`, instalar deps, `"type": "module"` no package.json
3. `schema.prisma` mínimo (só User), `npx prisma migrate dev --name init`
4. `plugins/prisma.js` decorando `fastify.prisma`, com `onClose` chamando `$disconnect`
5. `routes/health.js`: GET `/api/health` retorna `{ status: 'ok' }`
6. `server.js` registra plugin e rota, escuta na porta 3000
7. **Verificar:** `curl localhost:3000/api/health` retorna 200

**Slice 1 — Feed funciona ponta a ponta**
8. Adicionar Post ao `schema.prisma`, nova migration
9. `routes/posts.js`: GET `/api/posts` (APPROVED com paginação), POST `/api/posts` (cria PENDING)
10. Validação JSON Schema inline em ambos os endpoints
11. `cd ../frontend && npm create vite@latest . -- --template react`
12. Instalar Tailwind 4: `npm i -D tailwindcss @tailwindcss/vite`, plugin no `vite.config.js`, `@import "tailwindcss"` em `index.css`
13. Criar `api.js` com fetch wrapper e `pages/Feed.jsx` + `pages/Submit.jsx`
14. **Verificar:** submeter post via UI, aprovar manualmente no Prisma Studio (`npm run prisma:studio`), ver no feed

**Slice 2 — Auth e moderação**
15. Adicionar `Role` ao User, `userId?` ao Post, nova migration
16. `plugins/auth.js` com os três decorators
17. `routes/auth.js`: register, login (bcryptjs para hash, `reply.jwtSign` para token)
18. Atualizar POST `/api/posts` para usar `optionalAuth`, associar userId se vier
19. Atualizar GET `/api/posts` para incluir `author` (nome do user ou "Anônimo")
20. `routes/me.js` (GET `/api/me/posts`)
21. `routes/admin.js` (lista, patch status, delete)
22. `seed.js` cria admin a partir do .env (verificar se já existe antes)
23. Frontend: `Header`, `Login`, `Register`, `MyPosts`, `AdminPanel`
24. **Verificar:** rodar a sequência completa de validação abaixo

## Verificação completa
Sequência de comandos que deve funcionar do zero:
```bash
# Subir banco
docker compose up -d

# Backend
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Em outra aba — Frontend
cd frontend
npm install
npm run dev
```

Smoke tests via curl:
```bash
# 1. Health
curl localhost:3000/api/health
# → {"status":"ok"}

# 2. Criar post anônimo
curl -X POST localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste","description":"Desc","category":"AVISOS","neighborhood":"Centro"}'
# → 201

# 3. Login admin
curl -X POST localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mural.local","password":"trocar-em-prod"}'
# → {"token":"...","user":{...}}

# 4. Aprovar post (substituir TOKEN e ID)
curl -X PATCH localhost:3000/api/admin/posts/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'
# → 200

# 5. Ver no feed
curl localhost:3000/api/posts
# → post aparece com author="Anônimo"
```

Validação manual no front:
- Cadastrar conta nova → ver header com nome
- Postar logado → ver "postando como {nome}"
- `/me/posts` mostra o post com badge PENDING
- Logar como admin, aprovar, voltar como user → badge APPROVED
- Filtrar por categoria e bairro no feed → funciona
- Logout volta para estado anônimo

## Convenções
- Sem TypeScript, sem classes — funções puras e módulos ES
- Sem camadas controller/service/repository — handler chama Prisma direto
- Validação inline com `schema` do Fastify (JSON Schema), sem libs adicionais
- Erros: `reply.code(N).send({ error: '...' })`, sem throw de exceptions custom
- Componentes React funcionais com hooks; sem libs de estado global
- Tailwind 4 puro, sem libs de componentes (shadcn etc.)
- Senha sempre via `bcryptjs.hash` (10 rounds), nunca em texto plano
- JWT payload mínimo: `{ userId, role }`. Nunca incluir senha, email ou nome no token
- Nunca logar token, senha ou body de request inteiro

## Diretrizes para o agente
- Trabalhe em vertical slices: feche o slice atual antes de começar o próximo
- Após cada slice, rode os comandos de verificação correspondentes e corrija erros antes de seguir
- Ao final de cada slice verde, faça `git add -A && git commit -m "..."` e `git push`
- Não instale dependências fora das listadas sem justificar no commit
- Commits pequenos e descritivos: `feat(api): add posts routes`, `chore: setup tailwind`
- Não reescreva arquivos do `npm create vite` ou `prisma init` sem motivo
- Se algo do Must não couber no tempo, marque como TODO no README e siga
- README final lista todos os "Won't" + qualquer "Must" pendente como "Próximos passos"
