import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/apiClient";

export default function Settings({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/users/me")
      .then(({ data }) => { if (active) setUser(data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.error || "No se pudo cargar la configuración."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <section className="page"><div className="k-feed-state"><span className="k-skeleton" /><span className="k-skeleton k-skeleton-wide" /></div></section>;

  return <section className="page settings-page"><header className="k-page-header"><div><p className="k-eyebrow">KRONOS / SETTINGS</p><h1>Configuración</h1><p>Administra tu cuenta y tus preferencias.</p></div></header>{error && <p className="k-state k-state-error" role="alert">{error}</p>}{user && <div className="k-settings-grid"><section className="k-surface k-settings-section"><p className="k-eyebrow">CUENTA</p><h2>{user.displayName || user.username}</h2><p>@{user.username}</p><p>{user.email}</p><div className="k-button-group"><Link className="k-button k-button-primary" to="/settings/profile">Editar perfil</Link><Link className="k-button k-button-secondary" to="/profile">Ver perfil</Link></div></section><section className="k-surface k-settings-section"><p className="k-eyebrow">SEGURIDAD</p><h2>Sesión</h2><p className="k-muted">La sesión usa JWT y se limpia automáticamente si el backend responde 401.</p><button className="k-button k-button-danger" type="button" onClick={onLogout}>Cerrar sesión</button></section><section className="k-surface k-settings-section"><p className="k-eyebrow">PRÓXIMAMENTE CON API</p><h2>Privacidad y notificaciones</h2><p className="k-muted">Estas preferencias necesitan endpoints persistentes antes de mostrarse como controles editables.</p></section></div>}</section>;
}
