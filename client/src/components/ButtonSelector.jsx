// Button definitions: label, description, price and Nh value for each action
const TLACIDLA = [
  { cislo: 1, popis: 'Výmena batérie / LCD', cena: '+5€', nh: '5 Nh' },
  { cislo: 2, popis: 'Batéria/LCD + ďalší diel', cena: '+10€', nh: '10 Nh' },
  { cislo: 3, popis: 'Repas LCD', cena: '+10€', nh: '10 Nh' },
  { cislo: 4, popis: 'Full refurb', cena: '+15€', nh: '15 Nh' },
]

function ButtonSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {TLACIDLA.map(({ cislo, popis, cena, nh }) => (
        <button
          key={cislo}
          type="button"
          onClick={() => onChange(cislo)}
          className={`rounded-lg border px-3 py-3 text-left ${
            value === cislo
              ? 'border-[#0071e3] bg-[#0071e3] text-white'
              : 'border-black/10 bg-white text-[#1d1d1f] hover:border-[#0071e3]'
          }`}
        >
          <div className="text-lg font-semibold">{cislo}</div>
          <div className="mt-0.5 text-xs leading-tight">{popis}</div>
          <div className={`mt-1 text-xs font-medium ${value === cislo ? 'text-white/80' : 'text-black/40'}`}>
            {cena} · {nh}
          </div>
        </button>
      ))}
    </div>
  )
}

export default ButtonSelector
