export default function SmartButton({ label, count, onClick }) {
  return (
    <button onClick={onClick}>
      {label} ({count})
    </button>
  );
}
