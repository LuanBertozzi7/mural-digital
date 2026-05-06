import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import emailPlugin from './plugins/email.js'
import healthRoutes from './routes/health.js'
import postsRoutes from './routes/posts.js'
import authRoutes from './routes/auth.js'
import meRoutes from './routes/me.js'
import adminRoutes from './routes/admin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL']
const missing = REQUIRED_ENV.filter((k) => !process.env[k])
if (missing.length > 0) {
  console.error(`[startup] Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`)
  process.exit(1)
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('[startup] JWT_SECRET deve ter pelo menos 32 caracteres')
  process.exit(1)
}

const isProd = process.env.NODE_ENV === 'production'

const fastify = Fastify({
  logger: isProd
    ? true
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } } }
})

// contentSecurityPolicy: off — API JSON-only, sem HTML renderizado
// crossOriginResourcePolicy: cross-origin — frontend em domínio diferente precisa carregar avatares
await fastify.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({ error: 'muitas requisições, tente novamente em instantes' })
})

await fastify.register(multipart)

await fastify.register(staticFiles, {
  root: join(__dirname, '..', 'uploads'),
  prefix: '/uploads/',
})

if (isProd) {
  const publicDir = join(__dirname, '..', 'public')
  await fastify.register(staticFiles, {
    root: publicDir,
    prefix: '/',
    wildcard: false,
    decorateReply: false,
  })
}

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']
})

await fastify.register(prismaPlugin)
await fastify.register(authPlugin)
await fastify.register(emailPlugin)
await fastify.register(healthRoutes)
await fastify.register(postsRoutes)
await fastify.register(authRoutes)
await fastify.register(meRoutes)
await fastify.register(adminRoutes)

if (isProd) {
  const publicDir = join(__dirname, '..', 'public')
  fastify.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
      return reply.code(404).send({ error: 'Not Found' })
    }
    return reply.sendFile('index.html', publicDir)
  })
}

const port = Number(process.env.PORT) || 3000
await fastify.listen({ port, host: '0.0.0.0' })
