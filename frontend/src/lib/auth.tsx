import React, { createContext, useContext, useMemo, useState } from 'react'
import { api } from './http'

type User = { id: number; username: string; role: 'ADMIN' | 'USER' }

type AuthContextType = {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const isAuthenticated = !!token

  async function login(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password })
    if (!res.data?.success) throw new Error(res.data?.message || 'Login failed')
    const { token: t, user: u } = res.data.data
    setToken(t)
    setUser(u)
  }

  async function register(username: string, password: string) {
    const res = await api.post('/auth/register', { username, password })
    if (!res.data?.success) throw new Error(res.data?.message || 'Register failed')
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ isAuthenticated, token, user, login, register, logout }), [isAuthenticated, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


