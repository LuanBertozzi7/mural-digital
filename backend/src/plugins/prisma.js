/**
 * Plugin do Prisma ORM.
 *
 * Cria e conecta um único PrismaClient compartilhado entre todas as rotas,
 * exposto como `fastify.prisma`. A conexão é encerrada corretamente quando
 * o servidor é fechado (onClose hook).
 *
 * Uso nas rotas:
 *   fastify.prisma.user.findUnique(...)
 *   fastify.prisma.post.create(...)
 */

import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

export default fp(async (fastify) => {
  const prisma = new PrismaClient()
  await prisma.$connect()
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
