import { mkdirSync, existsSync, unlinkSync } from 'fs'
import { writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const avatarsDir = join(__dirname, '..', '..', 'uploads', 'avatars')
if (!existsSync(avatarsDir)) mkdirSync(avatarsDir, { recursive: true })

const PROFILE_SELECT = { id: true, name: true, email: true, role: true, neighborhood: true, avatarUrl: true }
import { VALID_CATEGORIES } from '../constants.js'

/**
 * Verifica a assinatura binária (magic bytes) do buffer para confirmar
 * que o arquivo é de fato um dos formatos de imagem suportados.
 *
 * O MIME type enviado pelo cliente NÃO pode ser confiado isoladamente —
 * qualquer arquivo pode ser renomeado com extensão de imagem. Checar os
 * primeiros bytes é a única forma confiável de validar o tipo real do arquivo.
 */
function hasValidImageSignature(buf) {
  if (buf.length < 12) return false
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true // PNG
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return true // GIF
  // WebP é um container RIFF: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP"
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return true
  return false
}

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
          title:        { type: 'string', minLength: 1, maxLength: 200 },
          description:  { type: 'string', minLength: 1, maxLength: 2000 },
          category:     { type: 'string', enum: VALID_CATEGORIES },
          neighborhood: { type: 'string', minLength: 1, maxLength: 100 },
          contact:      { type: 'string', maxLength: 100 }
        }
      }
    }
  }, async (req, reply) => {
    const id = Number(req.params.id)
    const post = await fastify.prisma.post.findUnique({ where: { id } })
    if (!post) return reply.code(404).send({ error: 'post não encontrado' })
    if (post.userId !== req.user.userId) return reply.code(403).send({ error: 'forbidden' })

    const { title, description, category, neighborhood, contact } = req.body

    const data = { editedAt: new Date(), status: 'PENDING' }
    if (title !== undefined)        data.title = title
    if (description !== undefined)  data.description = description
    if (category !== undefined)     data.category = category
    if (neighborhood !== undefined) data.neighborhood = neighborhood
    if (contact !== undefined)      data.contact = contact?.trim() || null

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
          name:         { type: 'string', minLength: 1, maxLength: 100 },
          neighborhood: { type: 'string', maxLength: 100 }
        }
      }
    }
  }, async (req) => {
    const { name, neighborhood } = req.body
    const data = {}
    if (name !== undefined)         data.name = name
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

    // Coleta o arquivo inteiro em memória antes de gravar no disco.
    // Necessário para: (1) detectar truncamento por limite de tamanho,
    // e (2) validar a assinatura binária antes de qualquer escrita.
    let truncated = false
    const chunks = []
    file.file.on('limit', () => { truncated = true })
    for await (const chunk of file.file) chunks.push(chunk)

    if (truncated) {
      return reply.code(413).send({ error: 'arquivo muito grande. Máximo 2 MB' })
    }

    const buffer = Buffer.concat(chunks)

    if (!hasValidImageSignature(buffer)) {
      return reply.code(400).send({ error: 'o arquivo enviado não é uma imagem válida' })
    }

    const ext = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1]
    const userId = req.user.userId

    // Remove avatar anterior em qualquer extensão antes de gravar o novo,
    // evitando arquivos órfãos caso o formato mude entre uploads.
    for (const e of ['jpg', 'png', 'webp', 'gif']) {
      try { unlinkSync(join(avatarsDir, `${userId}.${e}`)) } catch {}
    }

    const filename = `${userId}.${ext}`
    await writeFile(join(avatarsDir, filename), buffer)

    const avatarUrl = `/uploads/avatars/${filename}`
    await fastify.prisma.user.update({ where: { id: userId }, data: { avatarUrl } })

    return { avatarUrl }
  })
}
