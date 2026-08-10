import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function ScriptGenerator() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("video");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = () => ({
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

    try {
      const response = await axios.post(
        `${API}/ai/scripts/generate`,
        {
          prompt,
          type
        },
        {
          headers: headers()
        }
      );

      setResult(response.data.script.result);
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.error ||
        "Error generando script"
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
        `${API}/ai/scripts/history`,
        {
          headers: headers()
        }
      );

      setHistory(response.data.scripts);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section className="page">
      <h2>IA Generadora de Scripts</h2>

      <div className="ai-panel">
        <select
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="video">Video</option>
          <option value="reel">Reel</option>
          <option value="youtube">YouTube</option>
          <option value="advertisement">
            Publicidad
          </option>
          <option value="story">Historia</option>
          <option value="custom">Personalizado</option>
        </select>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe el contenido que quieres generar..."
        />

        <button
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Generando..." : "Generar Script"}
        </button>
      </div>

      {result && (
        <article className="ai-result">
          <h3>Resultado</h3>
          <pre>{result}</pre>
        </article>
      )}

      <section className="ai-history">
        <h3>Historial</h3>

        {history.map(item => (
          <article
            className="history-item"
            key={item._id}
            onClick={() => setResult(item.result)}
          >
            <strong>{item.type}</strong>
            <p>{item.prompt}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
