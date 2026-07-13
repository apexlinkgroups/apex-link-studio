import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [total, setTotal]     = useState(0)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/clients', { params: { search: search || undefined } })
      .then(r => { setClients(r.data.clients); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [search])

  const toggleActive = async (id) => {
    try {
      const { data } = await api.put(`/clients/${id}/toggle`)
      setClients(cs => cs.map(c => c._id === id ? { ...c, isActive: data.isActive } : c))
    } catch { toast.error('Failed') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this client?')) return
    try {
      await api.delete(`/clients/${id}`)
      toast.success('Client deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients <span className="text-base font-normal" style={{ color: 'var(--text-dim)' }}>({total})</span></h1>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email…" className="w-56" />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              {['Name','Email','Country','Joined','Status','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ color: 'var(--text-dim)' }}>Loading…</td></tr>
            ) : clients.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td className="px-5 py-3 text-sm font-medium">{c.name}</td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>{c.email}</td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>{c.country || '—'}</td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: c.isActive ? 'rgba(80,200,120,.15)' : 'rgba(200,80,80,.15)', color: c.isActive ? '#50c878' : '#e06060' }}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(c._id)} className="btn-outline text-xs px-2 py-1">
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => remove(c._id)} className="btn-danger text-xs px-2 py-1">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
