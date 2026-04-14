import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function PhoneTable({ telefony }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black text-white">
          <tr>
            <th className="px-4 py-3">Sériové číslo</th>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3">Stav</th>
            <th className="px-4 py-3">Pridelené</th>
            <th className="px-4 py-3">Akcie</th>
          </tr>
        </thead>
        <tbody>
          {telefony.map((telefon) => (
            <tr key={telefon.id} className="border-b border-black/5">
              <td className="px-4 py-3">{telefon.serial_number}</td>
              <td className="px-4 py-3">{telefon.model}</td>
              <td className="px-4 py-3"><StatusBadge status={telefon.status} /></td>
              <td className="px-4 py-3">{telefon.assigned_name}</td>
              <td className="px-4 py-3">
                <Link to={`/phones/${telefon.id}`} className="rounded-full bg-[#0071e3] px-3 py-1 text-white">
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PhoneTable
