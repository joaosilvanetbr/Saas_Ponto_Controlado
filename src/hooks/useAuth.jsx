import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

function hashSimples(str) {
  return btoa(encodeURIComponent(str))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      try {
        const raw = localStorage.getItem('ponto_facil_user')
        if (raw) setUser(JSON.parse(raw))
      } catch {}
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem('ponto_facil_users') || '{}')
      const found = users[email.toLowerCase()]
      if (!found || found.password !== hashSimples(password)) throw new Error('E-mail ou senha inválidos')
      const userData = { email: found.email, id: found.id }
      localStorage.setItem('ponto_facil_user', JSON.stringify(userData))
      setUser(userData)
      return userData
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return data.user
  }

  const signup = async (email, password) => {
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem('ponto_facil_users') || '{}')
      const key = email.toLowerCase()
      if (users[key]) throw new Error('E-mail já cadastrado')
      const newUser = { id: crypto.randomUUID(), email, password: hashSimples(password) }
      users[key] = newUser
      localStorage.setItem('ponto_facil_users', JSON.stringify(users))
      const userData = { email, id: newUser.id }
      localStorage.setItem('ponto_facil_user', JSON.stringify(userData))
      setUser(userData)
      return userData
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
    return data.user
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem('ponto_facil_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
