export const mockAnalyticsLogs = [
  {
    id: "sample-41",
    student: "Student A",
    topic: "FastAPI",
    question: "How do I debug a FastAPI route without just guessing?",
    response: "What tools or methods can you use to inspect the request and response data in your FastAPI application?",
    timestamp: "2026-05-20T18:55:00.000Z",
    severity: "medium",
    knocksUsed: 2,
    guardrailTriggered: false,
  },
  {
    id: "sample-38",
    student: "Student B",
    topic: "JWT Auth",
    question: "I am confused about JWT tokens. What are they used for?",
    response: "Think about what the token lets the server remember without storing a full session.",
    timestamp: "2026-05-20T17:20:00.000Z",
    severity: "high",
    knocksUsed: 3,
    guardrailTriggered: false,
  },
  {
    id: "sample-34",
    student: "Student C",
    topic: "Vector Search",
    question: "What should I check when my vector search returns weird results?",
    response: "Start by checking your input data, preprocessing, and distance metric.",
    timestamp: "2026-05-19T20:12:00.000Z",
    severity: "medium",
    knocksUsed: 2,
    guardrailTriggered: true,
  },
  {
    id: "sample-29",
    student: "Student D",
    topic: "Python Scope",
    question: "Can you guide me through Python scope without giving me the answer?",
    response: "Find where the variable is created, then compare that to where it is being read.",
    timestamp: "2026-05-18T15:48:00.000Z",
    severity: "low",
    knocksUsed: 1,
    guardrailTriggered: false,
  },
  {
    id: "sample-22",
    student: "Student E",
    topic: "JWT Auth",
    question: "Why do I need bearer tokens in my headers?",
    response: "What does the backend need from the request before it can trust who is asking?",
    timestamp: "2026-05-17T14:08:00.000Z",
    severity: "high",
    knocksUsed: 3,
    guardrailTriggered: true,
  },
];

const topicFallbacks = ["JWT Auth", "FastAPI", "Vector Search", "Python Scope", "React State"];

export function normalizeLog(log, index) {
  const question = log.question || "Student question unavailable";
  const topic = normalizeTopic(log.topic, question, index);
  const severity = log.severity || inferSeverity(question, log.response);
  const guardrailTriggered = Boolean(
    log.guardrailTriggered || log.guardrail_triggered || shouldTriggerGuardrail(question)
  );

  return {
    ...log,
    id: log.id ?? `log-${index + 1}`,
    student: log.student || `Student ${String.fromCharCode(65 + (index % 26))}`,
    topic,
    question,
    response: log.response || "No response recorded yet.",
    timestamp: log.timestamp || new Date(Date.now() - index * 86400000).toISOString(),
    severity,
    knocksUsed: log.knocksUsed || inferKnocksUsed(severity, index),
    guardrailTriggered,
  };
}

export function buildAnalytics(logs) {
  const normalizedLogs = logs.map(normalizeLog);
  const topicCounts = countBy(normalizedLogs, "topic");
  const severityCounts = countBy(normalizedLogs, "severity");
  const totalKnocks = normalizedLogs.reduce((sum, log) => sum + log.knocksUsed, 0);
  const guardrailCount = normalizedLogs.filter((log) => log.guardrailTriggered).length;
  const stuckStudents = new Set(
    normalizedLogs.filter((log) => log.severity === "high" || log.knocksUsed >= 3).map((log) => log.student)
  ).size;

  const repeatedQuestions = [
    {
      topic: "JWT Auth",
      count: Math.max(2, topicCounts["JWT Auth"] || 0),
      summary: "Students are mixing up tokens, headers, and login state.",
    },
    {
      topic: "Vector Search",
      count: Math.max(2, topicCounts["Vector Search"] || 0),
      summary: "Questions cluster around distance metrics and messy inputs.",
    },
  ];

  return {
    metrics: [
      { label: "Student sessions", value: Math.max(normalizedLogs.length + 4, 8), delta: "+12%" },
      { label: "Questions asked", value: normalizedLogs.length, delta: "Live logs" },
      { label: "Top topic", value: topEntry(topicCounts)?.label || "No topic", delta: "Most repeated" },
      { label: "Stuck students", value: stuckStudents, delta: "Need review" },
      {
        label: "Avg knocks/session",
        value: normalizedLogs.length ? (totalKnocks / normalizedLogs.length).toFixed(1) : "0.0",
        delta: "Guidance depth",
      },
      { label: "Guardrails", value: guardrailCount, delta: "Interventions" },
    ],
    topicBars: toBars(topicCounts).slice(0, 6),
    severityBars: toBars(severityCounts, ["low", "medium", "high"]),
    usageBars: buildUsageBars(normalizedLogs),
    knockUsage: [
      { label: "Knock 1", value: normalizedLogs.filter((log) => log.knocksUsed === 1).length || 2 },
      { label: "Knock 2", value: normalizedLogs.filter((log) => log.knocksUsed === 2).length || 3 },
      { label: "Knock 3", value: normalizedLogs.filter((log) => log.knocksUsed >= 3).length || 2 },
    ],
    repeatedQuestions,
    activity: normalizedLogs.slice(0, 5).map((log) => ({
      id: log.id,
      title: log.guardrailTriggered ? "Guardrail review" : `${log.student} asked about ${log.topic}`,
      body: log.question,
      severity: log.severity,
      timestamp: log.timestamp,
    })),
    confusionQueue: normalizedLogs
      .filter((log) => log.severity !== "low" || log.knocksUsed >= 3 || log.guardrailTriggered)
      .slice(0, 4)
      .map((log) => ({
        id: log.id,
        student: log.student,
        topic: log.topic,
        reason: log.guardrailTriggered
          ? "Guardrail triggered during support."
          : log.knocksUsed >= 3
            ? "Needed all three knocks."
            : "Repeated confusion pattern.",
        severity: log.severity,
      })),
  };
}

function inferTopic(text = "") {
  const value = text.toLowerCase();
  if (shouldTriggerGuardrail(value)) return "Safety / Guardrail";
  if (value.includes("jwt") || value.includes("token")) return "JWT Auth";
  if (value.includes("fastapi") || value.includes("route")) return "FastAPI";
  if (value.includes("vector") || value.includes("search")) return "Vector Search";
  if (value.includes("scope") || value.includes("function")) return "Python Scope";
  if (value.includes("react") || value.includes("state")) return "React State";
  return "";
}

function normalizeTopic(rawTopic = "", question = "", index = 0) {
  const topic = String(rawTopic || "").trim();
  const looksLikeQuestion =
    topic.length > 34 ||
    topic.includes("?") ||
    /^(how|what|why|can|do|i am|i'm|im)\b/i.test(topic);

  if (topic && !looksLikeQuestion) return topic;

  return inferTopic(`${question} ${topic}`) || topicFallbacks[index % topicFallbacks.length];
}

function inferSeverity(question = "", response = "") {
  const combined = `${question} ${response}`.toLowerCase();
  if (shouldTriggerGuardrail(combined)) return "high";
  if (combined.includes("confused") || combined.includes("stuck") || combined.includes("lost")) return "high";
  if (combined.includes("debug") || combined.includes("weird") || combined.includes("why")) return "medium";
  return "low";
}

function shouldTriggerGuardrail(text = "") {
  const value = String(text).toLowerCase();
  return /\b(kill|hurt|harm|attack|weapon)\b/.test(value);
}

function inferKnocksUsed(severity, index) {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return index % 4 === 0 ? 2 : 1;
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "Unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function topEntry(counts) {
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)[0];
}

function toBars(counts, order) {
  const entries = order ? order.map((label) => [label, counts[label] || 0]) : Object.entries(counts);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return entries
    .map(([label, value]) => ({
      label,
      value,
      percent: Math.round((value / max) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

function buildUsageBars(logs) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const counts = days.map((label, index) => ({
    label,
    value: Math.max(1, logs.filter((_, logIndex) => logIndex % days.length === index).length + index),
  }));
  const max = Math.max(...counts.map((item) => item.value), 1);

  return counts.map((item) => ({ ...item, percent: Math.round((item.value / max) * 100) }));
}
