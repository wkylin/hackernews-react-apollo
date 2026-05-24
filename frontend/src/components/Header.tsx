import React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useAuth } from '../auth'
import type { LinkItem } from '../types'

type HeaderData = {
  me: {
    id: string
    name: string
    links: Pick<LinkItem, 'id'>[]
  } | null
}

export const HEADER_QUERY = gql`
  query HeaderQuery {
    me {
      id
      name
      links {
        id
      }
    }
  }
`

function Header() {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { token, clearToken } = useAuth()
  const { data, loading, error } = useQuery<HeaderData>(HEADER_QUERY, {
    skip: !token,
    fetchPolicy: 'network-only',
  })
  const user = data?.me

  const handleLogout = async () => {
    clearToken()
    await client.clearStore()
    navigate('/new/1')
  }

  return (
    <header className="border-b border-orange-200 bg-orange-500 text-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <RouterLink
            to="/new/1"
            className="inline-flex h-7 w-7 items-center justify-center border border-white/70 bg-orange-500 text-xs font-bold text-white"
          >
            Y
          </RouterLink>
          <RouterLink to="/new/1" className="whitespace-nowrap font-bold">
            Hacker News
          </RouterLink>
          <nav className="flex flex-wrap items-center gap-2">
            <RouterLink to="/new/1" className="whitespace-nowrap hover:text-white/90">
              new
            </RouterLink>
            <span>|</span>
            <RouterLink to="/top" className="whitespace-nowrap hover:text-white/90">
              top
            </RouterLink>
            <span>|</span>
            <RouterLink to="/search" className="whitespace-nowrap hover:text-white/90">
              search
            </RouterLink>
            {token && (
              <>
                <span>|</span>
                <RouterLink to="/submit" className="whitespace-nowrap hover:text-white/90">
                  submit
                </RouterLink>
              </>
            )}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {token ? (
            loading ? (
              <span className="whitespace-nowrap text-slate-900/70">loading</span>
            ) : user && !error ? (
              <>
                <RouterLink
                  to={`/user?id=${encodeURIComponent(user.name)}`}
                  className="whitespace-nowrap font-medium hover:text-white"
                >
                  {user.name} ({user.links.length})
                </RouterLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="whitespace-nowrap text-slate-950 hover:text-white"
                >
                  logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap text-slate-950 hover:text-white"
              >
                logout
              </button>
            )
          ) : (
            <RouterLink to="/login" className="whitespace-nowrap hover:text-white/90">
              login
            </RouterLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
