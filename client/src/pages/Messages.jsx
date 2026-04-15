import { useEffect, useState } from 'react'
import api from '../api/client'

function Messages() {
  const [spravy, setSpravy] = useState([])

  useEffect(() => {
    api.get('/messages').then((odpoved) => setSpravy(odpoved.data))
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-3xl font-semibold">Správy</h1>
      <div className="space-y-2">
        {spravy.map((sprava) => (
          <article key={sprava.id} className="rounded-xl bg-white p-3 shadow-sm">
            <p className="m-0 text-sm"><strong>Od:</strong> {sprava.from_name}</p>
            <p className="m-0 text-sm"><strong>Správa:</strong> {sprava.message}</p>
          </article>
        ))}
      </div>
    </main>
  )
}

export default Messages
