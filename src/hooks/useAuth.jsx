import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext({})
const STORAGE_KEY = 'ponto_facil_user'

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getUsers() {
  try {
    const raw = localStorage.getItem('ponto_facil_users')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUsers(users) {
  localStorage.setItem('ponto_facil_users', JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const users = getUsers()
    const found = users[email.toLowerCase()]
    if (!found || found.password !== password) {
      throw new Error('E-mail ou senha inválidos')
    }
    const userData = { email: found.email, id: found.id }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const signup = async (email, password) => {
    const users = getUsers()
    const key = email.toLowerCase()
    if (users[key]) {
      throw new Error('E-mail já cadastrado')
    }
    const newUser = { id: crypto.randomUUID(), email, password }
    users[key] = newUser
    saveUsers(users)
    const userData = { email, id: newUser.id }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
