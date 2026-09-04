import { useState } from "react";
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

export default function CreatePost({ onCreated }) {
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function createPost(event) {
    event.preventDefault();

    const value = content.trim();

    if (!value || creating) {
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API}/posts`,
        {
          content: value,
        },
        getAuthConfig()
      );

      const post = response.data?.post;

      if (!post) {
        throw new Error("INVALID_POST_RESPONSE");
      }

      setContent("");
      setSuccess("Publicación creada correctamente.");

      if (typeof onCreated === "function") {
        onCreated(post);
      }
    } catch (requestError) {
      console.error(
        "KRONOS_CREATE_POST_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo crear la publicación."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="create-post-page">
      <header>
        <h2>Crear publicación</h2>
        <p>Comparte algo con la comunidad.</p>
      </header>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {success && (
        <p role="status">
          {success}
        </p>
      )}

      <form className="create-post-form" onSubmit={createPost}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          placeholder="¿Qué estás pensando?"
          aria-label="Contenido de la publicación"
          disabled={creating}
        />

        <button
          type="submit"
          disabled={creating || !content.trim()}
        >
          {creating ? "Publicando..." : "Publicar"}
        </button>
      </form>

      <Link to="/social">Volver al inicio</Link>
    </section>
  );
}
