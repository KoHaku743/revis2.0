import { useEffect, useState } from 'react'
import api from '../api/client'
import PhoneTable from '../components/PhoneTable'

function AllPhones() {
  const [telefony, setTelefony] = useState([])

  useEffect(() => {
    api.get('/phones').then((odpoved) => setTelefony(odpoved.data))
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-semibold">Všetky telefóny</h1>
      <PhoneTable telefony={telefony} />
    </main>
  )
}

export default AllPhones
