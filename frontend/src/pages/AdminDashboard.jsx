import { useEffect, useMemo, useState } from "react";
import { getLogs } from "../api.js";
import DoorScene from "../components/DoorScene.jsx";

export default function AdminDashboard({ token, theme, onSignOut, onToggleTheme }) {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDoorOpen, setIsDoorOpen] = useState(true);

  async function loadLogs() {
    setError("");
    setIsLoading(true);

    try {
      const nextLogs = await getLogs(token);
      setLogs(Array.isArray(nextLogs) ? nextLogs : []);
    } catch (err) {
      console.error(err);
      setError("Could not load conversation logs. Check the backend, then refresh.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    getLogs(token)
      .then((nextLogs) => {
        if (isCurrent) setLogs(Array.isArray(nextLogs) ? nextLogs : []);
      })
      .catch((err) => {
        console.error(err);
        if (isCurrent) setError("Could not load conversation logs. Check the backend, then refresh.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token]);

  // Search checks the fields an instructor is most likely to scan while looking
  // for repeated stuck points across the cohort.
  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return logs;

    return logs.filter((log) =>
      [log.topic, log.question, log.response]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [logs, query]);

  const latestLog = logs[0];
  const topicCount = new Set(logs.map((log) => log.topic).filter(Boolean)).size;

  function formatTimestamp(value) {
    if (!value) return "Unknown time";

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function handleSignOut() {
    setIsDoorOpen(false);
    window.setTimeout(() => onSignOut(), 850);
  }

  return (
    <main className={`admin-shell theme-${theme}`}>
      <aside className="student-sidebar" aria-label="Admin workspace">
        <div className="brand-lockup">
          <div className="sidebar-door-scene" aria-hidden="true">
            <DoorScene compact open={isDoorOpen} pulse={0.25} />
          </div>
          <div>
            <p>Our Door</p>
            <span>Admin review</span>
          </div>
        </div>

        <div className="admin-summary">
          <section>
            <span>Total logs</span>
            <strong>{logs.length}</strong>
          </section>
          <section>
            <span>Topics</span>
            <strong>{topicCount}</strong>
          </section>
          <section>
            <span>Latest</span>
            <strong>{latestLog ? formatTimestamp(latestLog.timestamp) : "None yet"}</strong>
          </section>
        </div>

        <div className="sidebar-note">
          <span>Instructor view</span>
          <p>Use the logs to spot where students are getting stuck and where support may need to happen next.</p>
        </div>

        <button className="ghost-button" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </aside>

      <section className="admin-stage" aria-labelledby="admin-heading">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 id="admin-heading">Conversation logs</h1>
          </div>
          <div className="status-pill">
            <span aria-hidden="true" />
            Logs ready
          </div>
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            <span className={`theme-icon ${theme === "dark" ? "sun" : "moon"}`} aria-hidden="true" />
            <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
          </button>
        </header>

        <div className="admin-toolbar">
          <label htmlFor="log-search">Search logs</label>
          <div>
            <input
              id="log-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topic, question, or response"
            />
            <button type="button" onClick={loadLogs} disabled={isLoading}>
              {isLoading ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-log-list" aria-live="polite">
          {isLoading && (
            <article className="message assistant thinking pipeline-card">
              <div className="heartbeat" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>Loading admin logs</p>
            </article>
          )}

          {!isLoading && filteredLogs.length === 0 && (
            <article className="admin-empty">
              <span>No logs found</span>
              <p>{query ? "Try a different search term." : "Student conversations will appear here once they are logged."}</p>
            </article>
          )}

          {!isLoading &&
            filteredLogs.map((log) => (
              <article className="admin-log-card" key={log.id}>
                <div className="log-card-header">
                  <div>
                    <span>{log.question || log.topic || "General question"}</span>
                    <time dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
                  </div>
                  <strong>#{log.id}</strong>
                </div>
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
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
