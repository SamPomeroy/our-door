import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DemoLanding from "./pages/DemoLanding.jsx";
import Login from "./pages/Login.jsx";
import SlidesView from "./pages/SlidesView.jsx";
import StudentChat from "./pages/StudentChat.jsx";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [demoMode, setDemoMode] = useState(false);
  const [showSlides, setShowSlides] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  function handleLogin(nextSession) {
    setSession(nextSession);
    setShowSlides(false);
  }

  function handleSignOut() {
    setSession(null);
  }

  function enterDemoMode() {
    setDemoMode(true);
    setSession(null);
    setShowSlides(false);
  }

  function handleDemoSession(nextSession) {
    setSession(nextSession);
    setShowSlides(false);
  }

  function handleGoToSlides() {
    setSession(null);
    setShowSlides(true);
  }

  if (showSlides) {
    return (
      <SlidesView
        slideIndex={slideIndex}
        onSlideChange={setSlideIndex}
        demoMode={demoMode}
        onDemoSession={handleDemoSession}
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
        onDemoSession={handleDemoSession}
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
        onDemoSession={handleDemoSession}
        onGoToSlides={handleGoToSlides}
      />
    );
  }

  if (demoMode) {
    return (
      <DemoLanding
        onDemoSession={handleDemoSession}
        onGoToSlides={handleGoToSlides}
      />
    );
  }

  return (
    <Login
      theme={theme}
      onLogin={handleLogin}
      onToggleTheme={toggleTheme}
      onEnterDemo={enterDemoMode}
    />
  );
}

export default App;
