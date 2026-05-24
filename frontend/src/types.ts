export type UserSummary = {
  id: string
  name: string
}

export type VoteSummary = {
  id: string
  user: {
    id: string
  }
}

export type LinkItem = {
  id: string
  createdAt: string
  url: string
  description: string
  postedBy?: UserSummary | null
  votes: VoteSummary[]
}

export type FeedData = {
  feed: {
    links: LinkItem[]
    count: number
  }
}

export type FeedVariables = {
  first?: number
  skip?: number
  orderBy?: 'createdAt_DESC' | null
}

export type VoteMutationData = {
  vote: {
    id: string
    link: {
      id: string
      votes: VoteSummary[]
    }
    user: {
      id: string
    }
  }
}
