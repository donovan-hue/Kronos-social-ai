
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function PostDetail() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingComment, setSendingComment] =
    useState(false);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState("");

  async function loadPost() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/posts/${id}`,
        getAuthConfig()
      );

      setPost(response.data?.post || null);
    } catch (requestError) {
      console.error(
        "KRONOS_POST_DETAIL_LOAD_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo cargar la publicación."
      );
    } finally {
      setLoading(false);
    }
  }

  async function likePost() {
    if (!post?._id || liking) {
      return;
    }

    setLiking(true);
    setError("");

    try {
      const response = await axios.post(
        `${API}/posts/${post._id}/like`,
        {},
        getAuthConfig()
      );

      setPost((currentPost) => ({
        ...currentPost,
        likesCount:
          typeof response.data?.likesCount === "number"
            ? response.data.likesCount
            : currentPost.likesCount || 0,
        liked: Boolean(response.data?.liked),
      }));
    } catch (requestError) {
      console.error(
        "KRONOS_POST_DETAIL_LIKE_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo actualizar el like."
      );
    } finally {
      setLiking(false);
    }
  }

  async function createComment(event) {
    event.preventDefault();

    const value = comment.trim();

    if (!value || sendingComment || !post?._id) {
      return;
    }

    setSendingComment(true);
    setError("");

    try {
      const response = await axios.post(
        `${API}/posts/${post._id}/comments`,
        {
          content: value,
        },
        getAuthConfig()
      );

      if (response.data?.post) {
        setPost(response.data.post);
      }

      setComment("");
    } catch (requestError) {
      console.error(
        "KRONOS_POST_DETAIL_COMMENT_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo publicar el comentario."
      );
    } finally {
      setSendingComment(false);
    }
  }

  useEffect(() => {
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <p>Cargando publicación...</p>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="page">
        <p role="alert">
          {error || "Publicación no encontrada."}
        </p>

        <Link to="/">
          Volver al inicio
        </Link>
      </section>
    );
  }

  const comments = Array.isArray(post.comments)
    ? post.comments
    : [];

  return (
    <section className="page post-detail-page">
      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <article className="post-detail">
        <header className="post-detail-header">
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
            {formatDate(post.createdAt)}
          </small>
        </header>

        <div className="post-detail-content">
          <p>{post.content}</p>
        </div>

        <div className="post-actions">
          <button
            type="button"
            onClick={likePost}
            disabled={liking}
          >
            {post.liked
              ? "Ya no me gusta"
              : "Me gusta"}{" "}
            {post.likesCount || 0}
          </button>

          <span>
            Comentarios {comments.length}
          </span>
        </div>
      </article>

      <section className="post-comments">
        <h3>Comentarios</h3>

        <form
          className="comment-form"
          onSubmit={createComment}
        >
          <textarea
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            maxLength={1000}
            placeholder="Escribe un comentario..."
            disabled={sendingComment}
          />

          <button
            type="submit"
            disabled={
              sendingComment ||
              !comment.trim()
            }
          >
            {sendingComment
              ? "Publicando..."
              : "Comentar"}
          </button>
        </form>

        {comments.length === 0 ? (
          <p>
            Todavía no hay comentarios.
          </p>
        ) : (
          <div className="comments-list">
            {comments.map((item, index) => (
              <article
                className="comment"
                key={
                  item._id ||
                  `${item.user?._id || "user"}-${index}`
                }
              >
                <header>
                  <strong>
                    {item.user?.displayName ||
                      item.user?.username ||
                      "Usuario"}
                  </strong>

                  {item.user?.username && (
                    <span>
                      @{item.user.username}
                    </span>
                  )}
                </header>

                <p>{item.content}</p>

                <small>
                  {formatDate(item.createdAt)}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link to="/">
        Volver al inicio
      </Link>
    </section>
  );
}


