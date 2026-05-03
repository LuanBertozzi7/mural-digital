export default async function healthRoutes(fastify) {
  fastify.get('/api/health', async () => {
    return { status: 'ok' }
  })
}
