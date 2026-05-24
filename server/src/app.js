import { createYoga, createSchema, createPubSub } from 'graphql-yoga'
import { prisma } from './prisma.js'
import Query from './resolvers/Query.js'
import Mutation from './resolvers/Mutation.js'
import Subscription from './resolvers/Subscription.js'
import User from './resolvers/User.js'
import Link from './resolvers/Link.js'
import Vote from './resolvers/Vote.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8')
const pubsub = createPubSub()

function createApp() {
  return createYoga({
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
    context: () => ({
      prisma,
      pubsub,
    }),
  })
}

export { createApp }
