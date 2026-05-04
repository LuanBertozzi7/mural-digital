const VALID_CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']

export default async function postsRoutes(fastify) {
  fastify.get('/api/posts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: VALID_CATEGORIES },
          neighborhood: { type: 'string' },
          q: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 }
        }
      }
    }
  }, async (req) => {
    const { category, neighborhood, q, page = 1 } = req.query
    const PAGE_SIZE = 20

    const where = { status: 'APPROVED' }
    if (category) where.category = category
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' }
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { neighborhood: { contains: q, mode: 'insensitive' } }
    ]

    const posts = await fastify.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true } } }
    })

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      neighborhood: p.neighborhood,
      status: p.status,
      author: p.user?.name ?? 'Anônimo',
      createdAt: p.createdAt
    }))
  })

  fastify.post('/api/posts', {
    onRequest: [fastify.optionalAuth],
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description', 'category', 'neighborhood'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', minLength: 1, maxLength: 2000 },
          category: { type: 'string', enum: VALID_CATEGORIES },
          neighborhood: { type: 'string', minLength: 1, maxLength: 100 }
        }
      }
    }
  }, async (req, reply) => {
    const { title, description, category, neighborhood } = req.body
    const userId = req.user?.userId ?? null

    const post = await fastify.prisma.post.create({
      data: { title, description, category, neighborhood, userId }
    })

    return reply.code(201).send(post)
  })
}
