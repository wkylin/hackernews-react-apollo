import React, { createContext, useContext, useMemo, useState } from 'react'
import { AUTH_TOKEN } from './constants'

type AuthContextValue = {
  token: string | null
  setToken: (nextToken: string) => void
  clearToken: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(AUTH_TOKEN))

  const setToken = (nextToken: string) => {
    localStorage.setItem(AUTH_TOKEN, nextToken)
    setTokenState(nextToken)
  }

  const clearToken = () => {
    localStorage.removeItem(AUTH_TOKEN)
    setTokenState(null)
  }

  const value = useMemo(
    () => ({
      token,
      setToken,
      clearToken,
    }),
    [token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
