export default function MetricCard({ label, value, delta }) {
  return (
    <section className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{delta}</p>
    </section>
  );
}
