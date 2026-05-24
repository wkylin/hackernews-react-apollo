import React, { useState } from 'react'
import { gql, useApolloClient } from '@apollo/client'
import Link from './Link.jsx'

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
  const [links, setLinks] = useState([])
  const [filter, setFilter] = useState('')

  const executeSearch = async () => {
    const result = await client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    setLinks(result.data.feed.links)
  }

  return (
    <div>
      <div>
        Search
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <button onClick={executeSearch}>OK</button>
      </div>
      {links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  )
}

export default Search
