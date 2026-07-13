import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const STATUSES = ['','pending','in-review','in-progress','revision','completed','delivered','cancelled']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [status, setStatus]     = useState('')
  const [loading, setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/projects', { params: { status: status || undefined, page, limit: 15 } })
      .then(r => { setProjects(r.data.projects); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, status])

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const STATUS_COLOR = { pending:'#c8a84e','in-review':'#6498dc','in-progress':'#50b478',revision:'#dcb030',completed:'#50c878',delivered:'#e8c96a',cancelled:'#e06060' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{total} total</span>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className="px-3 py-1.5 rounded-lg text-sm transition-all capitalize"
            style={{
              background: status === s ? 'rgba(200,168,78,.15)' : 'var(--bg2)',
              border: `1px solid ${status === s ? 'var(--gold)' : 'var(--glass-border)'}`,
              color: status === s ? 'var(--gold)' : 'var(--text-dim)',
            }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              {['Project','Client','Type','Status','Progress','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ color: 'var(--text-dim)' }}>Loading…</td></tr>
            ) : projects.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td className="px-5 py-3 text-sm">
                  <Link to={`/projects/${p._id}`} className="font-medium hover:text-[var(--gold)] transition-colors">{p.title}</Link>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>{p.client?.name || '—'}</td>
                <td className="px-5 py-3 text-sm capitalize" style={{ color: 'var(--text-dim)' }}>{p.type?.replace('-', ' ')}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{ background: `${STATUS_COLOR[p.status]}22`, color: STATUS_COLOR[p.status] }}>
                    {p.status?.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--bg4)' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.progress || 0}%`, background: 'var(--gold)' }} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{p.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Link to={`/projects/${p._id}`} className="text-xs px-2 py-1 rounded"
                      style={{ background: 'var(--bg4)', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}>
                      Edit
                    </Link>
                    <button onClick={() => deleteProject(p._id)} className="btn-danger text-xs px-2 py-1">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: Math.ceil(total / 15) }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="w-8 h-8 rounded text-sm"
              style={{ background: page === i + 1 ? 'var(--gold)' : 'var(--bg2)', color: page === i + 1 ? '#0a0800' : 'var(--text-dim)', border: '1px solid var(--glass-border)' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
