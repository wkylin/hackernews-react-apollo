import type { GraphQLContext, ResolverParentWithId } from '../types.ts'

function postedBy(parent: ResolverParentWithId, args: ResolverParentWithId, context: GraphQLContext) {
  return context.prisma.link.findUnique({ where: { id: parent.id } }).postedBy()
}

function votes(parent: ResolverParentWithId, args: ResolverParentWithId, context: GraphQLContext) {
  return context.prisma.link.findUnique({ where: { id: parent.id } }).votes()
}

export default {
  postedBy,
  votes,
}
