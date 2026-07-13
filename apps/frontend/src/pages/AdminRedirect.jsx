import { useEffect } from 'react'

export default function AdminRedirect() {
  useEffect(() => {
    const adminUrl = import.meta.env.VITE_ADMIN_URL || '/login'
    window.location.replace(adminUrl)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
    </div>
  )
}
