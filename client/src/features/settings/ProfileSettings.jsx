import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/apiClient";

export default function ProfileSettings() {
  const [form, setForm] = useState({ displayName: "", bio: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/me").then(({ data }) => setForm({ displayName: data.displayName || "", bio: data.bio || "", avatar: data.avatar || "" }))
      .catch((requestError) => setError(requestError.response?.data?.error || "No se pudo cargar el perfil."))
      .finally(() => setLoading(false));
  }, []);

  function change(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); setMessage(""); setError(""); }
  async function save(event) { event.preventDefault(); setSaving(true); setMessage(""); setError(""); try { const { data } = await api.patch("/users/me", { displayName: form.displayName.trim(), bio: form.bio.trim(), avatar: form.avatar.trim() }); setForm({ displayName: data.displayName || "", bio: data.bio || "", avatar: data.avatar || "" }); setMessage("Perfil guardado correctamente."); } catch (requestError) { setError(requestError.response?.data?.error || "No se pudo guardar el perfil."); } finally { setSaving(false); } }

  if (loading) return <section className="page"><div className="k-feed-state"><span className="k-skeleton" /><span className="k-skeleton k-skeleton-wide" /></div></section>;
  return <section className="page"><header className="k-page-header"><div><p className="k-eyebrow">KRONOS / SETTINGS / PROFILE</p><h1>Editar perfil</h1><p>Actualiza la información que verá tu comunidad.</p></div><Link className="k-button k-button-ghost" to="/settings">Volver a configuración</Link></header><form className="k-ai-form k-surface" onSubmit={save}><label htmlFor="profile-display-name">Nombre visible<input id="profile-display-name" name="displayName" value={form.displayName} onChange={change} maxLength={100} required /></label><label htmlFor="profile-bio">Biografía<textarea id="profile-bio" name="bio" value={form.bio} onChange={change} maxLength={500} /></label><label htmlFor="profile-avatar">URL del avatar<input id="profile-avatar" name="avatar" type="url" value={form.avatar} onChange={change} maxLength={2000} placeholder="https://..." /></label>{error && <p className="k-state k-state-error" role="alert">{error}</p>}{message && <p className="k-state k-state-success" role="status">{message}</p>}<div className="k-button-group"><Link className="k-button k-button-secondary" to="/profile">Cancelar</Link><button className="k-button k-button-primary" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button></div></form></section>;
}
