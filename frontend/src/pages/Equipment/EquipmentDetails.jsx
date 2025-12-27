import { useParams, useNavigate } from "react-router-dom";
import SmartButton from "../../components/SmartButton";

export default function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Equipment Details (ID: {id})</h2>
      <p>Status: Active</p>

      <SmartButton
        label="Maintenance"
        count={2}
        onClick={() => navigate("/maintenance")}
      />
    </div>
  );
}
