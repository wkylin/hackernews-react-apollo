import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils.ts'
import type { GraphQLContext, ResolverParent } from '../types.ts'

type PostArgs = {
  url: string
  description: string
}

type SignupArgs = {
  email: string
  password: string
  name: string
}

type LoginArgs = {
  email: string
  password: string
}

type VoteArgs = {
  linkId: string
}

async function post(
  parent: ResolverParent,
  { url, description }: PostArgs,
  context: GraphQLContext
) {
  const userId = getUserId(context)
  const link = await context.prisma.link.create({
    data: {
      url,
      description,
      postedBy: {
        connect: {
          id: userId,
        },
      },
    },
  })

  context.pubsub.publish('newLink', link)
  return link
}

async function signup(parent: ResolverParent, args: SignupArgs, context: GraphQLContext) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.user.create({
    data: { ...args, password },
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function login(parent: ResolverParent, args: LoginArgs, context: GraphQLContext) {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  })
  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
  }
}

async function vote(parent: ResolverParent, args: VoteArgs, context: GraphQLContext) {
  const userId = getUserId(context)
  const existingVote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: args.linkId,
        userId,
      },
    },
  })
  if (existingVote) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  const vote = await context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: args.linkId } },
    },
    include: {
      user: true,
      link: {
        include: {
          postedBy: true,
          votes: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  context.pubsub.publish('newVote', vote)
  return vote
}

export default {
  post,
  signup,
  login,
  vote,
}
