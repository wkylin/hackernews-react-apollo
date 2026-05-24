import jwt from 'jsonwebtoken'
import type { GraphQLContext } from './types.ts'

const APP_SECRET = process.env.APP_SECRET || 'GraphQL-is-aw3some'

function getUserId(context: GraphQLContext) {
  const authorization = context.request?.headers?.get('authorization')

  if (authorization) {
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, APP_SECRET)

    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      throw new Error('Invalid token')
    }

    const { userId } = payload
    return userId
  }

  throw new Error('Not authenticated')
}

export {
  APP_SECRET,
  getUserId,
}
