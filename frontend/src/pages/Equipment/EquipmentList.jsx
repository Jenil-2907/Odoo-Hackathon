import { useNavigate } from "react-router-dom";

export default function EquipmentList() {
  const navigate = useNavigate();

  const equipment = [
    { id: 1, name: "CNC Machine", dept: "Production" },
    { id: 2, name: "Printer", dept: "Office" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Equipment List</h2>

      {equipment.map(e => (
        <div key={e.id}>
          {e.name} ({e.dept})
          <button onClick={() => navigate(`/equipment/${e.id}`)}>
            View
          </button>
        </div>
      ))}
    </div>
  );
}
