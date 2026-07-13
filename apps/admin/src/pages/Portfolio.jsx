import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

const CATS = ['photo-editing','video-editing','color-grading','retouching','composite']

function AddForm({ onDone }) {
  const [form, setForm]   = useState({ title: '', category: 'photo-editing', description: '', tags: '', featured: false })
  const [before, setBefore] = useState(null)
  const [after,  setAfter]  = useState(null)
  const [saving, setSaving] = useState(false)

  const { getRootProps: bRp, getInputProps: bIp } = useDropzone({ onDrop: f => setBefore(f[0]), accept: {'image/*':[]}, maxFiles:1 })
  const { getRootProps: aRp, getInputProps: aIp } = useDropzone({ onDrop: f => setAfter(f[0]),  accept: {'image/*':[]}, maxFiles:1 })

  const submit = async (e) => {
    e.preventDefault()
    if (!after) return toast.error('After image required')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (before) fd.append('beforeImage', before)
      fd.append('afterImage', after)
      await api.post('/portfolio', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Portfolio item added')
      onDone()
    } catch { toast.error('Failed to add') }
    finally { setSaving(false) }
  }

  const upField = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="rounded-xl p-6 mb-6 space-y-4" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
      <h2 className="font-semibold">Add Portfolio Item</h2>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Title" required value={form.title} onChange={upField('title')} />
        <select value={form.category} onChange={upField('category')}>
          {CATS.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
        </select>
      </div>
      <textarea rows={2} placeholder="Description" value={form.description} onChange={upField('description')} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>Before Image (optional)</p>
          <div {...bRp()} className="rounded-lg p-4 text-center cursor-pointer" style={{ border: '2px dashed var(--glass-border)', background: 'var(--bg3)' }}>
            <input {...bIp()} />
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{before ? before.name : 'Drop before image'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>After Image *</p>
          <div {...aRp()} className="rounded-lg p-4 text-center cursor-pointer" style={{ border: `2px dashed ${after ? 'var(--gold)' : 'var(--glass-border)'}`, background: 'var(--bg3)' }}>
            <input {...aIp()} />
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{after ? after.name : 'Drop after / main image'}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-dim)' }}>
          <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
          Featured
        </label>
        <button type="submit" disabled={saving} className="btn-gold ml-auto disabled:opacity-60">
          {saving ? 'Uploading…' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}

export default function Portfolio() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/portfolio').then(r => setItems(r.data.items)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const remove = async (id) => {
    if (!confirm('Delete this portfolio item?')) return
    try { await api.delete(`/portfolio/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-gold">
          {showAdd ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showAdd && <AddForm onDone={() => { setShowAdd(false); load() }} />}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--gold)' }} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item._id} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
              <img src={item.afterImage} alt={item.title} className="w-full aspect-video object-cover" />
              <div className="p-4">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
                  {item.category.replace('-', ' ')} {item.featured && '· ⭐'}
                </p>
                <p className="font-medium mb-3">{item.title}</p>
                <button onClick={() => remove(item._id)} className="btn-danger w-full text-xs py-1.5">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
