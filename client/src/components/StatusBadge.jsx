import React from 'react';

export default function StatusBadge({ status }) {
  const colors = {
    in_progress: 'bg-blue-100 text-blue-800',
    testing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.on_hold}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
