/**
 * Script de seed do banco de dados.
 *
 * Cria o usuário administrador inicial a partir das variáveis de ambiente:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 *
 * Seguro para rodar múltiplas vezes — verifica se o admin já existe antes de criar.
 *
 * Uso:
 *   node prisma/seed.js
 *   npm run prisma:seed
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
  console.error('Defina ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME no .env')
  process.exit(1)
}

const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })

if (existing) {
  console.log(`Admin já existe: ${ADMIN_EMAIL}`)
} else {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.user.create({
    data: { email: ADMIN_EMAIL, name: ADMIN_NAME, passwordHash, role: 'ADMIN' }
  })
  console.log(`Admin criado: ${ADMIN_EMAIL}`)
}

await prisma.$disconnect()
