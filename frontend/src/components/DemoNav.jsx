import { useState } from "react";
import { login } from "../api.js";

export default function DemoNav({ activeView, onDemoSession, onGoToSlides }) {
  const [loading, setLoading] = useState(null);

  async function handleNav(role) {
    if (loading) return;
    if (role === "slides") {
      onGoToSlides();
      return;
    }
    setLoading(role);
    try {
      const password = role === "student" ? "learn2024" : "teach2024";
      const response = await login(password, role);
      onDemoSession({ token: response.access_token, role });
    } catch (err) {
      console.error("demo nav login failed", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="demo-nav" role="navigation" aria-label="Demo navigation">
      <span className="demo-nav-label">demo</span>
      {[
        { id: "student", label: "Student" },
        { id: "admin", label: "Admin" },
        { id: "slides", label: "Slides" },
      ].map(({ id, label }) => (
        <button
          key={id}
          className={`demo-nav-btn${activeView === id ? " is-active" : ""}`}
          onClick={() => handleNav(id)}
          disabled={loading !== null}
          aria-current={activeView === id ? "page" : undefined}
        >
          {loading === id ? <span className="demo-nav-spinner" aria-hidden="true" /> : label}
        </button>
      ))}
    </div>
  );
}
