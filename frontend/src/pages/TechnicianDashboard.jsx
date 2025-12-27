import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { loadRequests, loadAssignedRequests, isOverdueISO, isUpcomingISO, isCompletedPastISO, daysOverdue, todayISO } from "../lib/maintenanceStorage";
import PreventiveCalendar from "./Calendar/PreventiveCalendar";
import { formatISOToDMY } from '../utils/dateUtils'
import "./TechnicianDashboard.css";

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  // Logged-in technician (demo)
  const technicianEmail = localStorage.getItem("userEmail") || "tech@company.com";
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'technician') {
      navigate('/login')
    }
  }, [role, navigate])

  // Load all requests (shared storage)
  // use safe loader so demo overdue entries exist when needed
  const allRequests = useMemo(() => (typeof loadRequestsSafe === 'function' ? loadRequestsSafe() : loadRequests()), []);
  // load only assigned requests (normalized shape)
  const assignedRequests = useMemo(() => loadAssignedRequests(technicianEmail), [technicianEmail]);

  const today = new Date();
  const todayStr = todayISO()
  const [selectedDate, setSelectedDate] = useState(null)

  // -----------------------------
  // 1️⃣ ASSIGNED REQUESTS (ONLY THIS TECHNICIAN)
  // (loaded via `loadAssignedRequests`) — objects contain the requested fields
  // -----------------------------

  // -----------------------------
  // 2️⃣ OVERDUE LOGIC
  // -----------------------------
  const isOverdue = (r) => r.scheduledDate && isOverdueISO(r.scheduledDate) && r.status !== "Repaired";

  const overdueRequests = assignedRequests.filter(isOverdue);

  // Upcoming: scheduledDate >= today and not repaired
  const upcomingRequests = assignedRequests.filter(r => r.scheduledDate && isUpcomingISO(r.scheduledDate) && r.status !== 'Repaired')

  // Split upcoming into Corrective and Preventive
  const correctiveUpcoming = upcomingRequests.filter(r => r.requestType === 'Corrective')
  const preventiveUpcomingAssigned = upcomingRequests.filter(r => r.requestType === 'Preventive')

  // Completed: status === 'Repaired' and completedDate < today
  const completedRequests = assignedRequests.filter(r => r.status === 'Repaired' && isCompletedPastISO(r.completedDate))

  // -----------------------------
  // 3️⃣ PREVENTIVE (GENERAL / UNASSIGNED)
  // -----------------------------
  const preventiveUpcoming = allRequests.filter((r) => {
    if (r.type !== "Preventive") return false;
    if (r.assignedTo) return false; // not yet picked
    if (!r.scheduledDate) return false;
    // upcoming within next 10 days (including today)
    const due = new Date(r.scheduledDate + 'T00:00:00');
    const diffDays = Math.floor((due - new Date(todayStr + 'T00:00:00')) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 10;
  });

  // -----------------------------
  // 4️⃣ KPI COUNTS
  // -----------------------------
  const stats = {
    assigned: assignedRequests.length,
    inProgress: assignedRequests.filter(r => r.status === "In Progress").length,
    overdue: overdueRequests.length,
    completed: completedRequests.length,
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="td-header">
        <div>
          <h2 style={{ margin: 0 }}>Technician Dashboard</h2>
          <div className="td-identity">
            <strong>{technicianEmail}</strong>{' '}
            <span style={{ padding: '4px 10px', background: '#eef6ff', borderRadius: 6, fontSize: 12 }}>
              Technician
            </span>
          </div>
        </div>
        <div className="td-actions">
          <button className="btn" onClick={() => navigate('/maintenance')}>Open Kanban</button>
          <button className="btn btn-primary" onClick={() => { localStorage.clear(); window.dispatchEvent(new Event('authChange')); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      {/* Summary */}
      <div className="td-summary">
        <Card title="Assigned" value={stats.assigned} />
        <Card title="In Progress" value={stats.inProgress} />
        <Card title="Overdue" value={stats.overdue} danger />
        <Card title="Completed" value={stats.completed} />
      </div>

      <div className="td-grid">
        <div>
          {/* Upcoming Tasks */}
          <section className="section">
            <h3>Upcoming Tasks</h3>
            {upcomingRequests.length === 0 ? (
              <div>No upcoming tasks.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <h4 style={{ margin: '6px 0' }}>Corrective Requests</h4>
                  {correctiveUpcoming.length === 0 ? <div style={{ color: '#666' }}>No corrective tasks.</div> : (
                    <div>
                            {correctiveUpcoming.map(r => (
                              <div key={r.id} className="task-row">
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontWeight: 700 }}>{r.equipmentName}</div>
                                    <div style={{ background: '#fff1f2', color: '#991b1b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>Corrective</div>
                                  </div>
                                  {r.subject && <div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>{r.subject}</div>}
                                  <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{formatISOToDMY(r.scheduledDate)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontWeight: 600 }}>{r.status}</div>
                                </div>
                              </div>
                            ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ margin: '6px 0' }}>Preventive Requests</h4>
                  {preventiveUpcomingAssigned.length === 0 ? <div style={{ color: '#666' }}>No preventive tasks.</div> : (
                    <div>
                      {preventiveUpcomingAssigned.map(r => (
                        <div key={r.id} className="task-row">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ fontWeight: 700 }}>{r.equipmentName}</div>
                              <div style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>Preventive</div>
                            </div>
                            <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{formatISOToDMY(r.scheduledDate)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>{r.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Overdue Requests */}
          <section className="section">
            <h3 style={{ color: '#b00020' }}>Overdue Requests</h3>
            {overdueRequests.length === 0 ? (
              <div>No overdue requests.</div>
            ) : (
              <div>
                {overdueRequests.map(r => (
                  <div key={r.id} className="overdue">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 10, background: '#b91c1c' }} title="Overdue" />
                        <div>
                          <div style={{ fontWeight: 700 }}>{r.equipmentName}</div>
                          <div style={{ fontSize: 13, color: '#666' }}>{r.requestType} — Scheduled: {formatISOToDMY(r.scheduledDate)}</div>
                          {r.subject && <div style={{ fontSize: 12, color: '#888' }}>{r.subject}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'red' }}>{r.status}</div>
                        <div style={{ fontSize: 12, color: '#900' }}>{daysOverdue(r.scheduledDate)} days overdue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Completed Requests */}
          <section className="section">
            <h3>Completed Requests</h3>
            {completedRequests.length === 0 ? (
              <div>No completed requests.</div>
            ) : (
              <div>
                {completedRequests.map(r => (
                  <div key={r.id} className="task-row">
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.equipmentName}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>{r.requestType}</div>
                      {r.subject && <div style={{ fontSize: 12, color: '#888' }}>{r.subject}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{formatISOToDMY(r.completedDate)}</div>
                      {r.durationMinutes && <div style={{ fontSize: 12, color: '#666' }}>{Math.round(r.durationMinutes/60)}h {r.durationMinutes%60}m</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <h3>Preventive Maintenance Calendar</h3>
          <div className="calendar-panel">
            <PreventiveCalendar
              requests={preventiveUpcoming.concat(allRequests.filter(r => r.type==='Preventive' && r.assignedTo))}
              onDateSelect={d => setSelectedDate(d)}
            />
            {selectedDate && (
              <div style={{ marginTop: 8 }}>
                <strong>Tasks on {selectedDate}:</strong>
                <div style={{ marginTop: 6 }}>
                  {allRequests.filter(r => r.type === 'Preventive' && r.scheduledDate === selectedDate).map(r => (
                    <div key={r.id} className="task-list-item">
                      <div style={{ fontWeight: 700 }}>{r.equipment}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{r.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================= */
/* KPI Card Component */
/* ============================= */
function Card({ title, value, danger }) {
  const cls = "card" + (danger ? " card-danger" : "")
  return (
    <div className={cls}>
      <h4>{title}</h4>
      <h2 style={{ color: danger ? "red" : "black" }}>{value}</h2>
    </div>
  )
}
