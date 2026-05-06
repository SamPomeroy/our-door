import { useState } from "react";
import { login } from "../api.js";

export default function Login() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(role) {
    setError("");
    setIsLoading(true);

    try {
      const response = await login(password, role);
      setToken(response.access_token);
      console.log(response);
      console.log(response.role);
    } catch (err) {
      console.error(err);
      setError("Login failed. Check the password and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-heading">
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
        {token && <p className="login-success">Token stored for this session.</p>}
      </section>
    </main>
  );
}
