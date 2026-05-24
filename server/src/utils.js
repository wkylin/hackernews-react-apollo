import jwt from 'jsonwebtoken'

const APP_SECRET = process.env.APP_SECRET || 'GraphQL-is-aw3some'

function getUserId(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error('Not authenticated')
}

export {
  APP_SECRET,
  getUserId,
}
