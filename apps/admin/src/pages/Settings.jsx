import { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { admin, logout } = useAdminAuth()
  const [form, setForm]   = useState({ name: admin?.name || '', currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)

  const upField = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const updateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/update-profile', { name: form.name })
      toast.success('Profile updated')
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const changePass = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setSaving(true)
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password changed. Please log in again.')
      logout()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Profile */}
      <form onSubmit={updateProfile} className="rounded-xl p-6 mb-6 space-y-4" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
        <h2 className="font-semibold">Profile</h2>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Display Name</label>
          <input value={form.name} onChange={upField('name')} />
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Email</label>
          <input value={admin?.email} disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
        </div>
        <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
          {saving ? 'Saving…' : 'Update Profile'}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={changePass} className="rounded-xl p-6 space-y-4" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
        <h2 className="font-semibold">Change Password</h2>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Current Password</label>
          <input type="password" required value={form.currentPassword} onChange={upField('currentPassword')} />
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>New Password</label>
          <input type="password" required value={form.newPassword} onChange={upField('newPassword')} placeholder="Min 8 characters" />
        </div>
        <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
          {saving ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
