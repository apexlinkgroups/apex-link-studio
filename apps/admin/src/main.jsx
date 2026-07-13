import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AdminAuthProvider } from './context/AdminAuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#18160f', color: '#f0ebe0', border: '1px solid rgba(200,168,78,.2)' },
        }} />
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
