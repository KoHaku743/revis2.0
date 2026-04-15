function ButtonSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[1, 2, 3, 4].map((cislo) => (
        <button
          key={cislo}
          type="button"
          onClick={() => onChange(cislo)}
          className={`rounded-lg border px-4 py-3 text-lg font-semibold ${
            value === cislo
              ? 'border-[#0071e3] bg-[#0071e3] text-white'
              : 'border-black/10 bg-white text-[#1d1d1f] hover:border-[#0071e3]'
          }`}
        >
          Tlačidlo {cislo}
        </button>
      ))}
    </div>
  )
}

export default ButtonSelector
