export default async function meRoutes(fastify) {
  fastify.get('/api/me/posts', {
    onRequest: [fastify.authenticate]
  }, async (req) => {
    const posts = await fastify.prisma.post.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    })
    return posts
  })
}
