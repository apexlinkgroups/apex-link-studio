import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const NAV = [
  { to: '/',          icon: '📊', label: 'Dashboard',  end: true },
  { to: '/projects',  icon: '📁', label: 'Projects' },
  { to: '/clients',   icon: '👥', label: 'Clients' },
  { to: '/portfolio', icon: '🖼', label: 'Portfolio' },
  { to: '/pricing',   icon: '💰', label: 'Pricing' },
  { to: '/payments',  icon: '💳', label: 'Payments' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col"
      style={{ background: 'var(--bg2)', borderRight: '1px solid var(--glass-border)', minHeight: '100vh' }}>
      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <p className="font-display text-lg font-black" style={{ color: 'var(--gold)' }}>APEX</p>
        <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive ? 'font-semibold' : 'hover:bg-[var(--bg3)]'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'rgba(200,168,78,.12)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--text-dim)',
              border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
            })}
          >
            <span>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <p className="text-sm font-medium mb-0.5">{admin?.name}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{admin?.email}</p>
        <button onClick={handleLogout} className="btn-outline w-full py-2 text-xs">Logout</button>
      </div>
    </aside>
  )
}
