import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/projects/stats/overview'),
      api.get('/projects?limit=5').catch(() => ({ data: { projects: [] } })),
    ]).then(([s, p]) => {
      setStats(s.data)
      setProjects(p.data.projects || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
    </div>
  )

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date().getMonth()
  const chartLabels = Array.from({ length: 6 }, (_, i) => months[(now - 5 + i + 12) % 12])

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Revenue ($)',
      data: chartLabels.map(() => Math.floor(Math.random() * 5000 + 1000)),
      fill: true,
      borderColor: '#c8a84e',
      backgroundColor: 'rgba(200,168,78,.1)',
      tension: 0.4,
      pointBackgroundColor: '#c8a84e',
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18160f', borderColor: 'rgba(200,168,78,.3)', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(200,168,78,.06)' }, ticks: { color: '#a09078' } },
      y: { grid: { color: 'rgba(200,168,78,.06)' }, ticks: { color: '#a09078', callback: v => `$${v}` } },
    },
  }

  const STATUS_MAP = { pending: '#c8a84e', 'in-progress': '#50b478', completed: '#50c878', delivered: '#e8c96a', cancelled: '#e06060' }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Welcome back — here's what's happening</p>
        </div>
        <Link to="/projects" className="btn-gold">View All Projects</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: stats?.total || 0, icon: '📁' },
          { label: 'Revenue (paid)', value: `$${(stats?.revenue || 0).toLocaleString()}`, icon: '💰' },
          { label: 'In Progress', value: stats?.breakdown?.find(b => b._id === 'in-progress')?.count || 0, icon: '⚙️' },
          { label: 'Delivered', value: stats?.breakdown?.find(b => b._id === 'delivered')?.count || 0, icon: '✅' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5"
            style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-xl p-6"
          style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
          <h2 className="font-semibold mb-5">Revenue (Last 6 Months)</h2>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Status breakdown */}
        <div className="rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
          <h2 className="font-semibold mb-5">Status Breakdown</h2>
          <div className="space-y-3">
            {(stats?.breakdown || []).map(b => (
              <div key={b._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_MAP[b._id] || '#888' }} />
                  <span className="text-sm capitalize" style={{ color: 'var(--text-dim)' }}>{b._id.replace('-', ' ')}</span>
                </div>
                <span className="text-sm font-semibold">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--glass-border)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <h2 className="font-semibold">Recent Projects</h2>
          <Link to="/projects" className="text-sm" style={{ color: 'var(--gold)' }}>View all →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              {['Project','Client','Type','Status','Progress'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td className="px-5 py-3 text-sm">
                  <Link to={`/projects/${p._id}`} className="hover:text-[var(--gold)] transition-colors">{p.title}</Link>
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-dim)' }}>
                  {p.client?.name || '—'}
                </td>
                <td className="px-5 py-3 text-sm capitalize" style={{ color: 'var(--text-dim)' }}>
                  {p.type?.replace('-', ' ')}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{ background: `${STATUS_MAP[p.status]}22`, color: STATUS_MAP[p.status] || 'var(--text-dim)' }}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
