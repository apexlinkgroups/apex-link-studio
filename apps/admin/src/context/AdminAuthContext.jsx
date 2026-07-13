import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const Ctx = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('apex_admin_token')
    if (token) {
      api.get('/auth/me')
        .then(r => { if (r.data.user.role === 'admin') setAdmin(r.data.user) })
        .catch(() => localStorage.removeItem('apex_admin_token'))
        .finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  const loginAdmin = (token, user) => {
    localStorage.setItem('apex_admin_token', token)
    setAdmin(user)
  }

  const logout = () => { localStorage.removeItem('apex_admin_token'); setAdmin(null) }

  return <Ctx.Provider value={{ admin, loginAdmin, logout, loading }}>{children}</Ctx.Provider>
}

export const useAdminAuth = () => useContext(Ctx)
