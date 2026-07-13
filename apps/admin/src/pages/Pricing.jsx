import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const CATS = ['photo-editing','video-editing','color-grading','retouching','composite','bundle']
const empty = { name:'', category:'photo-editing', price:'', billingCycle:'one-time', description:'', features:'', maxFiles:10, maxRevisions:2, deliveryDays:3, isPopular:false, isActive:true }

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [form, setForm]   = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = () => api.get('/pricing/admin/all').then(r => setPlans(r.data.plans))
  useEffect(() => { load() }, [])

  const upField = k => e => setForm(f => ({ ...f, [k]: k === 'isPopular' || k === 'isActive' ? e.target.checked : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), features: form.features.split('\n').filter(Boolean) }
      if (editing) { await api.put(`/pricing/${editing}`, payload); toast.success('Plan updated') }
      else { await api.post('/pricing', payload); toast.success('Plan created') }
      setForm(empty); setEditing(null); load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this plan?')) return
    try { await api.delete(`/pricing/${id}`); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  const edit = (p) => {
    setEditing(p._id)
    setForm({ ...p, features: (p.features || []).join('\n') })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div>
        <h1 className="text-2xl font-bold mb-6">{editing ? 'Edit Plan' : 'Add Pricing Plan'}</h1>
        <form onSubmit={submit} className="space-y-4 rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Plan name *" required value={form.name} onChange={upField('name')} />
            <select value={form.category} onChange={upField('category')}>
              {CATS.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Price ($) *" required value={form.price} onChange={upField('price')} />
            <select value={form.billingCycle} onChange={upField('billingCycle')}>
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <input placeholder="Short description" value={form.description} onChange={upField('description')} />
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-dim)' }}>Features (one per line)</label>
            <textarea rows={5} placeholder="Color correction&#10;Background removal&#10;…" value={form.features} onChange={upField('features')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs block mb-1" style={{ color: 'var(--text-dim)' }}>Max Files</label><input type="number" value={form.maxFiles} onChange={upField('maxFiles')} /></div>
            <div><label className="text-xs block mb-1" style={{ color: 'var(--text-dim)' }}>Revisions</label><input type="number" value={form.maxRevisions} onChange={upField('maxRevisions')} /></div>
            <div><label className="text-xs block mb-1" style={{ color: 'var(--text-dim)' }}>Delivery Days</label><input type="number" value={form.deliveryDays} onChange={upField('deliveryDays')} /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-dim)' }}>
              <input type="checkbox" checked={form.isPopular} onChange={upField('isPopular')} /> Popular
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-dim)' }}>
              <input type="checkbox" checked={form.isActive} onChange={upField('isActive')} /> Active
            </label>
          </div>
          <div className="flex gap-3">
            {editing && <button type="button" onClick={() => { setForm(empty); setEditing(null) }} className="btn-outline flex-1">Cancel</button>}
            <button type="submit" disabled={saving} className="btn-gold flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>

      {/* Plans list */}
      <div>
        <h2 className="text-xl font-bold mb-6">Current Plans ({plans.length})</h2>
        <div className="space-y-3">
          {plans.map(p => (
            <div key={p._id} className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: 'var(--bg2)', border: `1px solid ${p.isPopular ? 'var(--gold)' : 'var(--glass-border)'}` }}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{p.name}</p>
                  {p.isPopular && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,168,78,.15)', color: 'var(--gold)' }}>Popular</span>}
                  {!p.isActive && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,80,80,.15)', color: '#e06060' }}>Inactive</span>}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{p.category.replace('-', ' ')} · <strong style={{ color: 'var(--gold)' }}>${p.price}</strong></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(p)} className="btn-outline text-xs px-2 py-1">Edit</button>
                <button onClick={() => remove(p._id)} className="btn-danger text-xs px-2 py-1">Del</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
