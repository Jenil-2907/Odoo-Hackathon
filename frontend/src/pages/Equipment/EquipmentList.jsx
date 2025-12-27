import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EquipmentList() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch data from your backend API
    fetch("http://localhost:5000/api/equipment")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch equipment");
        return res.json();
      })
      .then((data) => {
        // 2. Set the data from SQL into state
        setEquipment(data); 
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Equipment List</h2>
      {equipment.map((e) => (
        <div key={e.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
          {/* 3. Use exact column names from your SQL Schema */}
          <strong>{e.name}</strong> 
          <span style={{ marginLeft: 10, color: "#666" }}>
             ({e.department || "No Dept"})
          </span>
          
          <button 
            style={{ marginLeft: 20 }}
            onClick={() => navigate(`/equipment/${e.id}`)}
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}