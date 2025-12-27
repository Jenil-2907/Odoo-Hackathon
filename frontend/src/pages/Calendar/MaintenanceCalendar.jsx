import { useState } from "react";
import { loadRequests } from "../../lib/maintenanceStorage";
import { formatISOToDMY } from '../../utils/dateUtils'

export default function Calendar() {
  const [requests] = useState(() => loadRequests());
  const preventive = requests.filter((r) => r.type === "Preventive");

  return (
    <div style={{ padding: 20 }}>
      <h2>Calendar View</h2>

      <div style={{ marginTop: 12 }}>
        {preventive.length === 0 ? (
          <div>No preventive tasks.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            {preventive.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 8,
                }}
              >
                <div style={{ fontWeight: 700 }}>{p.equipment}</div>
                <div style={{ fontSize: 13, color: "#444" }}>
                  Scheduled: {formatISOToDMY(p.scheduledDate)}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Status: Scheduled / Unassigned
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
