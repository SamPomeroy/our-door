import { useState } from "react";
import { sendFeedback, sendMessage } from "../api.js";
import DemoNav from "../components/DemoNav.jsx";
import DoorScene from "../components/DoorScene.jsx";
import { logger } from "../utils/logger.js";

const starterMessages = [];

const promptSuggestions = [
  "I keep mixing up parameters and arguments.",
  "How do I debug a FastAPI route without just guessing?",
  "What should I check when my vector search returns weird results?",
  "Can you guide me through Python scope without giving me the answer?",
];

// sidebar guide copy lives here so buttons and displayed explanation stay in sync
const toolGuides = [
  {
    id: "ask",
    label: "Ask",
    title: "Ask Our Door",
    body: "Step into a private space to ask any cohort question, especially the one you are not ready to ask out loud yet.",
  },
  {
    id: "curriculum",
    label: "Reference",
    title: "Curriculum reference",
    body: "Choose Reference when you want the answer tied back to cohort material, notes, or a concept you have already practiced.",
  },
  {
    id: "knocks",
    label: "Knocks",
    title: "Three knocks",
    body: "After writing your question, choose the kind of support you need: a hint, a curriculum reference, or a next step.",
  },
];

const knockTitles = {
  Hint: "Knock 1 - Hint",
  "Curriculum reference": "Knock 2 - Curriculum Reference",
  "Next step": "Knock 3 - Next Step",
};

const knockOptions = [
  { value: "hint", label: "Hint" },
  { value: "curriculum", label: "Reference" },
  { value: "next_step", label: "Next Step" },
];

function ThumbIcon({ direction }) {
  return (
    <svg
      className={`feedback-icon feedback-icon-${direction}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Z" />
      <path d="M7 10l5-8c1.4.3 2.2 1.6 1.8 3l-.7 3H19a3 3 0 0 1 2.9 3.7l-1.2 5A4 4 0 0 1 16.8 20H7V10Z" />
    </svg>
  );
}

function handleButtonEnter(event, action) {
  if (event.key !== "Enter" && event.code !== "NumpadEnter") return;
  if (event.repeat) return;

  event.preventDefault();
  action();
}

export default function StudentChat({ token, theme, onSignOut, onToggleTheme, demoMode, onSelectRole, onGoToSlides }) {
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState("");
  const [knockType, setKnockType] = useState("hint");
  const [isSending, setIsSending] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [error, setError] = useState("");
  const [chatStatus, setChatStatus] = useState("empty");
  const [activeGuide, setActiveGuide] = useState(toolGuides[0]);
  const [isDoorOpen, setIsDoorOpen] = useState(true);

  const isEmpty = messages.length === 0;
  const statusText = {
    empty: "Ready",
    loading: "Thinking",
    success: "Response ready",
    error: "Try again",
  }[chatStatus];

  function getKnockTitle(knock) {
    return knockTitles[knock] ?? knock ?? "Our Door";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextMessage = draft.trim();
    if (!nextMessage || isSending) return;

    logger.info("StudentChat", "Sending message");
    logger.debug("StudentChat", "Loading started");

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "student",
        text: nextMessage,
      },
    ]);
    setDraft("");
    setError("");
    setIsSending(true);
    setChatStatus("loading");

    try {
      const response = await sendMessage(nextMessage, token, knockType);
      const assistantText =
        response.response ??
        response.message ??
        response.answer ??
        "I found a path forward. Try breaking the problem into the smallest step you can test.";

      logger.info("StudentChat", "Chat request succeeded", { knock: response.knock });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: assistantText,
          logId: response.log_id,
          feedback: null,
          knocks: response.knock ? [{ title: getKnockTitle(response.knock), body: assistantText }] : null,
          source: response.sources?.length ? response.sources.join(", ") : null,
        },
      ]);
      setChatStatus("success");
    } catch (err) {
      logger.error("StudentChat", "Chat request failed", { status: err?.response?.status });
      logger.debug("StudentChat", "Error fallback triggered");
      setChatStatus("error");
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
      logger.debug("StudentChat", "Loading finished");
    }
  }

  async function handleFeedback(messageId, logId, helpful) {
    if (!logId || feedbackStatus[messageId] === "sending") return;

    setFeedbackStatus((currentStatus) => ({ ...currentStatus, [messageId]: "sending" }));

    try {
      await sendFeedback(logId, helpful, token);
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId ? { ...message, feedback: helpful } : message
        )
      );
      setFeedbackStatus((currentStatus) => ({ ...currentStatus, [messageId]: "saved" }));
    } catch (err) {
      logger.error("StudentChat", "Feedback request failed", { status: err?.response?.status });
      setFeedbackStatus((currentStatus) => ({ ...currentStatus, [messageId]: "error" }));
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function handleSignOut() {
    setIsDoorOpen(false);
    window.setTimeout(() => onSignOut(), 850);
  }

  return (
    <main className={`student-shell theme-${theme}`}>
      {demoMode && (
        <DemoNav
          activeView="student"
          onSelectRole={onSelectRole}
          onGoToSlides={onGoToSlides}
        />
      )}
      <aside className="student-sidebar" aria-label="Student workspace">
        <div className="brand-lockup">
          <div className="sidebar-door-scene" aria-hidden="true">
            <DoorScene compact open={isDoorOpen} pulse={0.25} />
          </div>
          <div>
            <p>Our Door</p>
            <span>Private Socratic support</span>
          </div>
        </div>

        <nav className="student-nav" aria-label="Chat tools">
          {toolGuides.map((guide) => (
            <button
              className={activeGuide.id === guide.id ? "is-active" : ""}
              key={guide.id}
              type="button"
              onClick={() => setActiveGuide(guide)}
              onKeyDown={(event) => handleButtonEnter(event, () => setActiveGuide(guide))}
              aria-pressed={activeGuide.id === guide.id}
            >
              {guide.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <span>{activeGuide.title}</span>
          <p>{activeGuide.body}</p>
        </div>

        <button className="ghost-button" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </aside>

      <section className="chat-stage" aria-labelledby="chat-heading">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Student chat</p>
            <h1 id="chat-heading">What are you stuck on?</h1>
          </div>
          <div className="status-pill">
            <span aria-hidden="true" />
            {statusText}
          </div>
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            <span className={`theme-icon ${theme === "dark" ? "sun" : "moon"}`} aria-hidden="true" />
            <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
          </button>
        </header>

        <div className="message-list" aria-live="polite">
          {isEmpty ? (
            <section className="chat-empty-state">
              <span>Welcome to Our Door</span>
              <h2>Start with a cohort question.</h2>
              <p>
                Try one of these examples, then choose the kind of knock you want: a hint, a reference, or a next step.
              </p>
              <div className="prompt-rail" aria-label="Suggested questions">
                {promptSuggestions.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => setDraft(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            messages.map((message) => (
              <article className={`message ${message.role} ${message.knocks ? "has-knocks" : ""}`} key={message.id}>
                {!message.knocks && message.text && <p>{message.text}</p>}
                {message.knocks && (
                  <div className="knock-grid">
                    {message.knocks.map((knock) => (
                      <section className="knock-card" key={knock.title}>
                        <span>{knock.title}</span>
                        <p>{knock.body}</p>
                      </section>
                    ))}
                  </div>
                )}
                {message.role === "assistant" && message.logId && (
                  <div className="response-feedback" aria-label="Response feedback">
                    <button
                      type="button"
                      className={message.feedback === true ? "is-selected" : ""}
                      disabled={feedbackStatus[message.id] === "sending"}
                      onClick={() => handleFeedback(message.id, message.logId, true)}
                      onKeyDown={(event) => handleButtonEnter(event, () => handleFeedback(message.id, message.logId, true))}
                      aria-pressed={message.feedback === true}
                      title="Helpful"
                    >
                      <ThumbIcon direction="up" />
                      <span className="sr-only">Helpful</span>
                    </button>
                    <button
                      type="button"
                      className={message.feedback === false ? "is-selected" : ""}
                      disabled={feedbackStatus[message.id] === "sending"}
                      onClick={() => handleFeedback(message.id, message.logId, false)}
                      onKeyDown={(event) => handleButtonEnter(event, () => handleFeedback(message.id, message.logId, false))}
                      aria-pressed={message.feedback === false}
                      title="Not helpful"
                    >
                      <ThumbIcon direction="down" />
                      <span className="sr-only">Not helpful</span>
                    </button>
                    {feedbackStatus[message.id] === "saved" && <span aria-live="polite">Saved</span>}
                    {feedbackStatus[message.id] === "error" && <span aria-live="polite">Try again</span>}
                  </div>
                )}
                {message.source && (
                  <div className="source-strip">
                    <span>Referenced</span>
                    <p>{message.source}</p>
                  </div>
                )}
              </article>
            ))
          )}

          {isSending && (
            <article className="message assistant thinking pipeline-card">
              <div className="heartbeat" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>Knocking on Our Door</p>
            </article>
          )}
        </div>

        <form className="chat-composer" onSubmit={handleSubmit}>
          <label htmlFor="student-question">Ask a coding question</label>
          <div className="composer-row">
            <textarea
              id="student-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Example: I keep mixing up parameters and arguments..."
              rows="3"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              onKeyDown={(event) => handleButtonEnter(event, () => event.currentTarget.form?.requestSubmit())}
            >
              Send
            </button>
          </div>
          <div className="composer-meta">
            <span>Choose your knock</span>
            <div className="knock-selector" aria-label="Knock type">
              {knockOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={knockType === option.value ? "is-active" : ""}
                  onClick={() => setKnockType(option.value)}
                  onKeyDown={(event) => handleButtonEnter(event, () => setKnockType(option.value))}
                  aria-pressed={knockType === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="composer-error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
