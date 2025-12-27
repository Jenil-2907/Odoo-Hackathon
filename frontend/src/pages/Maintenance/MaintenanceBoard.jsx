import { useLocation } from "react-router-dom";
import KanbanCard from "../../components/KanbanCard";

export default function MaintenanceBoard() {
  const location = useLocation();
  const focusedId = location.state?.requestId;

  const tasks = [
    { id: 1, title: "Fix CNC Machine", status: "In Progress" },
    { id: 2, title: "Generator Service", status: "New" },
    { id: 3, title: "AC Inspection", status: "Repaired" },
  ];

  const columns = ["New", "In Progress", "Repaired", "Scrap"];

  return (
    <div style={{ padding: 20 }}>
      <h2>Maintenance Kanban Board</h2>

      <div style={{ display: "flex", gap: 20 }}>
        {columns.map(col => (
          <div key={col} style={{ width: "25%" }}>
            <h3>{col}</h3>
            {tasks
              .filter(t => t.status === col)
              .map(t => (
                <KanbanCard
                  key={t.id}
                  task={t}
                  highlight={t.id === focusedId}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
