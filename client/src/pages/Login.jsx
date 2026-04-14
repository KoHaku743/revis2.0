import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function Login() {
  const [username, setUsername] = useState('technik')
  const [password, setPassword] = useState('heslo123')
  const [chyba, setChyba] = useState('')
  const navigate = useNavigate()

  const prihlasit = async (event) => {
    event.preventDefault()
    setChyba('')
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch {
      setChyba('Neplatné prihlasovacie údaje.')
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={prihlasit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="m-0 text-3xl font-semibold">Prihlásenie</h1>
        <p className="m-0 text-sm text-black/70">Systém sledovania opráv iPhonov</p>
        <input className="w-full rounded-xl border border-black/10 px-3 py-2" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Používateľské meno" />
        <input type="password" className="w-full rounded-xl border border-black/10 px-3 py-2" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Heslo" />
        {chyba ? <p className="m-0 text-sm text-red-700">{chyba}</p> : null}
        <button className="w-full rounded-full bg-[#0071e3] px-4 py-2 text-white">Prihlásiť sa</button>
      </form>
    </main>
  )
}

export default Login
