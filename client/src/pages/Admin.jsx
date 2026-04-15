import { useEffect, useState } from 'react'
import api from '../api/client'
import { getCurrentUser } from '../utils/auth'

// Employee codes as used in the Google Sheet statistics section (one code per employee)
const EMPLOYEE_CODES = ['BAC', 'BAE', 'BAI', 'BAO', 'BAU', 'BAV', 'BBE', 'KEA', 'KEO', 'KET', 'MTT', 'NRM', 'PDK', 'POE', 'PPF', 'TNL', 'TTA', 'ZAA', 'ZAM', 'CZ']

const prazdnyFormular = { name: '', username: '', password: '', role: 'technician', employee_code: '' }

function UserModal({ initial, onSave, onClose }) {
  const editMode = Boolean(initial)
  const [formular, setFormular] = useState(initial ? { ...initial, password: '' } : prazdnyFormular)
  const [chyba, setChyba] = useState('')

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const odoslat = async (e) => {
    e.preventDefault()
    setChyba('')
    try {
      await onSave(formular)
      onClose()
    } catch (err) {
      setChyba(err.response?.data?.message || 'Nastala chyba.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="m-0 mb-4 text-xl font-semibold">
          {editMode ? 'Upraviť používateľa' : 'Nový používateľ'}
        </h2>
        <form onSubmit={odoslat} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Celé meno *</label>
            <input
              required
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={formular.name}
              onChange={(e) => setFormular((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Používateľské meno *</label>
            <input
              required
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={formular.username}
              onChange={(e) => setFormular((f) => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {editMode ? 'Nové heslo (nechajte prázdne pre zachovanie)' : 'Heslo *'}
            </label>
            <input
              type="password"
              required={!editMode}
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={formular.password}
              onChange={(e) => setFormular((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rola</label>
            <select
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={formular.role}
              onChange={(e) => setFormular((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="technician">Technik</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kód zamestnanca</label>
            <select
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={formular.employee_code || ''}
              onChange={(e) => setFormular((f) => ({ ...f, employee_code: e.target.value || null }))}
            >
              <option value="">— Bez kódu —</option>
              {EMPLOYEE_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          {chyba && <p className="text-sm text-red-700">{chyba}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-black/20 px-4 py-2 text-sm">
              Zrušiť
            </button>
            <button type="submit" className="rounded-full bg-[#0071e3] px-4 py-2 text-sm text-white">
              {editMode ? 'Uložiť zmeny' : 'Pridať používateľa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Admin() {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(null) // null | 'new' | user object

  const currentUserId = getCurrentUser()?.id ?? null

  const nacitat = () => {
    api.get('/users').then((r) => setUsers(r.data)).catch(() => {})
  }

  useEffect(() => {
    nacitat()
  }, [])

  const pridatUsera = async (data) => {
    await api.post('/users', data)
    nacitat()
  }

  const upravitUsera = async (data) => {
    const payload = { ...data }
    if (!payload.password) delete payload.password
    await api.patch(`/users/${modal.id}`, payload)
    nacitat()
  }

  const vymazatUsera = async (user) => {
    if (!window.confirm(`Naozaj chcete zmazať používateľa "${user.name}"?`)) return
    try {
      await api.delete(`/users/${user.id}`)
      nacitat()
    } catch (err) {
      alert(err.response?.data?.message || 'Nastala chyba.')
    }
  }

  const roleLabel = (role) => (role === 'admin' ? 'Admin' : 'Technik')

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-3xl font-semibold">Administrácia</h1>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-xl">Používatelia</h2>
          <button
            onClick={() => setModal('new')}
            className="rounded-full bg-[#0071e3] px-4 py-2 text-sm text-white"
          >
            + Pridať používateľa
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black text-white">
              <tr>
                <th className="px-4 py-3">Meno</th>
                <th className="px-4 py-3">Používateľské meno</th>
                <th className="px-4 py-3">Kód</th>
                <th className="px-4 py-3">Rola</th>
                <th className="px-4 py-3">Akcie</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-black/60">{user.username}</td>
                  <td className="px-4 py-3">
                    {user.employee_code
                      ? <span className="rounded bg-black/5 px-2 py-0.5 font-mono text-xs">{user.employee_code}</span>
                      : <span className="text-black/30">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal(user)}
                        className="rounded-full border border-black/20 px-3 py-1 text-xs"
                      >
                        Upraviť
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => vymazatUsera(user)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
                        >
                          Zmazať
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black/40">Žiadni používatelia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal === 'new' && (
        <UserModal onSave={pridatUsera} onClose={() => setModal(null)} />
      )}
      {modal && modal !== 'new' && (
        <UserModal initial={modal} onSave={upravitUsera} onClose={() => setModal(null)} />
      )}
    </main>
  )
}

export default Admin
