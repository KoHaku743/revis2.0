const mapa = {
  in_progress: 'bg-blue-100 text-blue-700',
  testing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-gray-200 text-gray-700',
}

const popisy = {
  in_progress: 'V procese',
  testing: 'Testovanie',
  completed: 'Dokončené',
  on_hold: 'Pozastavené',
}

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mapa[status] || mapa.on_hold}`}>
      {popisy[status] || popisy.on_hold}
    </span>
  )
}

export default StatusBadge
