import { useState } from "react";
import { sendMessage } from "../api.js";
import logo from "../assets/our_door_logo.png";
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
    body: "Bring the exact spot where you are stuck. Our Door answers with one useful nudge at a time instead of handing over the solution.",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    title: "Curriculum link",
    body: "Use this to connect the question back to cohort material, notes, or a concept you have already seen.",
  },
  {
    id: "knocks",
    label: "Three knocks",
    title: "Three knocks",
    body: "Knock one is a hint. Knock two points to the right curriculum. Knock three gives the next step or question.",
  },
];

const knockTitles = {
  Hint: "Knock 1 - Hint",
  "Curriculum reference": "Knock 2 - Curriculum Reference",
  "Next step": "Knock 3 - Next Step",
};

export default function StudentChat({ token, theme, onSignOut, onToggleTheme }) {
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [chatStatus, setChatStatus] = useState("empty");
  const [activeGuide, setActiveGuide] = useState(toolGuides[0]);

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
      const response = await sendMessage(nextMessage, token);
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
          knocks: response.knock ? [{ title: getKnockTitle(response.knock), body: assistantText }] : null,
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

  return (
    <main className={`student-shell theme-${theme}`}>
      <aside className="student-sidebar" aria-label="Student workspace">
        <div className="brand-lockup">
          <img src={logo} alt="" />
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

        <button className="ghost-button" type="button" onClick={onSignOut}>
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
              <h2>Ask what you are stuck on.</h2>
              <p>
                Share the smallest piece of the problem you can name. Our Door will answer with one guided knock at a time.
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
              placeholder="Example: I keep mixing up parameters and arguments..."
              rows="3"
            />
            <button type="submit" disabled={!draft.trim() || isSending}>
              Send
            </button>
          </div>
          {error && <p className="composer-error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
