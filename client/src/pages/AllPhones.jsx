import { useEffect, useState } from 'react'
import api from '../api/client'
import PhoneTable from '../components/PhoneTable'
import FilterBar from '../components/FilterBar'
import NowyTelefonModal from '../components/NowyTelefonModal'

function AllPhones() {
  const [telefony, setTelefony] = useState([])
  const [status, setStatus] = useState('')
  const [hladat, setHladat] = useState('')
  const [showModal, setShowModal] = useState(false)

  const nacitat = () => {
    api.get('/phones').then((odpoved) => setTelefony(odpoved.data))
  }

  useEffect(() => {
    nacitat()
  }, [])

  const filtrovane = telefony.filter((telefon) => {
    const pasujeStatus = !status || telefon.status === status
    const hladanyText = hladat.toLowerCase()
    const pasujeText = !hladanyText || telefon.serial_number.toLowerCase().includes(hladanyText) || (telefon.model || '').toLowerCase().includes(hladanyText)
    return pasujeStatus && pasujeText
  })

  const pridatTelefon = async (data) => {
    await api.post('/phones', data)
    nacitat()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Všetky telefóny</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-full bg-[#0071e3] px-4 py-2 text-sm text-white"
        >
          + Nový telefón
        </button>
      </div>
      <FilterBar status={status} onStatusChange={setStatus} hladat={hladat} onHladatChange={setHladat} />
      <PhoneTable telefony={filtrovane} showAssigned onRefresh={nacitat} />
      {showModal && (
        <NowyTelefonModal onSave={pridatTelefon} onClose={() => setShowModal(false)} />
      )}
    </main>
  )
}

export default AllPhones
