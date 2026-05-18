import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./pages/Login.jsx";
import StudentChat from "./pages/StudentChat.jsx";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));

  if (session?.role === "student") {
    return (
      <StudentChat
        token={session.token}
        theme={theme}
        onSignOut={() => setSession(null)}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (session?.role === "admin") {
    return (
      <AdminDashboard
        token={session.token}
        theme={theme}
        onSignOut={() => setSession(null)}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return <Login theme={theme} onLogin={(nextSession) => setSession(nextSession)} onToggleTheme={toggleTheme} />;
}

export default App;
