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

export default function Profile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");

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

      if (Array.isArray(user.followers)) {
        const currentUser = JSON.parse(
          localStorage.getItem("kronos_user") || "null"
        );

        setFollowing(
          currentUser?._id
            ? user.followers.some(
                (followerId) =>
                  String(followerId) ===
                  String(currentUser._id)
              )
            : false
        );
      }

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

  async function loadUserPosts(userId) {
    if (!userId) {
      return;
    }

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
          String(post.author?._id || post.author) ===
          String(userId)
      );

      setPosts(userPosts);
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_POSTS_ERROR:",
        requestError
      );
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

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

      localStorage.setItem(
        "kronos_user",
        JSON.stringify(updatedUser)
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
    if (!profile?._id) {
      return;
    }

    try {
      const response = await axios.post(
        `${API}/users/${profile._id}/follow`,
        {},
        getAuthConfig()
      );

      const newFollowing =
        Boolean(response.data?.following);

      setFollowing(newFollowing);

      setProfile((current) => ({
        ...current,
        followers: newFollowing
          ? [
              ...(current.followers || []),
              "local",
            ]
          : (current.followers || []).slice(0, -1),
      }));
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

  if (loading) {
    return (
      <section className="page">
        <p>Cargando perfil...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="page">
        <p role="alert">
          {error || "Perfil no encontrado."}
        </p>
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
      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={`Avatar de ${
                profile.displayName ||
                profile.username
              }`}
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
              profile.username}
          </h2>

          <p>
            @{profile.username}
          </p>

          {profile.bio && (
            <p>{profile.bio}</p>
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
            <button
              type="button"
              onClick={toggleFollow}
            >
              {following
                ? "Dejar de seguir"
                : "Seguir"}
            </button>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <form
          className="profile-edit"
          onSubmit={saveProfile}
        >
          <h3>
            Editar perfil
          </h3>

          <input
            type="text"
            value={form.displayName}
            onChange={(event) =>
              setForm({
                ...form,
                displayName:
                  event.target.value,
              })
            }
            maxLength={100}
            placeholder="Nombre"
          />

          <textarea
            value={form.bio}
            onChange={(event) =>
              setForm({
                ...form,
                bio: event.target.value,
              })
            }
            maxLength={500}
            placeholder="Biografía"
          />

          <input
            type="url"
            value={form.avatar}
            onChange={(event) =>
              setForm({
                ...form,
                avatar:
                  event.target.value,
              })
            }
            maxLength={2000}
            placeholder="URL del avatar"
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
      )}

      <div className="profile-posts">
        <h3>
          Publicaciones
        </h3>

        {posts.length === 0 ? (
          <p>
            Todavía no hay publicaciones.
          </p>
        ) : (
          posts.map((post) => (
            <article
              className="post"
              key={post._id}
            >
              <p>{post.content}</p>

              <small>
                {post.likes?.length || 0}{" "}
                me gusta
              </small>
            </article>
          ))
        )}
      </div>

      <Link to="/">
        Volver al inicio
      </Link>
    </section>
  );
}
