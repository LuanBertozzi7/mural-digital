import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import healthRoutes from './routes/health.js'
import postsRoutes from './routes/posts.js'
import authRoutes from './routes/auth.js'
import meRoutes from './routes/me.js'
import adminRoutes from './routes/admin.js'

const isProd = process.env.NODE_ENV === 'production'
const fastify = Fastify({
  logger: isProd
    ? true
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } } }
})

await fastify.register(helmet, { contentSecurityPolicy: false })
await fastify.register(multipart)
await fastify.register(staticFiles, {
  root: join(__dirname, '..', 'uploads'),
  prefix: '/uploads/'
})
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']
})

await fastify.register(prismaPlugin)
await fastify.register(authPlugin)
await fastify.register(healthRoutes)
await fastify.register(postsRoutes)
await fastify.register(authRoutes)
await fastify.register(meRoutes)
await fastify.register(adminRoutes)

const port = Number(process.env.PORT) || 3000
await fastify.listen({ port, host: '0.0.0.0' })
