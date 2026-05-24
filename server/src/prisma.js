import prismaClient from '@prisma/client'

const { PrismaClient } = prismaClient

const prisma = new PrismaClient()

export { prisma }
