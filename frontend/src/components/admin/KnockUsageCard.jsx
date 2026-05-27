export default function KnockUsageCard({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <section className="insight-panel knock-usage-panel">
      <div className="panel-heading">
        <div>
          <span>Three knocks</span>
          <h2>Knock progression</h2>
        </div>
      </div>
      <div className="knock-usage-grid">
        {items.map((item) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <div className="knock-usage" key={item.label}>
              <div style={{ "--progress": `${percent}%` }}>
                <strong>{percent}%</strong>
              </div>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
