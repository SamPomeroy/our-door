export default function ActivityFeed({ items, formatTimestamp }) {
  return (
    <section className="insight-panel activity-panel">
      <div className="panel-heading">
        <div>
          <span>Live review</span>
          <h2>Recent activity</h2>
        </div>
      </div>
      <div className="activity-feed">
        {items.map((item) => (
          <article className={`activity-item severity-${item.severity}`} key={item.id}>
            <div />
            <section>
              <span>{item.title}</span>
              <p>{item.body}</p>
              <time dateTime={item.timestamp}>{formatTimestamp(item.timestamp)}</time>
            </section>
          </article>
        ))}
      </div>
    </section>
  );
}
