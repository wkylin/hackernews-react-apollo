import type { GraphQLContext, ResolverParentWithId } from '../types.ts'

function link(parent: ResolverParentWithId, args: ResolverParentWithId, context: GraphQLContext) {
  return context.prisma.vote.findUnique({ where: { id: parent.id } }).link()
}

function user(parent: ResolverParentWithId, args: ResolverParentWithId, context: GraphQLContext) {
  return context.prisma.vote.findUnique({ where: { id: parent.id } }).user()
}

export default {
  link,
  user,
}
