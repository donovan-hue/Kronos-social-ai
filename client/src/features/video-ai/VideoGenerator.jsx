import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  function headers() {
    return {
      Authorization:
        `Bearer ${localStorage.getItem("kronos_token")}`
    };
  }

  async function generate() {
    if (!prompt.trim()) return;

    const token =
      localStorage.getItem("kronos_token");

    if (!token) {
      alert("Inicia sesión primero");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/ai/videos/generate`,
        { prompt },
        {
          headers: headers()
        }
      );

      const generation =
        response.data.generation;

      setStatus(generation.status);
      setVideoUrl(generation.videoUrl || "");

      if (response.data.message) {
        setMessage(response.data.message);
      }

      loadHistory();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
        "Error generando video"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    const token =
      localStorage.getItem("kronos_token");

    if (!token) return;

    try {
      const response = await axios.get(
        `${API}/ai/videos/history`,
        {
          headers: headers()
        }
      );

      setHistory(
        response.data.generations
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section className="page">
      <h2>IA Generadora de Video</h2>

      <div className="ai-panel">
        <textarea
          value={prompt}
          onChange={e =>
            setPrompt(e.target.value)
          }
          placeholder="Describe el video que quieres crear..."
        />

        <button
          onClick={generate}
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : "Generar Video"}
        </button>
      </div>

      {status && (
        <p>
          Estado: <strong>{status}</strong>
        </p>
      )}

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}

      {videoUrl && (
        <div className="video-result">
          <video
            src={videoUrl}
            controls
            playsInline
          />
        </div>
      )}

      <section className="ai-history">
        <h3>Historial</h3>

        {history.map(item => (
          <article
            className="history-item"
            key={item._id}
          >
            <strong>
              {item.status}
            </strong>

            <p>{item.prompt}</p>

            {item.videoUrl && (
              <button
                onClick={() => {
                  setVideoUrl(
                    item.videoUrl
                  );
                  setStatus(
                    item.status
                  );
                }}
              >
                Ver video
              </button>
            )}
          </article>
        ))}
      </section>
    </section>
  );
}
