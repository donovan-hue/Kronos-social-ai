import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Auth({ onLogin, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email: email.trim(), password } : { username: username.trim(), email: email.trim(), password, displayName: displayName.trim() || username.trim() };
      const response = await axios.post(`${API}${endpoint}`, payload);
      const { token, user } = response.data;
      if (!token) throw new Error("El servidor no devolvió token");
      localStorage.setItem("kronos_token", token);
      localStorage.setItem("kronos_user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  return <main className="page"><section className="ai-panel"><h2>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
    <form onSubmit={submit}>
      {mode === "register" && <><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Usuario" autoComplete="username" required /><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nombre para mostrar" autoComplete="name" required /></>}
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo electrónico" autoComplete="email" required />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</button>
    </form>
    <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Crear una cuenta" : "Ya tengo una cuenta"}</button>
  </section></main>;
}
