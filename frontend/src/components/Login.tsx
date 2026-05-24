import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gql, useMutation } from '@apollo/client'
import { useAuth } from '../auth'

const SIGNUP_MUTATION = gql`
    mutation SignupMutation($email: String!, $password: String!, $name: String!) {
        signup(email: $email, password: $password, name: $name) {
            token
        }
    }
`

const LOGIN_MUTATION = gql`
    mutation LoginMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`

function Login() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [login, setLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authenticate, { error, loading }] = useMutation(
    login ? LOGIN_MUTATION : SIGNUP_MUTATION
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const variables = login ? { email, password } : { email, password, name }
    const { data } = await authenticate({ variables })
    const token = login ? data.login.token : data.signup.token
    setToken(token)
    navigate('/new/1')
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          {login ? 'Login' : 'Sign Up'}
        </h1>
        {!login && (
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            value={name}
            onChange={e => setName(e.target.value)}
            type="text"
            placeholder="Your name"
          />
        )}
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="text"
          placeholder="Your email address"
        />
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Choose a safe password"
        />
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login ? 'login' : 'create account'}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setLogin(!login)}
          >
            {login ? 'need to create an account?' : 'already have an account?'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </form>
    </div>
  )
}

export default Login
