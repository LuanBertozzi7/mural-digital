/**
 * Rotas públicas de posts.
 *
 *  GET  /api/posts  → feed paginado de posts aprovados, com filtro por
 *                     categoria, bairro e busca textual (título/descrição/bairro)
 *  POST /api/posts  → cria post com status PENDING; aceita usuários autenticados
 *                     (post vinculado ao userId) e anônimos (userId = null)
 */

const VALID_CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']

export default async function postsRoutes(fastify) {
  fastify.get('/api/posts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category:     { type: 'string', enum: VALID_CATEGORIES },
          neighborhood: { type: 'string' },
          q:            { type: 'string' },
          page:         { type: 'integer', minimum: 1, default: 1 }
        }
      }
    }
  }, async (req) => {
    const { category, neighborhood, q, page = 1 } = req.query
    const PAGE_SIZE = 20

    const where = { status: 'APPROVED' }
    if (category)     where.category = category
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' }
    if (q) {
      where.OR = [
        { title:        { contains: q, mode: 'insensitive' } },
        { description:  { contains: q, mode: 'insensitive' } },
        { neighborhood: { contains: q, mode: 'insensitive' } }
      ]
    }

    const posts = await fastify.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, avatarUrl: true } } }
    })

    // Serialização explícita: garante que o campo `user` (relação interna)
    // não vaze diretamente para o cliente — apenas os campos necessários são expostos.
    return posts.map((p) => ({
      id:           p.id,
      title:        p.title,
      description:  p.description,
      category:     p.category,
      neighborhood: p.neighborhood,
      status:       p.status,
      author:       p.user?.name ?? 'Anônimo',
      authorAvatar: p.user?.avatarUrl ?? null,
      editedAt:     p.editedAt,
      createdAt:    p.createdAt
    }))
  })

  fastify.get('/api/posts/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      }
    }
  }, async (req, reply) => {
    const post = await fastify.prisma.post.findFirst({
      where: { id: req.params.id, status: 'APPROVED' },
      include: { user: { select: { name: true, avatarUrl: true } } }
    })
    if (!post) return reply.code(404).send({ error: 'Post não encontrado' })
    return {
      id:           post.id,
      title:        post.title,
      description:  post.description,
      category:     post.category,
      neighborhood: post.neighborhood,
      author:       post.user?.name ?? 'Anônimo',
      authorAvatar: post.user?.avatarUrl ?? null,
      editedAt:     post.editedAt,
      createdAt:    post.createdAt,
    }
  })

  fastify.post('/api/posts', {
    onRequest: [fastify.optionalAuth],
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description', 'category', 'neighborhood'],
        properties: {
          title:        { type: 'string', minLength: 1, maxLength: 200 },
          description:  { type: 'string', minLength: 1, maxLength: 2000 },
          category:     { type: 'string', enum: VALID_CATEGORIES },
          neighborhood: { type: 'string', minLength: 1, maxLength: 100 }
        }
      }
    }
  }, async (req, reply) => {
    const { title, description, category, neighborhood } = req.body

    // Posts anônimos têm userId null; posts autenticados ficam vinculados ao autor.
    const userId = req.user?.userId ?? null

    const post = await fastify.prisma.post.create({
      data: { title, description, category, neighborhood, userId }
    })

    return reply.code(201).send(post)
  })
}
