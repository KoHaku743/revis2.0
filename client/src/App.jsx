import { Navigate, Route, Routes, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AllPhones from './pages/AllPhones'
import PhoneDetail from './pages/PhoneDetail'
import Messages from './pages/Messages'
import Admin from './pages/Admin'

function ChranenaTrasa({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Navigacia() {
  const token = localStorage.getItem('token')

  if (!token) {
    return null
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-black/10 bg-black/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-sm">
        <Link className="rounded-full border border-white/30 px-3 py-1 hover:border-[#2997ff]" to="/dashboard">Nástenka</Link>
        <Link className="rounded-full border border-white/30 px-3 py-1 hover:border-[#2997ff]" to="/phones">Všetky telefóny</Link>
        <Link className="rounded-full border border-white/30 px-3 py-1 hover:border-[#2997ff]" to="/messages">Správy</Link>
        <Link className="rounded-full border border-white/30 px-3 py-1 hover:border-[#2997ff]" to="/admin">Admin</Link>
      </div>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Navigacia />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ChranenaTrasa><Dashboard /></ChranenaTrasa>} />
        <Route path="/phones" element={<ChranenaTrasa><AllPhones /></ChranenaTrasa>} />
        <Route path="/phones/:id" element={<ChranenaTrasa><PhoneDetail /></ChranenaTrasa>} />
        <Route path="/messages" element={<ChranenaTrasa><Messages /></ChranenaTrasa>} />
        <Route path="/admin" element={<ChranenaTrasa><Admin /></ChranenaTrasa>} />
        <Route path="*" element={<Navigate to={localStorage.getItem('token') ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default App
