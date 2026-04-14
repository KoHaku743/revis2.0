import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import PhoneTable from '../components/PhoneTable'
import FilterBar from '../components/FilterBar'

function Dashboard() {
  const [telefony, setTelefony] = useState([])
  const [status, setStatus] = useState('')
  const [hladat, setHladat] = useState('')

  useEffect(() => {
    api.get('/phones?assigned_to=me').then((odpoved) => setTelefony(odpoved.data))
  }, [])

  const filtrovane = useMemo(() => telefony.filter((telefon) => {
    const pasujeStatus = !status || telefon.status === status
    const hladanyText = hladat.toLowerCase()
    const pasujeText = !hladanyText || telefon.serial_number.toLowerCase().includes(hladanyText) || telefon.model.toLowerCase().includes(hladanyText)
    return pasujeStatus && pasujeText
  }), [telefony, status, hladat])

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-semibold">Moja nástenka</h1>
      <FilterBar status={status} onStatusChange={setStatus} hladat={hladat} onHladatChange={setHladat} />
      <PhoneTable telefony={filtrovane} />
    </main>
  )
}

export default Dashboard
