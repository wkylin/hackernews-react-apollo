import type { GraphQLContext, ResolverParent } from '../types.ts'

function newLinkSubscribe(parent: ResolverParent, args: ResolverParent, context: GraphQLContext) {
  return context.pubsub.subscribe('newLink')
}

const newLink = {
  subscribe: newLinkSubscribe,
  resolve: (payload: unknown) => {
    return payload
  },
}

function newVoteSubscribe(parent: ResolverParent, args: ResolverParent, context: GraphQLContext) {
  return context.pubsub.subscribe('newVote')
}

const newVote = {
  subscribe: newVoteSubscribe,
  resolve: (payload: unknown) => {
    return payload
  },
}

export default {
  newLink,
  newVote,
}
