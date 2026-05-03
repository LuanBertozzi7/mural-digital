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
