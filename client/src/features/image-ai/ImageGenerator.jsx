import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getHeaders = () => ({
    Authorization:
      `Bearer ${localStorage.getItem("kronos_token")}`
  });

  async function generate() {
    if (!prompt.trim()) return;

    const token = localStorage.getItem("kronos_token");

    if (!token) {
      alert("Inicia sesión primero");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/ai/images/generate`,
        { prompt },
        {
          headers: getHeaders()
        }
      );

      setImageUrl(
        response.data.generation.imageUrl || ""
      );

      if (response.data.message) {
        setMessage(response.data.message);
      }

      loadHistory();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
        "Error generando imagen"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    const token = localStorage.getItem("kronos_token");

    if (!token) return;

    try {
      const response = await axios.get(
        `${API}/ai/images/history`,
        {
          headers: getHeaders()
        }
      );

      setHistory(response.data.generations);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section className="page">
      <h2>IA Generadora de Imágenes</h2>

      <div className="ai-panel">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe la imagen que quieres crear..."
        />

        <button
          onClick={generate}
          disabled={loading}
        >
          {loading
            ? "Generando..."
            : "Generar Imagen"}
        </button>
      </div>

      {message && (
        <p>{message}</p>
      )}

      {imageUrl && (
        <div className="image-result">
          <img
            src={imageUrl}
            alt={prompt}
          />
        </div>
      )}

      <section className="ai-history">
        <h3>Galería</h3>

        <div className="image-gallery">
          {history
            .filter(item => item.imageUrl)
            .map(item => (
              <button
                className="image-card"
                key={item._id}
                onClick={() =>
                  setImageUrl(item.imageUrl)
                }
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                />
              </button>
            ))}
        </div>
      </section>
    </section>
  );
}
