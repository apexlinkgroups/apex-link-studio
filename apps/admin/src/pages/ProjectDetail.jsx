import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

const STATUSES = ['pending','in-review','in-progress','revision','completed','delivered','cancelled']

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [form, setForm]       = useState({})
  const [files, setFiles]     = useState([])
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: f => setFiles(prev => [...prev, ...f]),
  })

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => {
      setProject(r.data.project)
      setForm({
        status: r.data.project.status,
        progress: r.data.project.progress,
        notes: r.data.project.notes || '',
        priority: r.data.project.priority,
        message: '',
      })
    })
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/projects/${id}`, form)
      setProject(data.project)
      toast.success('Project updated')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const uploadOutput = async () => {
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const { data } = await api.post(`/projects/${id}/output`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProject(p => ({ ...p, outputFiles: data.outputFiles, status: 'completed', progress: 100 }))
      setFiles([])
      toast.success('Output files uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (!project) return <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--gold)' }} /></div>

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/projects" className="text-sm mb-1 inline-block" style={{ color: 'var(--text-dim)' }}>← Projects</Link>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: 'var(--text-dim)' }}>
            {project.type?.replace('-', ' ')} · {project.client?.name}
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-gold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update form */}
        <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
          <h2 className="font-semibold">Update Project</h2>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Progress ({form.progress}%)</label>
            <input type="range" min="0" max="100" value={form.progress}
              onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
              className="w-full" style={{ accentColor: 'var(--gold)', background: 'transparent', border: 'none', padding: 0 }} />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Status Message (for timeline)</label>
            <input type="text" value={form.message} placeholder="Describe the update…"
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-dim)' }}>Admin Notes</label>
            <textarea rows={4} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        {/* Upload output */}
        <div className="space-y-5">
          <div className="rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
            <h2 className="font-semibold mb-4">Upload Output Files</h2>
            <div {...getRootProps()} className="rounded-xl p-6 text-center cursor-pointer mb-4"
              style={{ border: '2px dashed var(--glass-border)', background: 'var(--bg3)' }}>
              <input {...getInputProps()} />
              <p className="text-2xl mb-2">📤</p>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Drop completed files here</p>
            </div>
            {files.length > 0 && (
              <div className="space-y-2 mb-4">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded"
                    style={{ background: 'var(--bg3)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>{f.name}</span>
                    <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}
                      style={{ color: 'var(--text-muted)' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={uploadOutput} disabled={!files.length || uploading} className="btn-gold w-full py-2 disabled:opacity-40">
              {uploading ? 'Uploading…' : 'Upload & Mark Completed'}
            </button>
          </div>

          {/* Existing output files */}
          {project.outputFiles?.length > 0 && (
            <div className="rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
              <h2 className="font-semibold mb-4">Delivered Files ({project.outputFiles.length})</h2>
              {project.outputFiles.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm py-2"
                  style={{ color: 'var(--gold)', borderBottom: '1px solid var(--glass-border)' }}>
                  📎 {f.originalName || `File ${i + 1}`}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {project.timeline?.length > 0 && (
        <div className="rounded-xl p-6 mt-6" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
          <h2 className="font-semibold mb-4">Timeline</h2>
          <div className="space-y-3">
            {[...project.timeline].reverse().map((e, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--gold)' }} />
                <div>
                  <p className="text-sm capitalize font-medium">{e.status.replace('-', ' ')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{e.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
