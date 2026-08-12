import { useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "/auth/login"
          : "/auth/register";

      const payload =
        mode === "login"
          ? {
              email: email.trim(),
              password
            }
          : {
              username: username.trim(),
              email: email.trim(),
              password,
              displayName:
                displayName.trim() || username.trim()
            };

      const response = await axios.post(
        `${API}${endpoint}`,
        payload
      );

      const { token, user } = response.data;

      if (!token) {
        throw new Error("El servidor no devolvió token");
      }

      localStorage.setItem("kronos_token", token);
      localStorage.setItem(
        "kronos_user",
        JSON.stringify(user)
      );

      onLogin(user);
    } catch (err) {
      console.error("AUTH_ERROR:", err);

      setError(
        err.response?.data?.error ||
        err.message ||
        "Error de autenticación"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="ai-panel">
        <h2>
          {mode === "login"
            ? "Iniciar sesión"
            : "Crear cuenta"}
        </h2>

        {mode === "register" && (
          <>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Usuario"
              autoComplete="username"
            />

            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Nombre para mostrar"
              autoComplete="name"
            />
          </>
        )}

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          autoComplete="email"
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete={
            mode === "login"
              ? "current-password"
              : "new-password"
          }
        />

        {error && <p role="alert">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(
              mode === "login"
                ? "register"
                : "login"
            );
            setError("");
          }}
        >
          {mode === "login"
            ? "Crear una cuenta"
            : "Ya tengo una cuenta"}
        </button>
      </section>
    </main>
  );
}
