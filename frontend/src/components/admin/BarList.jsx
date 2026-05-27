export default function BarList({ title, subtitle, items }) {
  return (
    <section className="insight-panel">
      <div className="panel-heading">
        <div>
          <span>{subtitle}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="bar-list">
        {items.map((item) => (
          <div className="bar-row" key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="bar-track" aria-hidden="true">
              <span style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
