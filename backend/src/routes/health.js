/**
 * Rota de health check.
 *
 *  GET /api/health → retorna { status: 'ok' } se o servidor está respondendo
 *
 * Usada por monitoramento (uptime), load balancers e PM2 para verificar se
 * a aplicação está de pé antes de direcionar tráfego.
 */

export default async function healthRoutes(fastify) {
  fastify.get('/api/health', async () => {
    return { status: 'ok' }
  })
}
