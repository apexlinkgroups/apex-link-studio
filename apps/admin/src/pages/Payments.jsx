import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = () => {
    api.get('/payments').then(r => setPayments(r.data.payments)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const refund = async (id) => {
    if (!confirm('Refund this payment?')) return
    try {
      await api.post(`/payments/${id}/refund`, { reason: 'Admin-initiated' })
      toast.success('Refunded')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Refund failed') }
  }

  const exportCSV = () => {
    const rows = [['ID','Client','Project','Amount','Currency','Method','Status','Date']]
    payments.forEach(p => rows.push([
      p._id, p.client?.name, p.project?.title,
      p.amount, p.currency, p.method, p.status,
      new Date(p.createdAt).toLocaleDateString(),
    ]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    a.download = `payments-${Date.now()}.csv`
    a.click()
  }

  const STATUS_COLOR = { pending:'#c8a84e', completed:'#50c878', failed:'#e06060', refunded:'#6498dc' }
  const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Total collected: <strong style={{ color: 'var(--gold)' }}>${total.toFixed(2)}</strong>
          </p>
        </div>
        <button onClick={exportCSV} className="btn-outline">Export CSV</button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              {['Client','Project','Amount','Method','Status','Date','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center" style={{ color: 'var(--text-dim)' }}>Loading…</td></tr>
            ) : payments.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td className="px-5 py-3 text-sm">{p.client?.name || '—'}</td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>{p.project?.title || '—'}</td>
                <td className="px-5 py-3 text-sm font-semibold" style={{ color: 'var(--gold)' }}>${p.amount.toFixed(2)}</td>
                <td className="px-5 py-3 text-sm capitalize" style={{ color: 'var(--text-dim)' }}>{p.method}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{ background: `${STATUS_COLOR[p.status]}22`, color: STATUS_COLOR[p.status] }}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  {p.status === 'completed' && (
                    <button onClick={() => refund(p._id)} className="btn-danger text-xs px-2 py-1">Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
