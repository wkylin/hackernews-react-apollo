import React from 'react'
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import Link from './Link'
import { useAuth } from '../auth'
import type { LinkItem } from '../types'

const USER_PROFILE_QUERY = gql`
  query UserProfileQuery($id: String!) {
    user(id: $id) {
      id
      name
      email
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
    }
  }
`

type UserProfileData = {
  user: {
    id: string
    name: string
    email: string
    links: LinkItem[]
  } | null
}

function UserProfile() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const { data, loading, error } = useQuery<UserProfileData>(USER_PROFILE_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  })

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!id) {
    return <div className="py-8 text-sm text-red-600">Missing user id.</div>
  }

  if (loading) {
    return <div className="py-8 text-sm text-slate-500">Fetching profile</div>
  }

  if (error) {
    return <div className="py-8 text-sm text-red-600">{error.message}</div>
  }

  if (!data?.user) {
    return <div className="py-8 text-sm text-slate-500">User not found.</div>
  }

  const user = data.user
  const karma = user.links.reduce((total, link) => total + link.votes.length, 0)

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Your profile collects account details and submitted stories.
      </div>

      <div className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-[160px_1fr]">
        <div className="text-sm font-semibold text-slate-500">user</div>
        <div className="text-sm font-semibold text-green-700">{user.name}</div>

        <div className="text-sm font-semibold text-slate-500">email</div>
        <div className="break-all text-sm text-slate-900">{user.email}</div>

        <div className="text-sm font-semibold text-slate-500">karma</div>
        <div className="text-sm text-slate-900">{karma}</div>

        <div className="text-sm font-semibold text-slate-500">submissions</div>
        <div className="text-sm text-slate-900">{user.links.length}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <RouterLink to="/submit" className="font-medium text-slate-900 underline">
          submit a story
        </RouterLink>
        <RouterLink to="/new/1" className="font-medium text-slate-900 underline">
          back to news
        </RouterLink>
      </div>

      <div className="mt-8">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Submissions</h1>
        {user.links.length > 0 ? (
          <div className="space-y-3">
            {user.links.map((link, index) => (
              <Link key={link.id} link={link} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No submissions yet.
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
