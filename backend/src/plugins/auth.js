/**
 * Plugin de autenticação JWT.
 *
 * Registra o @fastify/jwt e adiciona três decorators ao fastify:
 *
 *  - fastify.authenticate     → preHandler que exige token válido (qualquer role)
 *  - fastify.requireAdmin     → preHandler que exige token válido com role ADMIN
 *  - fastify.optionalAuth     → preHandler que tenta verificar o token mas não
 *                               rejeita a requisição se ele estiver ausente ou inválido
 *
 * Uso nas rotas:
 *   onRequest: [fastify.authenticate]
 *   onRequest: [fastify.requireAdmin]
 *   onRequest: [fastify.optionalAuth]
 */

import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: '7d' }
  })

  fastify.decorate('authenticate', async (req, reply) => {
    try {
      await req.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'unauthorized' })
    }
  })

  fastify.decorate('requireAdmin', async (req, reply) => {
    try {
      await req.jwtVerify()
      if (req.user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'forbidden' })
      }
    } catch {
      return reply.code(401).send({ error: 'unauthorized' })
    }
  })

  // Não rejeita a requisição em caso de falha — apenas não popula req.user.
  // Usado em rotas que aceitam tanto usuários autenticados quanto anônimos.
  fastify.decorate('optionalAuth', async (req) => {
    try { await req.jwtVerify() } catch { /* sem token, segue anônimo */ }
  })
})
