import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import healthRoutes from './routes/health.js'
import postsRoutes from './routes/posts.js'

const fastify = Fastify({ logger: true })

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
})

await fastify.register(prismaPlugin)
await fastify.register(authPlugin)
await fastify.register(healthRoutes)
await fastify.register(postsRoutes)

const port = Number(process.env.PORT) || 3000
await fastify.listen({ port, host: '0.0.0.0' })
