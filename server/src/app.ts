import { createYoga, createSchema, createPubSub } from 'graphql-yoga'
import { prisma } from './prisma.ts'
import Query from './resolvers/Query.ts'
import Mutation from './resolvers/Mutation.ts'
import Subscription from './resolvers/Subscription.ts'
import User from './resolvers/User.ts'
import Link from './resolvers/Link.ts'
import Vote from './resolvers/Vote.ts'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8')
const pubsub = createPubSub()

function createApp() {
  const frontendOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://hacker.wkylin.cn',
    ...(process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
  ]

  return createYoga({
    cors: {
      origin: Array.from(new Set(frontendOrigins)),
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'OPTIONS'],
    },
    schema: createSchema({
      typeDefs,
      resolvers: {
        Query,
        Mutation,
        Subscription,
        User,
        Link,
        Vote,
      },
    }),
    graphqlEndpoint: '/',
    context: ({ request }) => ({
      prisma,
      pubsub,
      request,
    }),
  })
}

export { createApp }
