import { useEffect, useState } from 'react'
import api from '../api/client'

function Admin() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/users').then((odpoved) => setUsers(odpoved.data))
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-3xl font-semibold">Administrácia</h1>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mt-0 text-xl">Používatelia</h2>
        <ul className="mb-0 space-y-1 pl-4">
          {users.map((user) => (
            <li key={user.id}>{user.name} ({user.employee_code}) — {user.role}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default Admin
