import { createWriteStream, mkdirSync, existsSync, unlinkSync } from 'fs'
import { pipeline } from 'stream/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const avatarsDir = join(__dirname, '..', '..', 'uploads', 'avatars')
if (!existsSync(avatarsDir)) mkdirSync(avatarsDir, { recursive: true })

const PROFILE_SELECT = { id: true, name: true, email: true, role: true, neighborhood: true, avatarUrl: true }
const VALID_CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']

export default async function meRoutes(fastify) {
  fastify.get('/api/me/posts', {
    onRequest: [fastify.authenticate]
  }, async (req) => {
    return fastify.prisma.post.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    })
  })

  fastify.patch('/api/me/posts/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', minLength: 1, maxLength: 2000 },
          category: { type: 'string', enum: VALID_CATEGORIES },
          neighborhood: { type: 'string', minLength: 1, maxLength: 100 }
        }
      }
    }
  }, async (req, reply) => {
    const id = Number(req.params.id)
    const post = await fastify.prisma.post.findUnique({ where: { id } })
    if (!post) return reply.code(404).send({ error: 'post não encontrado' })
    if (post.userId !== req.user.userId) return reply.code(403).send({ error: 'forbidden' })

    const { title, description, category, neighborhood } = req.body
    const data = { editedAt: new Date(), status: 'PENDING' }
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (category !== undefined) data.category = category
    if (neighborhood !== undefined) data.neighborhood = neighborhood

    return fastify.prisma.post.update({ where: { id }, data })
  })

  fastify.delete('/api/me/posts/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: { type: 'object', properties: { id: { type: 'integer' } } }
    }
  }, async (req, reply) => {
    const id = Number(req.params.id)
    const post = await fastify.prisma.post.findUnique({ where: { id } })
    if (!post) return reply.code(404).send({ error: 'post não encontrado' })
    if (post.userId !== req.user.userId) return reply.code(403).send({ error: 'forbidden' })

    await fastify.prisma.post.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/api/me/profile', {
    onRequest: [fastify.authenticate]
  }, async (req) => {
    return fastify.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: PROFILE_SELECT
    })
  })

  fastify.patch('/api/me/profile', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          neighborhood: { type: 'string', maxLength: 100 }
        }
      }
    }
  }, async (req) => {
    const { name, neighborhood } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (neighborhood !== undefined) data.neighborhood = neighborhood

    return fastify.prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: PROFILE_SELECT
    })
  })

  fastify.post('/api/me/avatar', {
    onRequest: [fastify.authenticate]
  }, async (req, reply) => {
    const file = await req.file({ limits: { fileSize: 2 * 1024 * 1024 } })
    if (!file) return reply.code(400).send({ error: 'nenhum arquivo enviado' })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.mimetype)) {
      file.file.resume()
      return reply.code(400).send({ error: 'formato não suportado. Use JPG, PNG, WebP ou GIF' })
    }

    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1]
    const userId = req.user.userId

    // Remove avatar anterior (qualquer extensão)
    for (const e of ['jpg', 'png', 'webp', 'gif']) {
      try { unlinkSync(join(avatarsDir, `${userId}.${e}`)) } catch {}
    }

    const filename = `${userId}.${ext}`
    await pipeline(file.file, createWriteStream(join(avatarsDir, filename)))

    const avatarUrl = `/uploads/avatars/${filename}`
    await fastify.prisma.user.update({ where: { id: userId }, data: { avatarUrl } })

    return { avatarUrl }
  })
}
