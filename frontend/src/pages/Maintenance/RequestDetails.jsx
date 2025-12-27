import { useParams, useNavigate } from "react-router-dom";
import { loadRequestsSafe, loadRequests, saveRequests } from "../../lib/maintenanceStorage";
import { formatISOToDMY } from '../../utils/dateUtils'
import { useState } from 'react'

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const all = typeof loadRequestsSafe === 'function' ? loadRequestsSafe() : loadRequests()
  const [requests, setRequests] = useState(all)
  const [durationInput, setDurationInput] = useState('')
  const [error, setError] = useState('')
  const req = requests.find(r => String(r.id) === String(id))

  if(!req){
    return (
      <div style={{ padding: 20 }}>
        <h2>Request Details</h2>
        <p>Request not found.</p>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    )
  }

  function startWork(){
    if(!req || req.status !== 'New') return
    const updated = requests.map(r => {
      if(String(r.id) !== String(req.id)) return r
      return {
        ...r,
        status: 'In Progress',
        startTime: new Date().toISOString(),
        assignedTo: r.assignedTo || localStorage.getItem('userEmail') || r.assignedTo
      }
    })
    try{
      saveRequests(updated)
    }catch(e){ console.error('saveRequests',e) }
    setRequests(updated)
    window.dispatchEvent(new Event('requestsUpdated'))
  }

  function markRepaired(){
    setError('')
    const minutes = Number(durationInput)
    if(isNaN(minutes) || minutes <= 0){
      setError('Please enter the actual duration in minutes (greater than 0).')
      return
    }
    // ensure latest request state
    const current = requests.find(r => String(r.id) === String(id))
    if(!current || current.status !== 'In Progress'){
      setError('Request must be In Progress to mark as Repaired.')
      return
    }
    const updated = requests.map(r => {
      if(String(r.id) !== String(id)) return r
      return {
        ...r,
        status: 'Repaired',
        completedDate: new Date().toISOString(),
        durationMinutes: Math.round(minutes)
      }
    })
    try{
      saveRequests(updated)
    }catch(e){ console.error('saveRequests', e) }
    setRequests(updated)
    setDurationInput('')
    window.dispatchEvent(new Event('requestsUpdated'))
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Request Details</h2>
      <div style={{ marginTop: 12 }}>
        <strong>Equipment:</strong> {req.equipmentName || req.equipment}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Subject:</strong> {req.subject || '-'}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Type:</strong> {req.requestType || req.type}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Status:</strong> {req.status}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Scheduled Date:</strong> {formatISOToDMY(req.scheduledDate)}
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Completed Date:</strong> {req.completedDate ? formatISOToDMY(req.completedDate) : '-'}
      </div>
      {req.durationMinutes && (
        <div style={{ marginTop: 6 }}>
          <strong>Duration:</strong> {Math.round(req.durationMinutes/60)}h {req.durationMinutes%60}m
        </div>
      )}

      {/* Start Work button for New requests */}
      {req.status === 'New' && (
        <div style={{ marginTop: 12 }}>
          <button onClick={startWork} style={{ padding: '8px 12px' }}>Start Work</button>
        </div>
      )}

      {/* Mark Repaired: only when In Progress - require duration */}
      {req.status === 'In Progress' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ marginRight: 8 }}>
              Actual duration (minutes):
            </label>
            <input
              type="number"
              min="1"
              value={durationInput}
              onChange={e => setDurationInput(e.target.value)}
              style={{ width: 120, padding: 6 }}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button onClick={markRepaired} style={{ padding: '8px 12px' }}>Mark Repaired</button>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
