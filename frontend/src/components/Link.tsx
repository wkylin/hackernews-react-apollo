import React from 'react'
import { timeDifferenceForDate } from '../utils'
import { ApolloCache, gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { useAuth } from '../auth'
import type { LinkItem, VoteMutationData } from '../types'

const VOTE_MUTATION = gql`
    mutation VoteMutation($linkId: ID!) {
        vote(linkId: $linkId) {
            id
            link {
                id
                votes {
                    id
                    user {
                        id
                    }
                }
            }
            user {
                id
            }
        }
    }
`
type LinkProps = {
  link: LinkItem
  index: number
  updateStoreAfterVote?: (
    store: ApolloCache<unknown>,
    createVote: VoteMutationData['vote'],
    linkId: string
  ) => void
}

function Link({ link, index, updateStoreAfterVote }: LinkProps) {
  const { token } = useAuth()

  return (
    <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm transition hover:border-orange-200 hover:shadow-md">
      <div className="flex w-12 shrink-0 items-center justify-end gap-1 pt-0.5 text-sm text-slate-400">
        <span>{index + 1}.</span>
        {token && (
          <Mutation
            mutation={VOTE_MUTATION}
            variables={{ linkId: link.id }}
            update={(store, { data: { vote } }) =>
              updateStoreAfterVote?.(store, vote, link.id)
            }
          >
            {voteMutation => (
              <button
                type="button"
                onClick={() => voteMutation()}
                className="text-xs font-bold leading-none text-orange-500 transition hover:text-orange-600"
              >
                ▲
              </button>
            )}
          </Mutation>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-slate-900">
          {link.description}{' '}
          {link.url && <span className="text-slate-500">({link.url})</span>}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {link.votes.length} votes by{' '}
          {link.postedBy ? link.postedBy.name : 'Unknown'}{' '}
          {timeDifferenceForDate(link.createdAt)}
        </div>
      </div>
    </div>
  )
}

export default Link
