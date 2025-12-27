import { useState } from "react";
import { todayISO } from "../../lib/maintenanceStorage";
import { useNavigate } from "react-router-dom";

export default function CreateRequest() {
  const navigate = useNavigate();
  const [type, setType] = useState("Corrective");
  const [equipment, setEquipment] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("")
    // Validate scheduled date if preventive
    if (type === "Preventive") {
      if (!date) {
        setError("Please choose a scheduled date.")
        return
      }
      if (date < todayISO()) {
        setError("Scheduled date must be today or a future date.")
        return
      }
    }

    alert("Maintenance request created (demo)");
    navigate("/maintenance");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Maintenance Request</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option>Corrective</option>
            <option>Preventive</option>
          </select>
        </div>

        <div>
          <label>Equipment</label>
          <input value={equipment} onChange={e => setEquipment(e.target.value)} />
        </div>

        {type === "Preventive" && (
          <div>
            <label>Scheduled Date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={e => setDate(e.target.value)}
            />
            {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}
          </div>
        )}

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
