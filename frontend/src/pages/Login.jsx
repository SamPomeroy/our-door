import { useState } from "react";
import { login } from "../api.js";
import logo from "../assets/our_door_logo.png";

export default function Login({ theme, onLogin, onToggleTheme }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // The same password field can sign in as either app role; the backend decides
  // whether the supplied password is allowed for that role.
  async function handleLogin(role) {
    if (!password || isLoading) return;

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

  function handlePasswordKeyDown(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleLogin("student");
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
        <div className="password-field">
          <input
            id="password"
            className="password-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={handlePasswordKeyDown}
            placeholder="Enter password"
            autoComplete="current-password"
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg className="password-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.4 5.3A9.4 9.4 0 0 1 12 5c5 0 8.5 4.4 9.7 6.1a1.6 1.6 0 0 1 0 1.8 19.5 19.5 0 0 1-3 3.3" />
                <path d="M6.5 6.5A19.3 19.3 0 0 0 2.3 11a1.6 1.6 0 0 0 0 1.9C3.5 14.6 7 19 12 19a9.7 9.7 0 0 0 4-.9" />
              </svg>
            ) : (
              <svg className="password-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.3 11.1a1.6 1.6 0 0 0 0 1.8C3.5 14.6 7 19 12 19s8.5-4.4 9.7-6.1a1.6 1.6 0 0 0 0-1.8C20.5 9.4 17 5 12 5s-8.5 4.4-9.7 6.1Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

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
