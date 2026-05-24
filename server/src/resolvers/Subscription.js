function newLinkSubscribe(parent, args, context) {
  return context.pubsub.subscribe('newLink')
}

const newLink = {
  subscribe: newLinkSubscribe,
  resolve: payload => {
    return payload
  },
}

function newVoteSubscribe(parent, args, context) {
  return context.pubsub.subscribe('newVote')
}

const newVote = {
  subscribe: newVoteSubscribe,
  resolve: payload => {
    return payload
  },
}

export default {
  newLink,
  newVote,
}
