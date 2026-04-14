import React from 'react';

export default function ButtonSelector({ value, onChange }) {
  const buttons = [
    { id: 1, label: 'Basic Repair', nh: '5 Nh' },
    { id: 2, label: 'Display Repair', nh: '10 Nh' },
    { id: 3, label: 'Housing', nh: '15 Nh' },
    { id: 4, label: 'Complex', nh: '15 Nh' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          onClick={() => onChange(btn.id)}
          className={`p-3 rounded-lg border-2 text-center transition ${
            value === btn.id
              ? 'bg-apple-blue border-apple-blue text-white'
              : 'bg-white border-gray-300 text-apple-dark hover:border-apple-blue'
          }`}
        >
          <div className="font-bold text-lg">{btn.id}</div>
          <div className="text-xs mt-1">{btn.label}</div>
          <div className="text-xs font-semibold">{btn.nh}</div>
        </button>
      ))}
    </div>
  );
}
