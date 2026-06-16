import { useState } from "react";
import { login } from "../api.js";
import DoorScene from "../components/DoorScene.jsx";

const CARDS = [
  {
    id: "student",
    label: "Student View",
    desc: "Live chat with Socratic guidance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "admin",
    label: "Admin View",
    desc: "Instructor dashboard and analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "slides",
    label: "Slides",
    desc: "Presentation deck",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <polygon points="10,8 16,11 10,14" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function DemoLanding({ onDemoSession, onGoToSlides }) {
  const [loading, setLoading] = useState(null);

  async function handleCard(id) {
    if (loading) return;
    if (id === "slides") {
      onGoToSlides();
      return;
    }
    setLoading(id);
    try {
      const password = id === "student" ? "learn2024" : "teach2024";
      const response = await login(password, id);
      onDemoSession({ token: response.access_token, role: id });
    } catch (err) {
      console.error("demo login failed", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="demo-landing">
      <header className="demo-landing-header">
        <div className="demo-door-scene" aria-hidden="true">
          <DoorScene compact pulse={0.35} />
        </div>
        <p className="demo-kicker">Team Three's Company</p>
        <h1 className="demo-title">Our Door</h1>
        <p className="demo-subtitle">Socratic learning for coding cohorts</p>
      </header>

      <div className="demo-cards">
        {CARDS.map(({ id, label, desc, icon }) => (
          <button
            key={id}
            className={`demo-card${loading === id ? " is-loading" : ""}`}
            onClick={() => handleCard(id)}
            disabled={loading !== null}
          >
            <span className="demo-card-icon">{icon}</span>
            <span className="demo-card-label">{label}</span>
            <span className="demo-card-desc">{desc}</span>
            {loading === id && <span className="demo-card-spinner" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </main>
  );
}
