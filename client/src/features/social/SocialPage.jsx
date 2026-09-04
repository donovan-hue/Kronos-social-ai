import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CreatePost from "./CreatePost";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getAuthConfig() {
  const token =
    localStorage.getItem("kronos_token");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(date).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

export default function SocialPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likingPostId, setLikingPostId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

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
        "KRONOS_SOCIAL_LOAD_ERROR:",
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

  async function likePost(postId) {
    if (!postId || likingPostId) {
      return;
    }

    setLikingPostId(postId);
    setError("");

    try {
      const response = await axios.post(
        `${API}/posts/${postId}/like`,
        {},
        getAuthConfig()
      );

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount:
                  typeof response.data?.likesCount ===
                  "number"
                    ? response.data.likesCount
                    : post.likesCount || 0,
                liked: Boolean(
                  response.data?.liked
                ),
              }
            : post
        )
      );
    } catch (requestError) {
      console.error(
        "KRONOS_SOCIAL_LIKE_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo actualizar el like."
      );
    } finally {
      setLikingPostId(null);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <h2>Inicio</h2>
        <p>Cargando publicaciones...</p>
      </section>
    );
  }

  return (
    <section className="page social-page">
      <header>
        <h2>Inicio</h2>

        <p>
          Tu feed de Kronos.
        </p>
      </header>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <CreatePost
        onCreated={(post) =>
          setPosts((currentPosts) => [
            post,
            ...currentPosts,
          ])
        }
      />

      <div className="posts-list">
        {posts.length === 0 ? (
          <p>
            Todavía no hay publicaciones.
          </p>
        ) : (
          posts.map((post) => {
            const comments = Array.isArray(
              post.comments
            )
              ? post.comments
              : [];

            const likesCount =
              typeof post.likesCount ===
              "number"
                ? post.likesCount
                : Array.isArray(post.likes)
                  ? post.likes.length
                  : 0;

            return (
              <article
                className="post"
                key={post._id}
              >
                <header className="post-header">
                  <div>
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
                  </div>

                  <small>
                    {formatDate(
                      post.createdAt
                    )}
                  </small>
                </header>

                <Link
                  className="post-content-link"
                  to={`/post/${post._id}`}
                >
                  <p>
                    {post.content}
                  </p>
                </Link>

                <div className="post-actions">
                  <button
                    type="button"
                    onClick={() =>
                      likePost(post._id)
                    }
                    disabled={
                      likingPostId ===
                      post._id
                    }
                  >
                    {post.liked
                      ? "Ya no me gusta"
                      : "Me gusta"}{" "}
                    {likesCount}
                  </button>

                  <Link
                    to={`/post/${post._id}`}
                  >
                    Comentarios{" "}
                    {comments.length}
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}


