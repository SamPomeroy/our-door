import { useState } from "react";
import { sendMessage } from "../api.js";
import logo from "../assets/our_door_logo.png";

const starterMessages = [
  {
    id: 1,
    role: "student",
    text: "I understand functions, but I get lost when scope changes inside another function.",
  },
  {
    id: 2,
    role: "assistant",
    text: "Let's slow that down and look for the boundary between where a variable is created and where it is being read.",
    source: "python_functions_and_scope.md",
    knocks: [
      {
        title: "Hint",
        body: "Find the line where the variable first gets assigned. Then ask: is this inside or outside the function that tries to use it?",
      },
      {
        title: "Curriculum",
        body: "Review the Python functions and scope notes, especially local variables and function parameters.",
      },
      {
        title: "Next step",
        body: "Write a tiny two-function example and predict the output before running it.",
      },
    ],
  },
];

const promptSuggestions = [
  "I keep mixing up parameters and arguments.",
  "How do I debug a FastAPI route without just guessing?",
  "What should I check when my vector search returns weird results?",
  "Can you guide me through Python scope without giving me the answer?",
];

const pipelineSteps = [
  "Reading curriculum context",
  "Choosing a Socratic angle",
  "Checking the guardrail",
];

export default function StudentChat({ token, theme, onSignOut, onToggleTheme }) {
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const nextMessage = draft.trim();
    if (!nextMessage || isSending) return;

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

    try {
      const response = await sendMessage(nextMessage, token);
      const assistantText =
        response.response ??
        response.message ??
        response.answer ??
        "I found a path forward. Try breaking the problem into the smallest step you can test.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: assistantText,
        },
      ]);
    } catch (err) {
      console.error(err);
      setError("Our Door could not answer yet. Check that the backend is running, then try again.");
    } finally {
      setIsSending(false);
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
          <button className="is-active" type="button">Ask</button>
          <button type="button">Curriculum</button>
          <button type="button">Three knocks</button>
        </nav>

        <div className="sidebar-note">
          <span>Grounded in cohort material</span>
          <p>Answers guide your thinking without jumping straight to the solution.</p>
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
            RAG ready
          </div>
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            <span className={`theme-icon ${theme === "dark" ? "sun" : "moon"}`} aria-hidden="true" />
            <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
          </button>
        </header>

        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <p>{message.text}</p>
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
          ))}

          {isSending && (
            <article className="message assistant thinking pipeline-card">
              <p>Preparing a guided response</p>
              <div className="pipeline-steps">
                {pipelineSteps.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>
            </article>
          )}
        </div>

        <form className="chat-composer" onSubmit={handleSubmit}>
          <label htmlFor="student-question">Ask a coding question</label>
          <div className="prompt-rail" aria-label="Suggested questions">
            {promptSuggestions.map((prompt) => (
              <button type="button" key={prompt} onClick={() => setDraft(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
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
