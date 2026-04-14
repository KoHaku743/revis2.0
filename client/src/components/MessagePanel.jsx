import { useState } from 'react'

function MessagePanel({ spravy, onSend }) {
  const [text, setText] = useState('')

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="m-0 text-lg font-semibold">Správy ku telefónu</h3>
      <div className="my-3 space-y-2">
        {spravy.map((sprava) => (
          <div key={sprava.id} className="rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm">
            <strong>{sprava.from_name}:</strong> {sprava.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-black/10 px-3 py-2"
          placeholder="Napíšte správu kolegovi"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button
          className="rounded-full bg-[#0071e3] px-4 py-2 text-white"
          onClick={() => {
            if (!text.trim()) {
              return
            }
            onSend(text)
            setText('')
          }}
        >
          Poslať
        </button>
      </div>
    </section>
  )
}

export default MessagePanel
