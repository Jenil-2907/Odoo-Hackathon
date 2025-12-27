export const STORAGE_KEY = 'maintenance_requests_v1'
export const EQUIP_KEY = 'equipment_status_v1'

export function todayISO(){
  const d = new Date()
  return d.toISOString().slice(0,10)
}

function pad(n){ return n < 10 ? '0'+n : String(n) }

function toISODateString(date){
  if(!date) return null
  if(typeof date === 'string'){
    // try to normalize strings like 2026-1-5 -> 2026-01-05
    const m = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if(m){
      return `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`
    }
    return date.slice(0,10)
  }
  // Date object
  return date.toISOString().slice(0,10)
}

// demo data: include assignedTo, completedDate where applicable
export function loadRequests() {
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw){
      return JSON.parse(raw)
    }
  }catch(e){ console.error('loadRequests parse',e) }

  return [
    {
      id: 1,
      equipment: "Generator",
      equipmentName: "Generator",
      subject: "Quarterly inspection",
      type: "Preventive",
      requestType: "Preventive",
      scheduledDate: toISODateString("2026-01-15"),
      status: "New",
    },
    {
      id: 2,
      equipment: "AC Unit",
      equipmentName: "AC Unit",
      subject: "Filter replacement",
      type: "Preventive",
      requestType: "Preventive",
      scheduledDate: toISODateString("2025-03-18"),
      status: "New",
    },
    {
      id: 3,
      equipment: "Conveyor Belt",
      equipmentName: "Conveyor Belt",
      subject: "Belt misalignment",
      type: "Corrective",
      requestType: "Corrective",
      scheduledDate: toISODateString("2025-12-20"),
      status: "In Progress",
      assignedTo: "tech@company.com",
    },
    {
      id: 4,
      equipment: "Cooling Tower",
      equipmentName: "Cooling Tower",
      subject: "Motor replacement",
      type: "Corrective",
      requestType: "Corrective",
      scheduledDate: toISODateString("2025-12-10"),
      status: "Repaired",
      assignedTo: "tech@company.com",
      completedDate: toISODateString("2025-12-12"),
      durationMinutes: 180,
    },
    // Additional demo entries assigned to the demo technician
    {
      id: 5,
      equipment: "Pump",
      equipmentName: "Pump",
      subject: "Seal inspection",
      type: "Preventive",
      requestType: "Preventive",
      scheduledDate: toISODateString("2025-12-27"),
      status: "New",
      assignedTo: "tech@company.com",
    },
    {
      id: 6,
      equipment: "Boiler",
      equipmentName: "Boiler",
      subject: "Pressure check",
      type: "Corrective",
      requestType: "Corrective",
      scheduledDate: toISODateString("2025-12-30"),
      status: "New",
      assignedTo: "tech@company.com",
    },
    {
      id: 7,
      equipment: "Motor",
      equipmentName: "Motor",
      subject: "Vibration noise",
      type: "Corrective",
      requestType: "Corrective",
      scheduledDate: toISODateString("2025-12-20"),
      status: "New",
      assignedTo: "other@company.com",
    },
    {
      id: 8,
      equipment: "Compressor",
      equipmentName: "Compressor",
      subject: "Oil level",
      type: "Corrective",
      requestType: "Corrective",
      scheduledDate: toISODateString("2025-12-24"),
      status: "New",
      assignedTo: "tech@company.com",
    },
  ];
}

// ensure at least one overdue assigned request exists for demo technician
const _origLoadRequests = loadRequests
export function loadRequestsWithDemoSafety(){
  const list = _origLoadRequests()
  const today = todayISO()
  const hasOverdueForTech = list.some(r => r.assignedTo === 'tech@company.com' && r.scheduledDate && r.scheduledDate < today && r.status !== 'Repaired')
  if(!hasOverdueForTech){
    list.push({
      id: 999,
      equipment: 'Demo Pump',
      equipmentName: 'Demo Pump',
      subject: 'Demo overdue issue',
      type: 'Corrective',
      requestType: 'Corrective',
      scheduledDate: toISODateString(today.replace(/-/g,'-')),
      // make it yesterday
      scheduledDate: (()=>{ const d = new Date(); d.setDate(d.getDate()-2); return d.toISOString().slice(0,10) })(),
      status: 'New',
      assignedTo: 'tech@company.com'
    })
  }
  return list
}

// keep backward compatibility: export default loader name
export const loadRequestsSafe = loadRequestsWithDemoSafety

// Return requests assigned to a specific technician, normalized to contain
// requestType, status, scheduledDate, completedDate, equipmentName, subject
export function loadAssignedRequests(technicianEmail){
  const all = (typeof loadRequestsSafe === 'function' ? loadRequestsSafe() : loadRequests())
  const matched = all.filter(r => r.assignedTo === technicianEmail)
  // Normalize mapper
  const mapper = (r) => ({
    id: r.id,
    requestType: r.requestType || r.type,
    status: r.status,
    scheduledDate: r.scheduledDate,
    completedDate: r.completedDate || null,
    equipmentName: r.equipmentName || r.equipment || '',
    subject: r.subject || '',
    durationMinutes: r.durationMinutes,
    assignedTo: r.assignedTo,
    _raw: r,
  })

  if(matched.length > 0) return matched.map(mapper)

  // No direct matches: for demo convenience, if there are demo entries assigned to
  // the demo technician (`tech@company.com`), return those mapped to the current
  // technicianEmail so the dashboard shows demo content for any logged-in user.
  const demoAssigned = all.filter(r => r.assignedTo === 'tech@company.com')
  if(demoAssigned.length > 0 && technicianEmail){
    return demoAssigned.map(r => mapper(Object.assign({}, r, { assignedTo: technicianEmail })))
  }

  return []
}


export function saveRequests(list){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }catch(e){console.error('saveRequests',e)}
}

export function loadEquip(){
  try{ return JSON.parse(localStorage.getItem(EQUIP_KEY) || '{}') }catch(e){ console.error('loadEquip',e); return {} }
}
export function saveEquip(m){ try{ localStorage.setItem(EQUIP_KEY, JSON.stringify(m)) }catch(e){console.error('saveEquip',e)} }

export function isOverdueISO(scheduledISO){
  if(!scheduledISO) return false
  const today = todayISO()
  return scheduledISO < today
}

export function isUpcomingISO(scheduledISO){
  if(!scheduledISO) return false
  const today = todayISO()
  return scheduledISO >= today
}

export function daysOverdue(scheduledISO){
  if(!scheduledISO) return 0
  const s = new Date(scheduledISO + 'T00:00:00')
  const t = new Date(todayISO() + 'T00:00:00')
  const diff = Math.floor((t - s) / (1000*60*60*24))
  return diff > 0 ? diff : 0
}

// Completed in the past: completedDate < today
export function isCompletedPastISO(completedISO){
  if(!completedISO) return false
  const today = todayISO()
  return completedISO < today
}
