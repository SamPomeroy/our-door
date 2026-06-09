export default function LogReviewPanel({
  logs,
  query,
  severity,
  topic,
  topics,
  expandedLogId,
  isLoading,
  onQueryChange,
  onSeverityChange,
  onTopicChange,
  onRefresh,
  onToggleLog,
  formatTimestamp,
}) {
  function formatKnockType(value) {
    return {
      hint: "Hint",
      curriculum: "Curriculum Reference",
      next_step: "Next Step",
    }[value] ?? value ?? "Hint";
  }

  function formatHelpful(value) {
    if (value === true || value === 1) return "Helpful";
    if (value === false || value === 0) return "Not helpful";
    return "No feedback";
  }

  return (
    <section className="log-review-panel" aria-labelledby="log-review-heading">
      <div className="panel-heading">
        <div>
          <span>Conversation review</span>
          <h2 id="log-review-heading">Searchable logs</h2>
        </div>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="admin-filter-grid">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search topic, student, question, or response"
          />
        </label>
        <label>
          Severity
          <select value={severity} onChange={(event) => onSeverityChange(event.target.value)}>
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          Topic
          <select value={topic} onChange={(event) => onTopicChange(event.target.value)}>
            <option value="all">All topics</option>
            {topics.map((topicName) => (
              <option value={topicName} key={topicName}>
                {topicName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-log-list upgraded" aria-live="polite">
        {!isLoading && logs.length === 0 && (
          <article className="admin-empty">
            <span>No logs found</span>
            <p>Try clearing a filter or refreshing the backend logs.</p>
          </article>
        )}

        {logs.map((log) => {
          const isExpanded = expandedLogId === log.id;

          return (
            <article className="admin-log-card analytics-log-card" key={log.id}>
              <button type="button" className="log-card-button" onClick={() => onToggleLog(log.id)}>
                <div className="log-card-header">
                  <div>
                    <span>{log.question || log.topic || "General question"}</span>
                    <time dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
                  </div>
                  <strong>#{log.id}</strong>
                </div>
                <div className="log-badge-row">
                  <em>{log.topic}</em>
                  <em>{formatKnockType(log.knock_type)}</em>
                  <em className={`feedback-badge feedback-${formatHelpful(log.helpful).toLowerCase().replaceAll(" ", "-")}`}>
                    {formatHelpful(log.helpful)}
                  </em>
                  <em className={`severity-badge severity-${log.severity}`}>{log.severity}</em>
                  {log.knocksUsed >= 3 && <em>stuck</em>}
                  {log.guardrailTriggered && <em>guardrail triggered</em>}
                </div>
              </button>

              {isExpanded && (
                <dl>
                  <div>
                    <dt>Student asked</dt>
                    <dd>{log.question}</dd>
                  </div>
                  <div>
                    <dt>Our Door answered</dt>
                    <dd>{log.response}</dd>
                  </div>
                </dl>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
