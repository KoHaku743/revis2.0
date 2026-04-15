import { useState, useEffect } from 'react'

const serialRegex = /^(VYK|REF|KEO|KET|BAC|BAE|BAI|BAO|BAU|BAV|BBE|MTT|NRM|PDK|POE|PPF|TNL|TTA|ZAA|ZAM|CZ)\d+$/

function NowyTelefonModal({ onSave, onClose, initialData }) {
  const editMode = Boolean(initialData)

  const [formular, setFormular] = useState({
    serial_number: '',
    model: '',
    status: 'in_progress',
    ...initialData,
  })
  const [chyba, setChyba] = useState('')

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const odoslat = async (e) => {
    e.preventDefault()
    setChyba('')

    if (!editMode && !formular.serial_number.trim()) {
      setChyba('Sériové číslo je povinné.')
      return
    }

    if (!editMode && !serialRegex.test(formular.serial_number)) {
      // allow but show warning — handled by server
    }

    try {
      await onSave(formular)
      onClose()
    } catch (err) {
      setChyba(err.response?.data?.message || 'Nastala chyba.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="m-0 mb-4 text-xl font-semibold">
          {editMode ? 'Upraviť telefón' : 'Nový telefón'}
        </h2>

        <form onSubmit={odoslat} className="space-y-3">
          {!editMode && (
            <div>
              <label className="mb-1 block text-sm font-medium">Sériové číslo *</label>
              <input
                className="w-full rounded-xl border border-black/10 px-3 py-2"
                placeholder="napr. VYK261701003"
                value={formular.serial_number}
                onChange={(e) => setFormular((f) => ({ ...f, serial_number: e.target.value }))}
                autoFocus
              />
              {formular.serial_number && !serialRegex.test(formular.serial_number) && (
                <p className="mt-1 text-xs text-amber-600">Neznámy formát sériového čísla – bude uložené s varovaním.</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Model</label>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              placeholder="napr. iPhone 15 Pro"
              value={formular.model}
              onChange={(e) => setFormular((f) => ({ ...f, model: e.target.value }))}
            />
          </div>

          {editMode && (
            <div>
              <label className="mb-1 block text-sm font-medium">Stav</label>
              <select
                className="w-full rounded-xl border border-black/10 px-3 py-2"
                value={formular.status}
                onChange={(e) => setFormular((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="in_progress">V procese</option>
                <option value="testing">Testovanie</option>
                <option value="completed">Dokončené</option>
                <option value="on_hold">Pozastavené</option>
              </select>
            </div>
          )}

          {chyba && <p className="text-sm text-red-700">{chyba}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/20 px-4 py-2 text-sm"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#0071e3] px-4 py-2 text-sm text-white"
            >
              {editMode ? 'Uložiť zmeny' : 'Pridať telefón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NowyTelefonModal
