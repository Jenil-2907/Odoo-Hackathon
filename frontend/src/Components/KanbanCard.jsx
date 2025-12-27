import { formatISOToDMY } from '../utils/dateUtils'
import { isOverdueISO } from '../lib/maintenanceStorage'

export default function KanbanCard({ task = {}, highlight = false }) {
  const overdue = task.scheduledDate && isOverdueISO(task.scheduledDate) && task.status !== 'Repaired' && !task.scrapped

  function initials(emailOrName){
    if(!emailOrName) return 'U'
    const parts = (emailOrName.indexOf('@')>-1 ? emailOrName.split('@')[0] : emailOrName).split(/[._\- ]+/)
    return (parts[0] || '').slice(0,1).toUpperCase() + (parts[1] ? parts[1].slice(0,1).toUpperCase() : '')
  }

  const isFinal = task.status === 'Repaired' || task.status === 'Scrap' || task.scrapped

  return (
    <div
      draggable={!isFinal}
      onDragStart={e => { e.dataTransfer.setData('text/plain', String(task.id)) }}
      style={{
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        background: highlight ? '#fffbe6' : '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        border: overdue ? '1px solid #f87171' : '1px solid #e6eef8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: isFinal ? 'default' : 'grab'
      }}
    >
      <div>
        <div style={{ fontWeight: 700 }}>{task.equipmentName || task.equipment || task.title}</div>
        {task.subject && <div style={{ fontSize: 13, color: '#444' }}>{task.subject}</div>}
        {task.scheduledDate && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{formatISOToDMY(task.scheduledDate)}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ fontSize: 12, color: overdue ? '#b91c1c' : '#111', fontWeight: 700 }}>{task.status}</div>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e3a8a' }} title={task.assignedTo || ''}>{initials(task.assignedTo || task.equipmentName)}</div>
      </div>
    </div>
  )
}
