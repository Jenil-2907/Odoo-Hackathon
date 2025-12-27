import { useParams } from "react-router-dom";

export default function RequestDetails() {
  const { id } = useParams();

  return (
    <div style={{ padding: 20 }}>
      <h2>Request Details</h2>
      <p>Request ID: {id}</p>
      <p>Equipment: CNC Machine</p>
      <p>Status: In Progress</p>
      <p>Type: Corrective</p>
    </div>
  );
}
