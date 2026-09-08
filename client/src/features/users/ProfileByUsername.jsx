import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/apiClient";

export default function ProfileByUsername() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/users/username/${encodeURIComponent(username || "")}`)
      .then(({ data }) => { if (active && data?._id) navigate(`/users/${data._id}`, { replace: true }); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.error || "No se encontró el perfil."); });
    return () => { active = false; };
  }, [navigate, username]);

  return <section className="page"><div className="k-empty-state">{error ? <><h2>Perfil no disponible</h2><p role="alert">{error}</p></> : <><span className="k-skeleton" /><p>Cargando perfil...</p></>}</div></section>;
}
