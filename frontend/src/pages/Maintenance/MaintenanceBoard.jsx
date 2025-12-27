import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from 'react'
import KanbanCard from "../../Components/KanbanCard";
import { loadRequestsSafe, loadRequests, loadAssignedRequests, saveRequests } from '../../lib/maintenanceStorage'

export default function MaintenanceBoard() {
  const location = useLocation();
  const focusedId = location.state?.requestId;

  const navigate = useNavigate()

  // load full list from storage; we'll display only assigned-to-this-tech items
  const [allTasks, setAllTasks] = useState(() => (typeof loadRequestsSafe === 'function' ? loadRequestsSafe() : loadRequests()))

  useEffect(() => {
    const handler = () => setAllTasks(typeof loadRequestsSafe === 'function' ? loadRequestsSafe() : loadRequests())
    window.addEventListener('requestsUpdated', handler)
    return () => window.removeEventListener('requestsUpdated', handler)
  }, [])

  const userEmail = localStorage.getItem('userEmail') || 'tech@company.com'
  // only show requests assigned to this logged-in technician (uses loader which maps demo entries)
  const visibleTasks = useMemo(() => loadAssignedRequests(userEmail), [userEmail])

  const columns = ["New", "In Progress", "Repaired", "Scrap"];

  // Allowed transitions from -> to
  const allowed = {
    'New': ['In Progress'],
    'In Progress': ['Repaired','Scrap'],
    'Repaired': [],
    'Scrap': []
  }

  function showError(msg){
    // standardized error presentation (simple for now)
    alert(msg)
  }

  function onDropToColumn(e, column){
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if(!id) return
    const current = allTasks.find(t => String(t.id) === String(id))
    if(!current) return

    // Authorization: only assigned technician can act (allow demo entries assigned to 'tech@company.com')
    if(!(current.assignedTo === userEmail || current.assignedTo === 'tech@company.com')){
      showError('Unauthorized: you are not assigned to this request.')
      return
    }

    // block moves to same column
    if(current.status === column){ return }

    // Validate transition allowed
    const allowedTo = allowed[current.status] || []
    if(!allowedTo.includes(column)){
      showError(`Invalid transition: ${current.status} → ${column} is not allowed.`)
      return
    }

    // If moving In Progress -> Repaired, require duration
    let durationMinutes = null
    if(current.status === 'In Progress' && column === 'Repaired'){
      const resp = window.prompt('Enter actual duration in minutes (required)')
      if(resp === null){ showError('Operation cancelled. Duration is required to complete the request.'); return }
      const num = Number(resp)
      if(isNaN(num) || num <= 0){ showError('Invalid duration. Please enter a positive number of minutes.'); return }
      durationMinutes = Math.round(num)
    }

    // Apply updates to the full list
    const updatedAll = allTasks.map(t => {
      if(String(t.id) !== String(id)) return t
      const base = { ...t, status: column, statusUpdatedAt: new Date().toISOString(), assignedTo: userEmail }
      if(column === 'Repaired'){
        base.completedDate = new Date().toISOString()
        if(durationMinutes !== null) base.durationMinutes = durationMinutes
        base.scrapped = false
      }
      if(column === 'Scrap'){
        base.scrapped = true
      }
      return base
    })

    try{ saveRequests(updatedAll) }catch(err){ console.error('save',err) }
    setAllTasks(updatedAll)
    window.dispatchEvent(new Event('requestsUpdated'))
  }

  function allowDrop(e){ e.preventDefault() }

  return (
    <div style={{ padding: 20 }}>
      <h2>Maintenance Kanban Board</h2>

      <div style={{ display: "flex", gap: 20 }}>
        {columns.map(col => (
          <div key={col} style={{ width: "25%" }} onDragOver={allowDrop} onDrop={e => onDropToColumn(e, col)}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{col} <span style={{ fontSize: 12, color: '#666' }}>{visibleTasks.filter(t => t.status === col).length}</span></h3>
            <div style={{ minHeight: 200 }}>
              {visibleTasks
                .filter(t => t.status === col)
                .map(t => (
                  <KanbanCard
                    key={t.id}
                    task={t}
                    highlight={String(t.id) === String(focusedId)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
