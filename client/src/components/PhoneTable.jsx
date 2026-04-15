import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import StatusBadge from './StatusBadge'
import NowyTelefonModal from './NowyTelefonModal'
import { getCurrentUser } from '../utils/auth'

function PhoneTable({ telefony, showAssigned, onRefresh }) {
  const [editTelefon, setEditTelefon] = useState(null)
  const currentUserId = getCurrentUser()?.id ?? null

  const prevziat = async (id) => {
    await api.patch(`/phones/${id}`, { assigned_to: currentUserId })
    onRefresh?.()
  }

  const ulozitUpravu = async (data) => {
    await api.patch(`/phones/${editTelefon.id}`, data)
    onRefresh?.()
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-black text-white">
            <tr>
              <th className="px-4 py-3">Sériové číslo</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Stav</th>
              {showAssigned && <th className="px-4 py-3">Pridelené</th>}
              <th className="px-4 py-3">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {telefony.map((telefon) => (
              <tr key={telefon.id} className="border-b border-black/5">
                <td className="px-4 py-3 font-mono text-xs">{telefon.serial_number}</td>
                <td className="px-4 py-3">{telefon.model}</td>
                <td className="px-4 py-3"><StatusBadge status={telefon.status} /></td>
                {showAssigned && <td className="px-4 py-3">{telefon.assigned_name}</td>}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/phones/${telefon.id}`}
                      className="rounded-full bg-[#0071e3] px-3 py-1 text-xs text-white"
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => setEditTelefon(telefon)}
                      className="rounded-full border border-black/20 px-3 py-1 text-xs"
                    >
                      Upraviť
                    </button>
                    {showAssigned && telefon.assigned_to !== currentUserId && (
                      <button
                        onClick={() => prevziat(telefon.id)}
                        className="rounded-full border border-[#0071e3] px-3 py-1 text-xs text-[#0071e3]"
                      >
                        Prevziať
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {telefony.length === 0 && (
              <tr>
                <td colSpan={showAssigned ? 5 : 4} className="px-4 py-6 text-center text-black/40">
                  Žiadne telefóny
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editTelefon && (
        <NowyTelefonModal
          initialData={{ model: editTelefon.model, status: editTelefon.status }}
          onSave={ulozitUpravu}
          onClose={() => setEditTelefon(null)}
        />
      )}
    </>
  )
}

export default PhoneTable
