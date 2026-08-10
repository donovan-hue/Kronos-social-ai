import { useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${API}/users/search`,
        {
          params: {
            q: query
          },
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("kronos_token")}`
          }
        }
      );

      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function follow(userId) {
    try {
      await axios.post(
        `${API}/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("kronos_token")}`
          }
        }
      );

      search();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className="page">
      <h2>Buscar personas</h2>

      <div className="search-box">
        <input
          value={query}
          onChange={e =>
            setQuery(e.target.value)
          }
          onKeyDown={e => {
            if (e.key === "Enter") {
              search();
            }
          }}
          placeholder="Buscar usuario..."
        />

        <button onClick={search}>
          Buscar
        </button>
      </div>

      {loading && <p>Buscando...</p>}

      <div className="user-results">
        {users.map(user => (
          <article
            className="user-card"
            key={user._id}
          >
            <div>
              <strong>
                {user.displayName ||
                  user.username}
              </strong>

              <span>
                @{user.username}
              </span>
            </div>

            <button
              onClick={() =>
                follow(user._id)
              }
            >
              Seguir
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
