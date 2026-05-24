import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/prisma/client.ts'

function getDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  const url = new URL(process.env.DATABASE_URL)

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectTimeout: 5_000,
    idleTimeout: 300,
  }
}

const adapter = new PrismaMariaDb(getDatabaseConfig())
const prisma = new PrismaClient({ adapter })

export { prisma }
