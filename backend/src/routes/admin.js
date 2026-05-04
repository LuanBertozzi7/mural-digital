/**
 * Rotas do painel de moderação (/api/admin/*).
 *
 * Todas as rotas exigem JWT válido com role ADMIN (fastify.requireAdmin).
 *
 *  GET    /api/admin/posts       → lista todos os posts, opcionalmente filtrados por status
 *  PATCH  /api/admin/posts/:id   → altera o status de um post (PENDING/APPROVED/REJECTED)
 *  DELETE /api/admin/posts/:id   → remove um post permanentemente
 */

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED']

export default async function adminRoutes(fastify) {
  fastify.get('/api/admin/posts', {
    onRequest: [fastify.requireAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: VALID_STATUSES }
        }
      }
    }
  }, async (req) => {
    const where = {}
    if (req.query.status) where.status = req.query.status

    return fastify.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    })
  })

  fastify.patch('/api/admin/posts/:id', {
    onRequest: [fastify.requireAdmin],
    schema: {
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        required: ['status'],
        properties: { status: { type: 'string', enum: VALID_STATUSES } }
      }
    }
  }, async (req, reply) => {
    const id = Number(req.params.id)
    const post = await fastify.prisma.post.findUnique({ where: { id } })
    if (!post) return reply.code(404).send({ error: 'post não encontrado' })

    return fastify.prisma.post.update({
      where: { id },
      data: { status: req.body.status }
    })
  })

  fastify.delete('/api/admin/posts/:id', {
    onRequest: [fastify.requireAdmin],
    schema: {
      params: { type: 'object', properties: { id: { type: 'integer' } } }
    }
  }, async (req, reply) => {
    const id = Number(req.params.id)
    const post = await fastify.prisma.post.findUnique({ where: { id } })
    if (!post) return reply.code(404).send({ error: 'post não encontrado' })

    await fastify.prisma.post.delete({ where: { id } })
    return reply.code(204).send()
  })
}
