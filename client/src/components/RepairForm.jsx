import { useState } from 'react'
import ButtonSelector from './ButtonSelector'

function RepairForm({ onSave }) {
  const [formular, setFormular] = useState({
    date: new Date().toISOString().slice(0, 10),
    parts_used: '',
    description: '',
    service_type: 'TEL',
    test: '',
    button_action: 0,
  })

  const ulozit = (event) => {
    event.preventDefault()
    onSave(formular)
  }

  return (
    <form onSubmit={ulozit} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="m-0 text-lg font-semibold">Pridať servisný záznam</h3>
      <input
        type="date"
        className="w-full rounded-xl border border-black/10 px-3 py-2"
        value={formular.date}
        onChange={(event) => setFormular((aktualny) => ({ ...aktualny, date: event.target.value }))}
      />
      <input
        className="w-full rounded-xl border border-black/10 px-3 py-2"
        placeholder="Použité diely (napr. 658195, 658796)"
        value={formular.parts_used}
        onChange={(event) => setFormular((aktualny) => ({ ...aktualny, parts_used: event.target.value }))}
      />
      <textarea
        className="w-full rounded-xl border border-black/10 px-3 py-2"
        placeholder="Popis a poznámka"
        rows={4}
        value={formular.description}
        onChange={(event) => setFormular((aktualny) => ({ ...aktualny, description: event.target.value }))}
      />
      <select
        className="w-full rounded-xl border border-black/10 px-3 py-2"
        value={formular.service_type}
        onChange={(event) => setFormular((aktualny) => ({ ...aktualny, service_type: event.target.value }))}
      >
        {['TEL', 'TAB', 'NTB', 'FOTO', 'DIAG', 'INE', 'REK', 'KON', 'DRON'].map((typ) => (
          <option key={typ} value={typ}>{typ}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFormular((aktualny) => ({ ...aktualny, test: 'OK' }))}
          className={`rounded-xl px-4 py-2 ${formular.test === 'OK' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}
        >
          Test OK
        </button>
        <button
          type="button"
          onClick={() => setFormular((aktualny) => ({ ...aktualny, test: 'NOK' }))}
          className={`rounded-xl px-4 py-2 ${formular.test === 'NOK' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}
        >
          Test NOK
        </button>
      </div>
      <ButtonSelector
        value={formular.button_action}
        onChange={(cislo) => setFormular((aktualny) => ({ ...aktualny, button_action: cislo }))}
      />
      <div className="flex gap-2">
        <button type="submit" className="rounded-full bg-[#1d1d1f] px-4 py-2 text-white">Uložiť koncept</button>
        <button
          type="button"
          className="rounded-full bg-[#0071e3] px-4 py-2 text-white"
          onClick={() => onSave({ ...formular, sync: true })}
        >
          Zapísať do tabuľky
        </button>
      </div>
    </form>
  )
}

export default RepairForm
