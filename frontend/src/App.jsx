import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DemoLanding from "./pages/DemoLanding.jsx";
import Login from "./pages/Login.jsx";
import SlidesView from "./pages/SlidesView.jsx";
import StudentChat from "./pages/StudentChat.jsx";
import "./App.css";

const DEMO_PASSWORDS = { student: "learn2024", admin: "teach2024" };

function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [demoMode, setDemoMode] = useState(false);
  const [demoPreset, setDemoPreset] = useState(null);
  const [showSlides, setShowSlides] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  function handleLogin(nextSession) {
    setSession(nextSession);
    setDemoPreset(null);
    setShowSlides(false);
  }

  function handleSignOut() {
    setSession(null);
    setDemoPreset(null);
  }

  function enterDemoMode() {
    setDemoMode(true);
    setSession(null);
    setDemoPreset(null);
    setShowSlides(false);
  }

  function handleSelectDemoRole(role) {
    setDemoPreset({ password: DEMO_PASSWORDS[role], role });
    setShowSlides(false);
  }

  function handleDemoSession(nextSession) {
    setSession(nextSession);
    setDemoPreset(null);
    setShowSlides(false);
  }

  function handleGoToSlides() {
    setSession(null);
    setDemoPreset(null);
    setShowSlides(true);
  }

  if (showSlides) {
    return (
      <SlidesView
        slideIndex={slideIndex}
        onSlideChange={setSlideIndex}
        demoMode={demoMode}
        onSelectRole={handleSelectDemoRole}
        onGoToSlides={handleGoToSlides}
      />
    );
  }

  if (session?.role === "student") {
    return (
      <StudentChat
        token={session.token}
        theme={theme}
        onSignOut={handleSignOut}
        onToggleTheme={toggleTheme}
        demoMode={demoMode}
        onSelectRole={handleSelectDemoRole}
        onGoToSlides={handleGoToSlides}
      />
    );
  }

  if (session?.role === "admin") {
    return (
      <AdminDashboard
        token={session.token}
        theme={theme}
        onSignOut={handleSignOut}
        onToggleTheme={toggleTheme}
        demoMode={demoMode}
        onSelectRole={handleSelectDemoRole}
        onGoToSlides={handleGoToSlides}
      />
    );
  }

  if (demoMode && !demoPreset) {
    return (
      <DemoLanding
        onSelectRole={handleSelectDemoRole}
        onGoToSlides={handleGoToSlides}
      />
    );
  }

  return (
    <Login
      theme={theme}
      onLogin={handleLogin}
      onToggleTheme={toggleTheme}
      onEnterDemo={!demoMode ? enterDemoMode : undefined}
      initialPassword={demoPreset?.password ?? ""}
    />
  );
}

export default App;
