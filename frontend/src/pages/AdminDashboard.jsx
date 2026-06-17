import { useEffect, useMemo, useState } from "react";
import { getLogs } from "../api.js";
import DemoNav from "../components/DemoNav.jsx";
import ActivityFeed from "../components/admin/ActivityFeed.jsx";
import BarList from "../components/admin/BarList.jsx";
import ConfusionQueue from "../components/admin/ConfusionQueue.jsx";
import KnockUsageCard from "../components/admin/KnockUsageCard.jsx";
import LogReviewPanel from "../components/admin/LogReviewPanel.jsx";
import MetricCard from "../components/admin/MetricCard.jsx";
import DoorScene from "../components/DoorScene.jsx";
import { buildAnalytics, mockAnalyticsLogs, normalizeLog } from "../data/adminAnalytics.js";

export default function AdminDashboard({ token, theme, onSignOut, onToggleTheme, demoMode, onSelectRole, onGoToSlides }) {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [expandedLogId, setExpandedLogId] = useState(null);
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

  const dashboardLogs = logs.length > 0 ? logs : mockAnalyticsLogs;
  const isUsingSampleData = logs.length === 0 && !isLoading;

  const normalizedLogs = useMemo(
    () => dashboardLogs.map((log, index) => normalizeLog(log, index)),
    [dashboardLogs]
  );

  const analytics = useMemo(() => buildAnalytics(dashboardLogs), [dashboardLogs]);

  const topics = useMemo(
    () => [...new Set(normalizedLogs.map((log) => log.topic).filter(Boolean))].sort(),
    [normalizedLogs]
  );

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedLogs.filter((log) => {
      const matchesQuery =
        !normalizedQuery ||
        [log.student, log.topic, log.question, log.response]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
      const matchesTopic = topicFilter === "all" || log.topic === topicFilter;

      return matchesQuery && matchesSeverity && matchesTopic;
    });
  }, [normalizedLogs, query, severityFilter, topicFilter]);

  const latestLog = normalizedLogs[0];
  const topicCount = topics.length;

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

  function handleToggleLog(logId) {
    setExpandedLogId((currentLogId) => (currentLogId === logId ? null : logId));
  }

  return (
    <main className={`admin-shell theme-${theme}`}>
      {demoMode && (
        <DemoNav
          activeView="admin"
          onSelectRole={onSelectRole}
          onGoToSlides={onGoToSlides}
        />
      )}
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
            <p className="eyebrow">Instructor insights</p>
            <h1 id="admin-heading">Cohort signal room</h1>
          </div>
          <div className="status-pill">
            <span aria-hidden="true" />
            {isUsingSampleData ? "Sample analytics" : "Logs ready"}
          </div>
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            <span className={`theme-icon ${theme === "dark" ? "sun" : "moon"}`} aria-hidden="true" />
            <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
          </button>
        </header>

        {error && <p className="admin-error">{error}</p>}
        {isUsingSampleData && (
          <p className="admin-sample-note">
            Showing sample analytics until live student logs are available from the backend.
          </p>
        )}

        <div className="admin-dashboard-scroll">
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

          {!isLoading && (
            <>
              <section className="metric-grid" aria-label="Cohort analytics">
                {analytics.metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </section>

              <section className="analytics-grid" aria-label="Dashboard charts">
                <BarList
                  title="Questions by topic"
                  subtitle="Curriculum hotspots"
                  items={analytics.topicBars}
                />
                <BarList
                  title="Student frustration"
                  subtitle="Severity trend"
                  items={analytics.severityBars}
                />
                <BarList
                  title="Weekly usage"
                  subtitle="Activity"
                  items={analytics.usageBars}
                />
                <KnockUsageCard items={analytics.knockUsage} />
              </section>

              <section className="analytics-grid lower" aria-label="Instructor review signals">
                <ActivityFeed items={analytics.activity} formatTimestamp={formatTimestamp} />
                <ConfusionQueue items={analytics.confusionQueue} />
                <section className="insight-panel repeated-panel">
                  <div className="panel-heading">
                    <div>
                      <span>Pattern detection</span>
                      <h2>Repeated questions</h2>
                    </div>
                  </div>
                  <div className="repeated-list">
                    {analytics.repeatedQuestions.map((item) => (
                      <article key={item.topic}>
                        <strong>{item.topic}</strong>
                        <span>{item.count} similar questions</span>
                        <p>{item.summary}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <LogReviewPanel
                logs={filteredLogs}
                query={query}
                severity={severityFilter}
                topic={topicFilter}
                topics={topics}
                expandedLogId={expandedLogId}
                isLoading={isLoading}
                onQueryChange={setQuery}
                onSeverityChange={setSeverityFilter}
                onTopicChange={setTopicFilter}
                onRefresh={loadLogs}
                onToggleLog={handleToggleLog}
                formatTimestamp={formatTimestamp}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
