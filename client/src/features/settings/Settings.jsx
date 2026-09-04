import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getAuthConfig() {
  const token = localStorage.getItem("kronos_token");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
}

export default function Settings({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await axios.get(
          `${API}/users/me`,
          getAuthConfig()
        );

        setUser(response.data);
        localStorage.setItem(
          "kronos_user",
          JSON.stringify(response.data)
        );
      } catch (requestError) {
        console.error(
          "KRONOS_SETTINGS_LOAD_ERROR:",
          requestError
        );

        setError(
          requestError.response?.data?.error ||
            "No se pudo cargar la configuración."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  if (loading) {
    return (
      <section className="page">
        <h2>Configuración</h2>
        <p>Cargando configuración...</p>
      </section>
    );
  }

  return (
    <section className="page settings-page">
      <header>
        <h2>Configuración</h2>
        <p>Administra tu cuenta de Kronos.</p>
      </header>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {user && (
        <section className="settings-account">
          <h3>Cuenta</h3>
          <p>
            <strong>Nombre de usuario:</strong> @{user.username}
          </p>
          <p>
            <strong>Correo electrónico:</strong> {user.email}
          </p>
          <p>
            <strong>Nombre visible:</strong>{" "}
            {user.displayName || "Sin definir"}
          </p>

          <div className="settings-actions">
            <Link to="/profile">Editar perfil</Link>
            <button type="button" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </section>
      )}
    </section>
  );
}
