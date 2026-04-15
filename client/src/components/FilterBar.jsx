function FilterBar({ status, onStatusChange, hladat, onHladatChange }) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <input
        className="rounded-xl border border-black/10 bg-white px-4 py-2"
        placeholder="Hľadať podľa sériového čísla alebo modelu"
        value={hladat}
        onChange={(event) => onHladatChange(event.target.value)}
      />
      <select
        className="rounded-xl border border-black/10 bg-white px-4 py-2"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="">Všetky stavy</option>
        <option value="in_progress">V procese</option>
        <option value="testing">Testovanie</option>
        <option value="completed">Dokončené</option>
        <option value="on_hold">Pozastavené</option>
      </select>
    </div>
  )
}

export default FilterBar
