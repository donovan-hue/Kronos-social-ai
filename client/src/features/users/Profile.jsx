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

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("kronos_user") || "null"
    );
  } catch {
    return null;
  }
}

function getCurrentUserId(user) {
  return user?._id || user?.id || "";
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

function getUserId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object" && value._id) {
    return String(value._id);
  }

  return String(value);
}

export default function Profile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likingPostId, setLikingPostId] = useState(null);

  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [success, setSuccess] = useState("");

  const isOwnProfile = !id;

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = id
        ? `${API}/users/${id}`
        : `${API}/users/me`;

      const response = await axios.get(
        endpoint,
        getAuthConfig()
      );

      const user = response.data;

      setProfile(user);

      setForm({
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });

      updateFollowingState(user);

      await loadUserPosts(user._id);
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_LOAD_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo cargar el perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateFollowingState(user) {
    if (!user || isOwnProfile) {
      setFollowing(false);
      return;
    }

    const currentUser = getCurrentUser();

    const currentUserId = getCurrentUserId(currentUser);

    if (!currentUserId) {
      setFollowing(false);
      return;
    }

    const followers = Array.isArray(user.followers)
      ? user.followers
      : [];

    setFollowing(
      followers.some(
        (followerId) =>
          getUserId(followerId) ===
          String(currentUserId)
      )
    );
  }

  async function loadUserPosts(userId) {
    if (!userId) {
      return;
    }

    setPostsLoading(true);
    setPostsError("");

    try {
      const response = await axios.get(
        `${API}/posts`,
        getAuthConfig()
      );

      const allPosts = Array.isArray(
        response.data?.posts
      )
        ? response.data.posts
        : [];

      const userPosts = allPosts.filter(
        (post) =>
          getUserId(post.author) ===
          String(userId)
      );

      setPosts(userPosts);
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_POSTS_ERROR:",
        requestError
      );

      setPostsError(
        requestError.response?.data?.error ||
          "No se pudieron cargar las publicaciones."
      );
    } finally {
      setPostsLoading(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (saving || !isOwnProfile) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.patch(
        `${API}/users/me`,
        {
          displayName: form.displayName.trim(),
          bio: form.bio.trim(),
          avatar: form.avatar.trim(),
        },
        getAuthConfig()
      );

      const updatedUser = response.data;

      setProfile(updatedUser);

      setForm({
        displayName: updatedUser.displayName || "",
        bio: updatedUser.bio || "",
        avatar: updatedUser.avatar || "",
      });

      localStorage.setItem(
        "kronos_user",
        JSON.stringify(updatedUser)
      );

      setSuccess(
        "Perfil actualizado correctamente."
      );
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_UPDATE_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleFollow() {
    if (!profile?._id || isOwnProfile) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API}/users/${profile._id}/follow`,
        {},
        getAuthConfig()
      );

      const newFollowing = Boolean(
        response.data?.following
      );

      setFollowing(newFollowing);

      setProfile((current) => {
        if (!current) {
          return current;
        }

        const currentUser = getCurrentUser();

        const currentUserId = getCurrentUserId(
          currentUser
        );

        if (!currentUserId) {
          return current;
        }

        const currentFollowers = Array.isArray(
          current.followers
        )
          ? current.followers
          : [];

        const normalizedCurrentUserId = String(
          currentUserId
        );

        const alreadyFollowing =
          currentFollowers.some(
            (followerId) =>
              getUserId(followerId) ===
              normalizedCurrentUserId
          );

        if (
          newFollowing &&
          !alreadyFollowing
        ) {
          return {
            ...current,
            followers: [
              ...currentFollowers,
              normalizedCurrentUserId,
            ],
          };
        }

        if (
          !newFollowing &&
          alreadyFollowing
        ) {
          return {
            ...current,
            followers:
              currentFollowers.filter(
                (followerId) =>
                  getUserId(followerId) !==
                  normalizedCurrentUserId
              ),
          };
        }

        return current;
      });
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_FOLLOW_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo actualizar el seguimiento."
      );
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
                  typeof response.data
                    ?.likesCount === "number"
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
        "KRONOS_PROFILE_LIKE_ERROR:",
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
        <h2>Perfil</h2>
        <p>Cargando perfil...</p>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="page">
        <h2>Perfil</h2>

        <p role="alert">
          {error}
        </p>

        <button
          type="button"
          onClick={loadProfile}
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="page">
        <h2>Perfil</h2>
        <p>No se encontró el perfil.</p>
      </section>
    );
  }

  const followersCount = Array.isArray(
    profile.followers
  )
    ? profile.followers.length
    : 0;

  const followingCount = Array.isArray(
    profile.following
  )
    ? profile.following.length
    : 0;

  return (
    <section className="page profile-page">
      <header className="profile-header">
        <div className="profile-avatar">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={
                profile.displayName ||
                profile.username ||
                "Avatar"
              }
              loading="lazy"
            />
          ) : (
            <span>
              {(profile.displayName ||
                profile.username ||
                "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>

        <div className="profile-info">
          <h2>
            {profile.displayName ||
              profile.username ||
              "Usuario"}
          </h2>

          {profile.username && (
            <p>
              @{profile.username}
            </p>
          )}

          {profile.bio && (
            <p>
              {profile.bio}
            </p>
          )}

          <div className="profile-stats">
            <span>
              <strong>
                {posts.length}
              </strong>{" "}
              publicaciones
            </span>

            <span>
              <strong>
                {followersCount}
              </strong>{" "}
              seguidores
            </span>

            <span>
              <strong>
                {followingCount}
              </strong>{" "}
              siguiendo
            </span>
          </div>

          {!isOwnProfile && (
            <div className="profile-actions">
              <button
                type="button"
                onClick={toggleFollow}
              >
                {following
                  ? "Dejar de seguir"
                  : "Seguir"}
              </button>

              <Link to={`/messages/${profile._id}`}>
                Mensaje
              </Link>
            </div>
          )}
        </div>
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

      {isOwnProfile && (
        <section className="profile-edit">
          <h3>Editar perfil</h3>

          <form onSubmit={saveProfile}>
            <label htmlFor="profile-displayName">
              Nombre
            </label>

            <input
              id="profile-displayName"
              name="displayName"
              type="text"
              value={form.displayName}
              onChange={handleFormChange}
              maxLength={100}
              placeholder="Tu nombre"
              disabled={saving}
            />

            <label htmlFor="profile-bio">
              Biografía
            </label>

            <textarea
              id="profile-bio"
              name="bio"
              value={form.bio}
              onChange={handleFormChange}
              maxLength={500}
              placeholder="Cuéntanos sobre ti"
              disabled={saving}
            />

            <label htmlFor="profile-avatar">
              Avatar
            </label>

            <input
              id="profile-avatar"
              name="avatar"
              type="url"
              value={form.avatar}
              onChange={handleFormChange}
              maxLength={2000}
              placeholder="https://..."
              disabled={saving}
            />

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </form>
        </section>
      )}

      <section className="profile-posts">
        <div className="profile-posts-header">
          <h3>
            Publicaciones
          </h3>

          <Link to="/social">
            Ir al inicio
          </Link>
        </div>

        {postsError && (
          <p role="alert">
            {postsError}
          </p>
        )}

        {postsLoading ? (
          <p>
            Cargando publicaciones...
          </p>
        ) : posts.length === 0 ? (
          <p>
            Este usuario todavía no tiene
            publicaciones.
          </p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => {
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
                        {post.author
                          ?.displayName ||
                          post.author
                            ?.username ||
                          profile.displayName ||
                          profile.username ||
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
            })}
          </div>
        )}
      </section>
    </section>
  );
}
