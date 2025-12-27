import React from 'react'

import { formatISOToDMY } from '../../utils/dateUtils'

export default function PreventiveCalendar({ requests = [], onDateSelect = () => {} }){
  // Simple month-list grouped by date for demo. Default to current month
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth()+1).padStart(2,'0')

  // gather dates in current month that have preventive tasks
  const dates = Array.from(new Set(requests
    .filter(r => r.type === 'Preventive' && r.scheduledDate && r.scheduledDate.startsWith(`${year}-${month}`))
    .map(r => r.scheduledDate)
  )).sort()

  return (
    <div>
      {dates.length === 0 ? (
        <div style={{ padding: 12 }}>No preventive tasks this month.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dates.map(d => (
            <button key={d} onClick={() => onDateSelect(d)} style={{ textAlign: 'left', padding: 8, border: '1px solid #eef', borderRadius: 6, background: '#f8fbff' }}>
              <div style={{ fontWeight: 700 }}>{formatISOToDMY(d)}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{requests.filter(r => r.scheduledDate === d).length} task(s)</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
