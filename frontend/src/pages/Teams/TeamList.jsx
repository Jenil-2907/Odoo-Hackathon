export default function TeamList() {
  const teams = ["Mechanical", "Electrical", "IT Support"];

  return (
    <div style={{ padding: 20 }}>
      <h2>Maintenance Teams</h2>
      {teams.map(t => (
        <div key={t}>{t}</div>
      ))}
    </div>
  );
}
