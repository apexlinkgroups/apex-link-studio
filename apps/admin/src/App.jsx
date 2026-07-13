import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'

import AdminLogin    from './pages/AdminLogin'
import Layout        from './components/Layout'
import Dashboard     from './pages/Dashboard'
import Projects      from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Clients       from './pages/Clients'
import Portfolio     from './pages/Portfolio'
import Pricing       from './pages/Pricing'
import Payments      from './pages/Payments'
import Settings      from './pages/Settings'

function Guard({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
    <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
  </div>
  return admin ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="projects"          element={<Projects />} />
        <Route path="projects/:id"      element={<ProjectDetail />} />
        <Route path="clients"           element={<Clients />} />
        <Route path="portfolio"         element={<Portfolio />} />
        <Route path="pricing"           element={<Pricing />} />
        <Route path="payments"          element={<Payments />} />
        <Route path="settings"          element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
