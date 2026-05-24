import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApolloCache, gql, useMutation } from '@apollo/client'
import { FEED_QUERY } from './LinkList'
import { HEADER_QUERY } from './Header'
import { LINKS_PER_PAGE } from '../constants'
import { useAuth } from '../auth'
import type { FeedData, FeedVariables, LinkItem } from '../types'

const POST_MUTATION = gql`
    mutation PostMutation($description: String!, $url: String!) {
        post(description: $description, url: $url) {
            id
            createdAt
            url
            description
            postedBy {
              id
              name
            }
            votes {
              id
              user {
                id
              }
            }
        }
    }
`

type PostMutationData = {
  post: LinkItem
}

function CreateLink() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [postMutation, { error, loading }] = useMutation(POST_MUTATION, {
    variables: { description, url },
    onCompleted: () => navigate('/new/1'),
    refetchQueries: [{ query: HEADER_QUERY }],
    update: (store: ApolloCache<unknown>, { data }) => {
      const post = data?.post

      if (!post) {
        return
      }

      const first = LINKS_PER_PAGE
      const skip = 0
      const orderBy = 'createdAt_DESC' as const
      const variables = { first, skip, orderBy }
      const cacheData = store.readQuery<FeedData, FeedVariables>({
        query: FEED_QUERY,
        variables,
      })

      if (!cacheData) {
        return
      }

      store.writeQuery<FeedData, FeedVariables>({
        query: FEED_QUERY,
        data: {
          ...cacheData,
          feed: {
            ...cacheData.feed,
            links: [post, ...cacheData.feed.links],
          },
        },
        variables,
      })
    },
  })

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Submit</h1>
      </div>
      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault()
          postMutation()
        }}
      >
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          value={description}
          onChange={e => setDescription(e.target.value)}
          type="text"
          placeholder="Title"
        />
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          value={url}
          onChange={e => setUrl(e.target.value)}
          type="text"
          placeholder="URL"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          {loading ? 'submitting' : 'submit'}
        </button>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </form>
    </div>
  )
}

export default CreateLink
