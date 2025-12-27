import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SmartButton from "../../components/SmartButton";

export default function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch specific equipment using the ID from the URL
    fetch(`http://localhost:5000/api/equipment/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Equipment not found");
        return res.json();
      })
      .then((data) => {
        // If your API returns { success: true, data: {...} }, use data.data
        // If it returns the object directly, use data.
        setItem(data); 
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading details...</div>;
  if (!item) return <div style={{ padding: 20 }}>Equipment not found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{item.name} (ID: {item.id})</h2>
      
      {/* 2. Display SQL Schema fields */}
      <p><strong>Serial Number:</strong> {item.serial_number}</p>
      <p><strong>Department:</strong> {item.department}</p>
      <p><strong>Location:</strong> {item.location}</p>
      
      {/* 3. Handle the BOOLEAN is_scrapped field */}
      <p>
        <strong>Status: </strong> 
        <span style={{ color: item.is_scrapped ? "red" : "green" }}>
          {item.is_scrapped ? "Scrapped" : "Active"}
        </span>
      </p>

      <SmartButton
        label="Maintenance"
        count={0} // You can fetch open tickets count later
        onClick={() => navigate("/maintenance")}
      />
    </div>
  );
}