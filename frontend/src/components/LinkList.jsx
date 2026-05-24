import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import Link from './Link.jsx'
import { LINKS_PER_PAGE } from '../constants'

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
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
      count
    }
  }
`

function getQueryVariables(pathname, pageParam) {
  const isNewPage = pathname.includes('new')
  const page = parseInt(pageParam, 10)
  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? 'createdAt_DESC' : null

  return { first, skip, orderBy }
}

function getLinksToRender(data, pathname) {
  if (pathname.includes('new')) {
    return data.feed.links
  }

  return data.feed.links.slice().sort((l1, l2) => l2.votes.length - l1.votes.length)
}

function LinkList() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const variables = getQueryVariables(location.pathname, params.page)
  const { loading, error, data } = useQuery(FEED_QUERY, { variables })

  const updateCacheAfterVote = (store, createVote, linkId) => {
    const cacheData = store.readQuery({
      query: FEED_QUERY,
      variables,
    })

    if (!cacheData) {
      return
    }

    const links = cacheData.feed.links.map(link =>
      link.id === linkId ? { ...link, votes: createVote.link.votes } : link
    )

    store.writeQuery({
      query: FEED_QUERY,
      data: {
        ...cacheData,
        feed: {
          ...cacheData.feed,
          links,
        },
      },
      variables,
    })
  }

  const nextPage = () => {
    const page = parseInt(params.page, 10)
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      navigate(`/new/${page + 1}`)
    }
  }

  const previousPage = () => {
    const page = parseInt(params.page, 10)
    if (page > 1) {
      navigate(`/new/${page - 1}`)
    }
  }

  if (loading) return <div>Fetching</div>
  if (error) return <div>Error</div>

  const linksToRender = getLinksToRender(data, location.pathname)
  const isNewPage = location.pathname.includes('new')
  const pageIndex = params.page ? (params.page - 1) * LINKS_PER_PAGE : 0

  return (
    <div>
      {linksToRender.map((link, index) => (
        <Link
          key={link.id}
          link={link}
          index={index + pageIndex}
          updateStoreAfterVote={updateCacheAfterVote}
        />
      ))}
      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={previousPage}>
            Previous
          </div>
          <div className="pointer" onClick={nextPage}>
            Next
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkList
