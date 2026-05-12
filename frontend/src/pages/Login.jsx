import { useState } from "react";
import { login } from "../api.js";
import logo from "../assets/our_door_logo.png";

export default function Login({ theme, onLogin, onToggleTheme }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(role) {
    setError("");
    setIsLoading(true);

    try {
      const response = await login(password, role);
      onLogin?.({ token: response.access_token, role: response.role ?? role });
    } catch (err) {
      console.error(err);
      setError("Login failed. Check the password and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={`login-page theme-${theme}`}>
      <section className="login-panel" aria-labelledby="login-heading">
        <button className="theme-toggle login-theme-toggle" type="button" onClick={onToggleTheme}>
          <span className={`theme-icon ${theme === "dark" ? "sun" : "moon"}`} aria-hidden="true" />
          <span className="sr-only">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</span>
        </button>
        <img className="login-logo" src={logo} alt="" />
        <p className="login-kicker">Our Door</p>
        <h1 id="login-heading">Sign in</h1>

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="password-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
        />

        <div className="role-actions">
          <button
            type="button"
            onClick={() => handleLogin("student")}
            disabled={isLoading || password.length === 0}
          >
            I'm a Student
          </button>
          <button
            type="button"
            onClick={() => handleLogin("admin")}
            disabled={isLoading || password.length === 0}
          >
            I'm an Admin
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}
      </section>
    </main>
  );
}
