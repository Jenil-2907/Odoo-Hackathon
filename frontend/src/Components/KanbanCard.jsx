import { formatISOToDMY } from '../utils/dateUtils'

export default function KanbanCard() {
  const preventive = [
    { id: 1, equipment: "Generator", date: "2025-12-30" },
    { id: 2, equipment: "AC Unit", date: "2025-12-30" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Preventive Maintenance Calendar</h2>

      {preventive.map(p => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          📅 {formatISOToDMY(p.date)} — {p.equipment}
        </div>
      ))}
    </div>
  );
}
