import { useEffect, useState } from "react";
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

export default function SocialPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/posts`,
        getAuthConfig()
      );

      setPosts(
        Array.isArray(response.data?.posts)
          ? response.data.posts
          : []
      );
    } catch (requestError) {
      console.error(
        "KRONOS_SOCIAL_LOAD_POSTS_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudieron cargar las publicaciones."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createPost(event) {
    event?.preventDefault();

    const value = content.trim();

    if (!value || publishing) {
      return;
    }

    const token = localStorage.getItem("kronos_token");

    if (!token) {
      setError("Tu sesión no está disponible.");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const response = await axios.post(
        `${API}/posts`,
        {
          content: value,
        },
        getAuthConfig()
      );

      if (response.data?.post) {
        setPosts((currentPosts) => [
          response.data.post,
          ...currentPosts,
        ]);
      }

      setContent("");
    } catch (requestError) {
      console.error(
        "KRONOS_SOCIAL_CREATE_POST_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo crear la publicación."
      );
    } finally {
      setPublishing(false);
    }
  }

  async function likePost(postId) {
    if (!postId) {
      return;
    }

    const token = localStorage.getItem("kronos_token");

    if (!token) {
      setError("Tu sesión no está disponible.");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        `${API}/posts/${postId}/like`,
        {},
        getAuthConfig()
      );

      const likesCount = response.data?.likesCount;
      const liked = response.data?.liked;

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post._id !== postId) {
            return post;
          }

          const currentLikes = Array.isArray(post.likes)
            ? post.likes
            : [];

          return {
            ...post,
            likes:
              typeof likesCount === "number"
                ? Array.from(
                    { length: likesCount },
                    (_, index) => index
                  )
                : liked
                  ? [...currentLikes, "local"]
                  : currentLikes.slice(0, -1),
          };
        })
      );
    } catch (requestError) {
      console.error(
        "KRONOS_SOCIAL_LIKE_POST_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo actualizar el like."
      );
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <section className="page">
      <h2>Red Social</h2>

      <form
        className="composer"
        onSubmit={createPost}
      >
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          maxLength={5000}
          placeholder="¿Qué quieres publicar?"
          disabled={publishing}
        />

        <button
          type="submit"
          disabled={
            publishing || !content.trim()
          }
        >
          {publishing
            ? "Publicando..."
            : "Publicar"}
        </button>
      </form>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {loading && (
        <p>
          Cargando publicaciones...
        </p>
      )}

      {!loading &&
        !error &&
        posts.length === 0 && (
          <p>
            No hay publicaciones todavía.
          </p>
        )}

      <div className="feed">
        {posts.map((post) => (
          <article
            className="post"
            key={post._id}
          >
            <header>
              <strong>
                {post.author?.displayName ||
                  post.author?.username ||
                  "Usuario"}
              </strong>

              {post.author?.username && (
                <span>
                  @{post.author.username}
                </span>
              )}
            </header>

            <p>
              {post.content}
            </p>

            <div className="post-actions">
              <button
                type="button"
                onClick={() =>
                  likePost(post._id)
                }
              >
                Me gusta{" "}
                {post.likes?.length || 0}
              </button>

              <span>
                Comentarios{" "}
                {post.comments?.length || 0}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
