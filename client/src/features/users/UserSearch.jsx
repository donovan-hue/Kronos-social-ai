import { useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getAuthConfig() {
  const token =
    localStorage.getItem(
      "kronos_token"
    );

  return {
    headers: {
      Authorization:
        `Bearer ${token}`
    }
  };
}

export default function UserSearch() {
  const [query, setQuery] =
    useState("");

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionUserId, setActionUserId] =
    useState(null);

  async function search() {
    const value =
      query.trim();

    if (!value) {
      setUsers([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await axios.get(
          `${API}/users/search`,
          {
            params: {
              q: value
            },
            ...getAuthConfig()
          }
        );

      setUsers(
        Array.isArray(
          response.data?.users
        )
          ? response.data.users
          : []
      );
    } catch (requestError) {
      console.error(
        "KRONOS_SEARCH_USERS_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.error ||
          "No se pudieron buscar usuarios."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow(userId) {
    if (
      !userId ||
      actionUserId
    ) {
      return;
    }

    setActionUserId(userId);
    setError("");

    try {
      const response =
        await axios.post(
          `${API}/users/${userId}/follow`,
          {},
          getAuthConfig()
        );

      const following =
        Boolean(
          response.data?.following
        );

      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (user) =>
              user._id === userId
                ? {
                    ...user,
                    isFollowing:
                      following,
                    followersCount:
                      Math.max(
                        0,
                        (user.followersCount ||
                          0) +
                          (following
                            ? 1
                            : -1)
                      )
                  }
                : user
          )
      );
    } catch (requestError) {
      console.error(
        "KRONOS_FOLLOW_USER_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.error ||
          "No se pudo actualizar el seguimiento."
      );
    } finally {
      setActionUserId(null);
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();
      search();
    }
  }

  return (
    <section className="page">
      <header>
        <h2>Explorar</h2>

        <p>
          Encuentra personas en
          Kronos.
        </p>
      </header>

      <div className="search-box">
        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          maxLength={50}
          placeholder="Buscar usuario..."
          aria-label="Buscar usuario"
        />

        <button
          type="button"
          onClick={search}
          disabled={
            loading ||
            !query.trim()
          }
        >
          {loading
            ? "Buscando..."
            : "Buscar"}
        </button>
      </div>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {!loading &&
        query.trim() &&
        users.length === 0 &&
        !error && (
          <p>
            No encontramos
            usuarios.
          </p>
        )}

      <div className="user-results">
        {users.map((user) => (
          <article
            className="user-card"
            key={user._id}
          >
            <div>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt=""
                  loading="lazy"
                />
              )}

              <strong>
                {user.displayName ||
                  user.username}
              </strong>

              <span>
                @{user.username}
              </span>

              {user.bio && (
                <p>
                  {user.bio}
                </p>
              )}

              <small>
                {user.followersCount ||
                  0}{" "}
                seguidores
              </small>
            </div>

            <button
              type="button"
              onClick={() =>
                toggleFollow(
                  user._id
                )
              }
              disabled={
                actionUserId ===
                user._id
              }
            >
              {actionUserId ===
              user._id
                ? "..."
                : user.isFollowing
                  ? "Dejar de seguir"
                  : "Seguir"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

