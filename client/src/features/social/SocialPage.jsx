import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function SocialPage() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    try {
      const token = localStorage.getItem("kronos_token");

      const response = await axios.get(
        `${API}/posts/feed`,
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          : undefined
      );

      setPosts(response.data.posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function createPost() {
    if (!text.trim()) return;

    const token = localStorage.getItem("kronos_token");

    if (!token) {
      alert("Inicia sesión primero");
      return;
    }

    await axios.post(
      `${API}/posts`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setText("");
    loadFeed();
  }

  async function likePost(id) {
    const token = localStorage.getItem("kronos_token");

    if (!token) {
      alert("Inicia sesión primero");
      return;
    }

    await axios.post(
      `${API}/posts/${id}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    loadFeed();
  }

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <section className="page">
      <h2>Red Social</h2>

      <div className="composer">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="¿Qué quieres publicar?"
        />

        <button onClick={createPost}>
          Publicar
        </button>
      </div>

      {loading && <p>Cargando feed...</p>}

      {!loading && posts.length === 0 && (
        <p>No hay publicaciones todavía.</p>
      )}

      <div className="feed">
        {posts.map(post => (
          <article className="post" key={post._id}>
            <header>
              <strong>
                {post.author?.displayName ||
                  post.author?.username ||
                  "Usuario"}
              </strong>

              <span>
                @{post.author?.username}
              </span>
            </header>

            <p>{post.text}</p>

            <div className="post-actions">
              <button onClick={() => likePost(post._id)}>
                ❤️ {post.likes?.length || 0}
              </button>

              <span>
                💬 {post.comments?.length || 0}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
