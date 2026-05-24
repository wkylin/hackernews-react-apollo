import type { createPubSub } from 'graphql-yoga'
import type { prisma } from './prisma.ts'

export type GraphQLContext = {
  prisma: typeof prisma
  pubsub: ReturnType<typeof createPubSub>
  request: Request
}

export type ResolverParent = Record<string, unknown>

export type ResolverParentWithId = {
  id: string
}
