export function isOverdue(date) {
  const today = new Date();
  const due = new Date(date);
  return today > due;
}

export function formatISOToDMY(iso){
  if(!iso) return ''
  // accept both YYYY-MM-DD and full ISO
  const d = iso.slice(0,10).split('-')
  if(d.length !== 3) return iso
  return `${d[2]}/${d[1]}/${d[0]}`
}
