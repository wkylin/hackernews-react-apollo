import React, { useState } from 'react'
import { gql, useApolloClient } from '@apollo/client'
import Link from './Link'
import type { FeedData, LinkItem } from '../types'

const FEED_SEARCH_QUERY = gql`
    query FeedSearchQuery($filter: String!) {
        feed(filter: $filter) {
            links {
                id
                url
                description
                createdAt
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
    }
`


function Search() {
  const client = useApolloClient()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [filter, setFilter] = useState('')

  const executeSearch = async () => {
    const result = await client.query<FeedData>({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    setLinks(result.data.feed.links)
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-4 text-2xl font-semibold text-slate-900">Search</div>
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <button
          onClick={executeSearch}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          OK
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    </div>
  )
}

export default Search
