export default function ConfusionQueue({ items }) {
  return (
    <section className="insight-panel confusion-panel">
      <div className="panel-heading">
        <div>
          <span>Instructor attention</span>
          <h2>Confusion detection</h2>
        </div>
      </div>
      <div className="confusion-list">
        {items.map((item) => (
          <article className="confusion-card" key={item.id}>
            <div>
              <span>{item.student}</span>
              <strong>{item.topic}</strong>
            </div>
            <p>{item.reason}</p>
            <em className={`severity-badge severity-${item.severity}`}>{item.severity}</em>
          </article>
        ))}
      </div>
    </section>
  );
}
