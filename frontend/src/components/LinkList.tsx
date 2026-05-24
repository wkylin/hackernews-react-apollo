import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApolloCache, gql, useQuery } from '@apollo/client'
import Link from './Link'
import { LINKS_PER_PAGE } from '../constants'
import type { FeedData, FeedVariables, LinkItem, VoteMutationData } from '../types'

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

function getQueryVariables(pathname: string, pageParam?: string): FeedVariables {
  const isNewPage = pathname.includes('new')
  const page = parseInt(pageParam || '1', 10)
  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? 'createdAt_DESC' : null

  return { first, skip, orderBy }
}

function getLinksToRender(data: FeedData, pathname: string): LinkItem[] {
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
  const { loading, error, data } = useQuery<FeedData, FeedVariables>(FEED_QUERY, {
    variables,
  })

  const updateCacheAfterVote = (
    store: ApolloCache<unknown>,
    createVote: VoteMutationData['vote'],
    linkId: string
  ) => {
    const cacheData = store.readQuery<FeedData, FeedVariables>({
      query: FEED_QUERY,
      variables,
    })

    if (!cacheData) {
      return
    }

    const links = cacheData.feed.links.map((link: LinkItem) =>
      link.id === linkId ? { ...link, votes: createVote.link.votes } : link
    )

    store.writeQuery<FeedData, FeedVariables>({
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
    const page = parseInt(params.page || '1', 10)
    if (data && page <= data.feed.count / LINKS_PER_PAGE) {
      navigate(`/new/${page + 1}`)
    }
  }

  const previousPage = () => {
    const page = parseInt(params.page || '1', 10)
    if (page > 1) {
      navigate(`/new/${page - 1}`)
    }
  }

  if (loading) return <div className="py-8 text-sm text-slate-500">Fetching</div>
  if (error) return <div className="py-8 text-sm text-red-600">Error</div>
  if (!data) return null

  const linksToRender = getLinksToRender(data, location.pathname)
  const isNewPage = location.pathname.includes('new')
  const pageIndex = params.page ? (parseInt(params.page, 10) - 1) * LINKS_PER_PAGE : 0

  return (
    <div className="space-y-3">
      {linksToRender.map((link, index) => (
        <Link
          key={link.id}
          link={link}
          index={index + pageIndex}
          updateStoreAfterVote={updateCacheAfterVote}
        />
      ))}
      {isNewPage && (
        <div className="flex items-center gap-3 pt-3 text-sm text-slate-500">
          <button type="button" className="hover:text-slate-900" onClick={previousPage}>
            Previous
          </button>
          <button type="button" className="hover:text-slate-900" onClick={nextPage}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default LinkList
