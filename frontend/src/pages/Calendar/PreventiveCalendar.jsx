import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatISOToDMY } from '../../utils/dateUtils'

function getMonthMatrix(year, monthIndex){
  const first = new Date(year, monthIndex, 1)
  const startDay = first.getDay() // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, monthIndex+1, 0).getDate()
  const matrix = []
  let week = new Array(startDay).fill(null)
  for(let d=1; d<=daysInMonth; d++){
    week.push(d)
    if(week.length === 7){ matrix.push(week); week = [] }
  }
  if(week.length) {
    while(week.length < 7) week.push(null)
    matrix.push(week)
  }
  return matrix
}

export default function PreventiveCalendar({ requests = [] }){
  const navigate = useNavigate()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-based
  const [selectedDate, setSelectedDate] = useState(null)

  // Only include preventive requests
  const preventive = useMemo(() => requests.filter(r => (r.requestType === 'Preventive' || r.type === 'Preventive') && r.scheduledDate), [requests])

  const matrix = useMemo(() => getMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth])

  function prevMonth(){
    const d = new Date(viewYear, viewMonth-1, 1)
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth())
  }
  function nextMonth(){
    const d = new Date(viewYear, viewMonth+1, 1)
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth())
  }

  function tasksForDay(day){
    if(!day) return []
    const mm = String(viewMonth+1).padStart(2,'0')
    const dd = String(day).padStart(2,'0')
    const key = `${viewYear}-${mm}-${dd}`
    return preventive.filter(r => r.scheduledDate === key)
  }

  // helper: color by status
  function statusColor(s){
    if(!s) return '#0ea5e9' // default blue
    if(s === 'New') return '#0ea5e9'
    if(s === 'In Progress') return '#f97316'
    if(s === 'Repaired') return '#10b981'
    return '#94a3b8'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={prevMonth} className="btn">◀</button>
        <div style={{ fontWeight: 700 }}>{new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button onClick={nextMonth} className="btn">▶</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: 6 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ fontSize: 12, color: '#444' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {matrix.map((week, wi) => (
          week.map((day, di) => {
            const tasks = tasksForDay(day)
            const isCurrentMonth = day !== null
            const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
            const cellKey = day ? `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : `empty-${wi}-${di}`
            return (
              <div key={cellKey} onClick={() => { if(tasks.length) setSelectedDate(cellKey) }} style={{ minHeight: 80, borderRadius: 8, padding: 8, background: isCurrentMonth ? '#fff' : '#f6f7f9', border: tasks.length ? '1px solid rgba(14,165,233,0.12)' : '1px solid transparent', cursor: tasks.length ? 'pointer' : 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, color: isCurrentMonth ? '#111' : '#999' }}>{day || ''}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {tasks.slice(0,3).map(t => (
                      <div key={t.id} title={`${t.equipmentName || t.equipment} — ${t.status || t.state}`} style={{ width: 8, height: 8, borderRadius: 8, background: statusColor(t.status || t.state) }} />
                    ))}
                  </div>
                </div>
                {tasks.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#064e3b' }}>{tasks.length} preventive</div>
                )}
              </div>
            )
          })
        ))}
      </div>

      {/* Modal / list for selectedDate */}
      {selectedDate && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedDate(null)}>
          <div style={{ width: 720, maxHeight: '80vh', overflow: 'auto', background: '#fff', padding: 16, borderRadius: 8 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Preventive Tasks on {formatISOToDMY(selectedDate)}</div>
              <button className="btn" onClick={() => setSelectedDate(null)}>Close</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {preventive.filter(r => r.scheduledDate === selectedDate).map(r => (
                <div key={r.id} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, cursor: 'pointer', color: '#0b61ff' }} onClick={() => navigate(`/maintenance/${r.id}`)}>{r.equipmentName || r.equipment}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{r.subject || ''}</div>
                    <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>{r.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: statusColor(r.status), fontWeight: 700 }}>{r.status}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{r.durationMinutes ? `${Math.round(r.durationMinutes/60)}h ${r.durationMinutes%60}m` : '-'}</div>
                  </div>
                </div>
              ))}
              {preventive.filter(r => r.scheduledDate === selectedDate).length === 0 && (
                <div style={{ padding: 12 }}>No preventive tasks on this date.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
