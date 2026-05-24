import type { GraphQLContext, ResolverParentWithId } from '../types.ts'

function links(parent: ResolverParentWithId, args: ResolverParentWithId, context: GraphQLContext) {
  return context.prisma.user.findUnique({ where: { id: parent.id } }).links()
}

export default {
  links,
}
