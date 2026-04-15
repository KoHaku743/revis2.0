import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import StatusBadge from '../components/StatusBadge'
import RepairForm from '../components/RepairForm'
import MessagePanel from '../components/MessagePanel'
import NowyTelefonModal from '../components/NowyTelefonModal'

function PhoneDetail() {
  const { id } = useParams()
  const [telefon, setTelefon] = useState(null)
  const [opravy, setOpravy] = useState([])
  const [spravy, setSpravy] = useState([])
  const [showEdit, setShowEdit] = useState(false)

  const nacitat = useCallback(() => {
    api.get(`/phones/${id}`).then((odpoved) => setTelefon(odpoved.data))
    api.get(`/phones/${id}/repairs`).then((odpoved) => setOpravy(odpoved.data))
    api.get('/messages').then((odpoved) => setSpravy(odpoved.data.filter((sprava) => Number(sprava.phone_id) === Number(id))))
  }, [id])

  useEffect(() => {
    nacitat()
  }, [nacitat])

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

  const ulozitUpravu = async (data) => {
    const { data: updated } = await api.patch(`/phones/${id}`, data)
    setTelefon(updated)
  }

  if (!telefon) {
    return <main className="mx-auto max-w-6xl px-4 py-6">Načítavam detail telefónu...</main>
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="m-0 font-mono text-3xl font-semibold">{telefon.serial_number}</h1>
            <p className="my-2 text-black/60">{telefon.model}</p>
            <div className="flex items-center gap-3">
              <StatusBadge status={telefon.status} />
              {telefon.assigned_name && (
                <span className="text-sm text-black/50">Technik: {telefon.assigned_name}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-full border border-black/20 px-3 py-1 text-sm"
          >
            Upraviť
          </button>
        </div>
      </section>
      <RepairForm onSave={ulozitOpravu} />
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="m-0 text-xl font-semibold">História opráv</h2>
        {opravy.length === 0 ? (
          <p className="mt-3 text-sm text-black/40">Žiadne záznamy opráv.</p>
        ) : (
          <ul className="mb-0 mt-3 space-y-2 pl-4 text-sm">
            {opravy.map((oprava) => (
              <li key={oprava.id} className="flex flex-wrap gap-2">
                <span className="text-black/50">{oprava.repair_date}</span>
                <span>{oprava.description || 'Bez popisu'}</span>
                {oprava.button_action && <span className="rounded bg-black/5 px-1">Tlačidlo {oprava.button_action}</span>}
                {oprava.test_ok && <span className="rounded bg-emerald-100 px-1 text-emerald-700">OK</span>}
                {oprava.test_nok && <span className="rounded bg-red-100 px-1 text-red-700">NOK</span>}
                {oprava.synced_to_sheet && <span className="rounded bg-blue-100 px-1 text-blue-700">Synced</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <MessagePanel spravy={spravy} onSend={poslatSpravu} />

      {showEdit && (
        <NowyTelefonModal
          initialData={{ model: telefon.model, status: telefon.status }}
          onSave={ulozitUpravu}
          onClose={() => setShowEdit(false)}
        />
      )}
    </main>
  )
}

export default PhoneDetail
