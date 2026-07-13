import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { loginAdmin }      = useAdminAuth()
  const navigate            = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      if (data.user.role !== 'admin') {
        toast.error('Admin access required')
        return
      }
      loginAdmin(data.token, data.user)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-96 flex-shrink-0"
        style={{ background: 'var(--bg2)', borderRight: '1px solid var(--glass-border)' }}>
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold-dark))' }}>
            <span className="text-2xl font-display font-black text-black">A</span>
          </div>
          <p className="font-display text-3xl font-black mb-1" style={{ color: 'var(--gold)' }}>APEX STUDIO</p>
          <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Admin Portal</p>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Manage projects, clients, portfolio, pricing, and payments from one secure dashboard.
        </p>

        <div className="mt-10 p-4 rounded-xl" style={{ background: 'var(--bg3)', border: '1px solid var(--glass-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Default credentials</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>admin@apexlinkstudio.com</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>Apex@Studio#2026</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2">Sign in</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-dim)' }}>Admin access only</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@apexlinkstudio.com" />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: 'var(--text-dim)' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
