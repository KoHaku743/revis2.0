import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import StatusBadge from '../components/StatusBadge'
import RepairForm from '../components/RepairForm'
import MessagePanel from '../components/MessagePanel'

function PhoneDetail() {
  const { id } = useParams()
  const [telefon, setTelefon] = useState(null)
  const [opravy, setOpravy] = useState([])
  const [spravy, setSpravy] = useState([])

  useEffect(() => {
    api.get(`/phones/${id}`).then((odpoved) => setTelefon(odpoved.data))
    api.get(`/phones/${id}/repairs`).then((odpoved) => setOpravy(odpoved.data))
    api.get('/messages').then((odpoved) => setSpravy(odpoved.data.filter((sprava) => Number(sprava.phone_id) === Number(id))))
  }, [id])

  const ulozitOpravu = async (formular) => {
    const { data } = await api.post(`/phones/${id}/repairs`, formular)
    setOpravy((aktualne) => [data, ...aktualne])
    if (formular.sync) {
      await api.post(`/repairs/${data.id}/sync`)
    }
  }

  const poslatSpravu = async (message) => {
    const { data } = await api.post('/messages', { to_user_id: 2, phone_id: Number(id), message })
    setSpravy((aktualne) => [data, ...aktualne])
  }

  if (!telefon) {
    return <main className="mx-auto max-w-6xl px-4 py-6">Načítavam detail telefónu...</main>
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="m-0 text-3xl font-semibold">{telefon.serial_number}</h1>
        <p className="my-2">{telefon.model}</p>
        <StatusBadge status={telefon.status} />
      </section>
      <RepairForm onSave={ulozitOpravu} />
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="m-0 text-xl font-semibold">História opráv</h2>
        <ul className="mb-0 mt-3 space-y-2 pl-4 text-sm">
          {opravy.map((oprava) => (
            <li key={oprava.id}>{oprava.repair_date} — {oprava.description || 'Bez popisu'} — tlačidlo {oprava.button_action || '-'}</li>
          ))}
        </ul>
      </section>
      <MessagePanel spravy={spravy} onSend={poslatSpravu} />
    </main>
  )
}

export default PhoneDetail
