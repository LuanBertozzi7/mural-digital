import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null }
    })
  })

  fastify.post('/api/auth/forgot-password', {
    config: { rateLimit: AUTH_RATE_LIMIT },
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } }
      }
    }
  }, async (req, reply) => {
    const { email } = req.body

    const user = await fastify.prisma.user.findUnique({ where: { email } })

    // Resposta idêntica independente de o email existir ou não — não vazar se o email está cadastrado
    if (!user) return reply.send({ ok: true })

    // Remove tokens antigos desse usuário antes de criar um novo
    await fastify.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await fastify.prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt }
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    if (!process.env.SMTP_USER) {
      fastify.log.info(`[dev] link de reset para ${user.email}: ${resetUrl}`)
      return reply.send({ ok: true })
    }

    await fastify.sendMail({
      to: user.email,
      subject: 'Redefinir senha — Mural Digital',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="background:#2563eb;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:24px">
            <span style="color:#fff;font-weight:700;font-size:16px;line-height:36px;display:block;text-align:center">M</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:20px;color:#111827">Redefinir sua senha</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280">
            Recebemos um pedido para redefinir a senha da conta associada a <strong>${user.email}</strong>.
            Se não foi você, pode ignorar este e-mail.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
            Redefinir senha
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
            O link expira em 1 hora. Se preferir, cole este endereço no navegador:<br>
            <a href="${resetUrl}" style="color:#6b7280;word-break:break-all">${resetUrl}</a>
          </p>
        </div>
      `,
    })

    return reply.send({ ok: true })
  })

  fastify.post('/api/auth/reset-password', {
    config: { rateLimit: AUTH_RATE_LIMIT },
    schema: {
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token:    { type: 'string' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (req, reply) => {
    const { token, password } = req.body

    const record = await fastify.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!record || record.expiresAt < new Date()) {
      await fastify.prisma.passwordResetToken.deleteMany({ where: { token } })
      return reply.code(400).send({ error: 'Link inválido ou expirado. Solicite um novo.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await fastify.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    })
    await fastify.prisma.passwordResetToken.delete({ where: { id: record.id } })

    return reply.send({ ok: true })
  })
}
