/**
 * Rotas de autenticação.
 *
 *  POST /api/auth/register  → cria conta e retorna JWT + dados do usuário
 *  POST /api/auth/login     → autentica e retorna JWT + dados do usuário
 *
 * Ambas as rotas têm rate limit próprio (10 tentativas / 15 min por IP)
 * para proteger contra ataques de força bruta e cadastros em massa.
 */

import bcrypt from 'bcryptjs'

// Rate limit restritivo compartilhado pelas rotas de autenticação.
// Mais apertado que o global (100/min) porque login é o alvo principal de brute force.
const AUTH_RATE_LIMIT = { max: 10, timeWindow: '15 minutes' }

export default async function authRoutes(fastify) {
  fastify.post('/api/auth/register', {
    config: { rateLimit: AUTH_RATE_LIMIT },
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 1, maxLength: 100 },
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (req, reply) => {
    const { name, email, password } = req.body

    const existing = await fastify.prisma.user.findUnique({ where: { email } })
    if (existing) return reply.code(409).send({ error: 'email já cadastrado' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await fastify.prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true }
    })

    const token = await reply.jwtSign({ userId: user.id, role: user.role })
    return reply.code(201).send({ token, user })
  })

  fastify.post('/api/auth/login', {
    config: { rateLimit: AUTH_RATE_LIMIT },
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (req, reply) => {
    const { email, password } = req.body

    const user = await fastify.prisma.user.findUnique({ where: { email } })

    // Mensagem genérica intencional: não revelar se o email existe ou não.
    if (!user) return reply.code(401).send({ error: 'credenciais inválidas' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return reply.code(401).send({ error: 'credenciais inválidas' })

    const token = await reply.jwtSign({ userId: user.id, role: user.role })
    return reply.send({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    })
  })
}
