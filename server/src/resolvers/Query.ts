import { getUserId } from '../utils.ts'
import type { GraphQLContext, ResolverParent } from '../types.ts'

type FeedArgs = {
  filter?: string
  skip?: number
  first?: number
  orderBy?: string | null
}

type UserArgs = {
  id: string
}

async function feed(parent: ResolverParent, args: FeedArgs, context: GraphQLContext) {
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.filter } },
        ],
      }
    : {}

  const count = await context.prisma.link.count({ where })
  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.first,
    orderBy: parseLinkOrderBy(args.orderBy),
  })

  return {
    count,
    links,
  }
}

async function me(parent: ResolverParent, args: ResolverParent, context: GraphQLContext) {
  try {
    const userId = getUserId(context)
    return context.prisma.user.findUnique({
      where: { id: userId },
      include: {
        links: {
          select: {
            id: true,
          },
        },
      },
    })
  } catch (error) {
    return null
  }
}

async function user(parent: ResolverParent, args: UserArgs, context: GraphQLContext) {
  return context.prisma.user.findFirst({
    where: {
      OR: [{ id: args.id }, { name: args.id }],
    },
  })
}

function parseLinkOrderBy(orderBy?: string | null) {
  if (!orderBy) {
    return undefined
  }

  const [field, direction] = orderBy.split('_')
  return {
    [field]: direction.toLowerCase(),
  }
}

export default {
  me,
  user,
  feed,
}
