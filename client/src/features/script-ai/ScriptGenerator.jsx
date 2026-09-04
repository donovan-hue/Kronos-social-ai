import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function ScriptGenerator() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("video");
  const [genre, setGenre] = useState("general");
  const [format, setFormat] = useState("standard");
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState("");
  const [currentScriptId, setCurrentScriptId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [structure, setStructure] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMessage, setHistoryMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsMessage, setProjectsMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/ai/scripts/generate`,
        {
          prompt,
          type,
          genre,
          format,
          durationMinutes: Number(durationMinutes),
          tone,
          audience
        },
        {
          headers: headers()
        }
      );

      const generatedScript = response.data?.script;

      if (
        !generatedScript ||
        generatedScript.status !== "completed" ||
        typeof generatedScript.result !== "string" ||
        !generatedScript.result.trim() ||
        !generatedScript.structure ||
        !Array.isArray(generatedScript.structure.scenes)
      ) {
        throw new Error("SCRIPT_INVALID_RESPONSE");
      }

      setResult(generatedScript.result);
      setCurrentScriptId(generatedScript._id);
      setProjectId("");
      setStructure(generatedScript.structure);
      setEditing(false);
      loadHistory();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error ||
        "Error generando script"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateStructure(field, value) {
    setStructure(current => ({
      ...current,
      [field]: value
    }));
  }

  function updateNarrative(field, value) {
    setStructure(current => ({
      ...current,
      narrative: {
        ...current.narrative,
        [field]: value
      }
    }));
  }

  function updateScene(index, field, value) {
    setStructure(current => ({
      ...current,
      scenes: current.scenes.map((scene, sceneIndex) =>
        sceneIndex === index
          ? { ...scene, [field]: value }
          : scene
      )
    }));
  }

  async function saveEdits() {
    if (!currentScriptId || !structure) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await axios.put(
        `${API}/ai/scripts/${currentScriptId}`,
        { structure },
        { headers: headers() }
      );
      const updatedScript = response.data?.script;

      if (!updatedScript?.structure || !updatedScript.result) {
        throw new Error("SCRIPT_INVALID_RESPONSE");
      }

      setStructure(updatedScript.structure);
      setResult(updatedScript.result);
      setEditing(false);
      setHistory(current => current.map(item =>
        item._id === updatedScript._id ? updatedScript : item
      ));
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error ||
        "No se pudo guardar la edición"
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveProject() {
    if ((!currentScriptId && !projectId) || !structure) return;

    setSaving(true);
    setMessage("");

    const projectPayload = {
      title: structure.title,
      type,
      genre,
      format,
      durationMinutes: Number(durationMinutes),
      tone,
      audience,
      structure,
      ...(currentScriptId
        ? { sourceScript: currentScriptId }
        : {})
    };

    try {
      const response = await axios({
        method: projectId ? "put" : "post",
        url: projectId
          ? `${API}/ai/scripts/projects/${projectId}`
          : `${API}/ai/scripts/projects`,
        data: projectPayload,
        headers: headers()
      });
      const project = response.data?.project;

      if (!project?._id) {
        throw new Error("PROJECT_INVALID_RESPONSE");
      }

      setProjectId(project._id);
      setProjects(current => {
        const exists = current.some(item => item._id === project._id);
        return exists
          ? current.map(item => item._id === project._id ? project : item)
          : [project, ...current];
      });
      setMessage("Proyecto guardado correctamente");
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error ||
        "No se pudo guardar el proyecto"
      );
    } finally {
      setSaving(false);
    }
  }

  async function loadHistory() {
    const token = localStorage.getItem("kronos_token");

    if (!token) return;

    setHistoryLoading(true);
    setHistoryMessage("");

    try {
      const response = await axios.get(
        `${API}/ai/scripts/history`,
        {
          headers: headers()
        }
      );

      setHistory(
        Array.isArray(response.data?.scripts)
          ? response.data.scripts
          : []
      );
    } catch (error) {
      console.error(error);
      setHistoryMessage(
        error.response?.data?.error ||
        "No se pudo cargar el historial de guiones"
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadProjects() {
    const token = localStorage.getItem("kronos_token");

    if (!token) return;

    setProjectsLoading(true);
    setProjectsMessage("");

    try {
      const response = await axios.get(
        `${API}/ai/scripts/projects`,
        { headers: headers() }
      );

      setProjects(
        Array.isArray(response.data?.projects)
          ? response.data.projects
          : []
      );
    } catch (error) {
      console.error(error);
      setProjectsMessage(
        error.response?.data?.error ||
        "No se pudo cargar el historial de proyectos"
      );
    } finally {
      setProjectsLoading(false);
    }
  }

  async function exportProject(format) {
    if (!projectId) return;

    try {
      const response = await axios.get(
        `${API}/ai/scripts/projects/${projectId}/export`,
        {
          params: { format },
          headers: headers(),
          responseType: "blob"
        }
      );
      const extension = format === "json" ? "json" : "txt";
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `${structure?.title || "proyecto-guion"}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error ||
        "No se pudo exportar el proyecto"
      );
    }
  }

  function openProject(project) {
    setProjectId(project._id);
    setCurrentScriptId(project.sourceScript || "");
    setStructure(project.structure);
    setResult(project.result);
    setType(project.type);
    setGenre(project.genre);
    setFormat(project.format);
    setDurationMinutes(project.durationMinutes);
    setTone(project.tone || "");
    setAudience(project.audience || "");
    setEditing(false);
    setMessage("");
  }

  function openHistoryItem(item) {
    setResult(item.result);
    setCurrentScriptId(item._id);
    setProjectId("");
    setStructure(item.structure);
    setType(item.type);
    setGenre(item.genre);
    setFormat(item.format);
    setDurationMinutes(item.durationMinutes);
    setTone(item.tone || "");
    setAudience(item.audience || "");
    setEditing(false);
    setMessage("");
  }

  useEffect(() => {
    loadHistory();
    loadProjects();
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

        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          aria-label="Género"
        >
          <option value="general">Género general</option>
          <option value="drama">Drama</option>
          <option value="comedy">Comedia</option>
          <option value="thriller">Thriller</option>
          <option value="horror">Terror</option>
          <option value="romance">Romance</option>
          <option value="action">Acción</option>
          <option value="documentary">Documental</option>
          <option value="educational">Educativo</option>
        </select>

        <select
          value={format}
          onChange={e => setFormat(e.target.value)}
          aria-label="Formato"
        >
          <option value="standard">Formato estándar</option>
          <option value="cinematic">Cinematográfico</option>
          <option value="vertical">Vertical</option>
          <option value="documentary">Documental</option>
          <option value="podcast">Podcast</option>
          <option value="presentation">Presentación</option>
        </select>

        <input
          type="number"
          min="1"
          max="180"
          value={durationMinutes}
          onChange={e => setDurationMinutes(e.target.value)}
          placeholder="Duración en minutos"
          aria-label="Duración en minutos"
        />

        <input
          value={tone}
          onChange={e => setTone(e.target.value)}
          maxLength={100}
          placeholder="Tono (opcional)"
          aria-label="Tono"
        />

        <input
          value={audience}
          onChange={e => setAudience(e.target.value)}
          maxLength={200}
          placeholder="Audiencia (opcional)"
          aria-label="Audiencia"
        />

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
          {!editing && <pre>{result}</pre>}

          {editing && structure && (
            <div className="script-editor">
              <input
                value={structure.title}
                onChange={e => updateStructure("title", e.target.value)}
                aria-label="Título"
              />
              <textarea
                value={structure.logline}
                onChange={e => updateStructure("logline", e.target.value)}
                aria-label="Premisa"
              />

              {[
                ["beginning", "Inicio"],
                ["middle", "Desarrollo"],
                ["ending", "Cierre narrativo"]
              ].map(([field, label]) => (
                <textarea
                  key={field}
                  value={structure.narrative[field]}
                  onChange={e => updateNarrative(field, e.target.value)}
                  aria-label={label}
                  placeholder={label}
                />
              ))}

              {structure.scenes.map((scene, index) => (
                <fieldset key={`${scene.number}-${index}`}>
                  <legend>Escena {scene.number}</legend>
                  <input
                    value={scene.heading}
                    onChange={e => updateScene(index, "heading", e.target.value)}
                    aria-label={`Encabezado escena ${scene.number}`}
                  />
                  <textarea
                    value={scene.action}
                    onChange={e => updateScene(index, "action", e.target.value)}
                    aria-label={`Acción escena ${scene.number}`}
                  />
                  <textarea
                    value={scene.directions}
                    onChange={e => updateScene(index, "directions", e.target.value)}
                    aria-label={`Indicaciones escena ${scene.number}`}
                    placeholder="Indicaciones"
                  />
                  <input
                    value={scene.transition}
                    onChange={e => updateScene(index, "transition", e.target.value)}
                    aria-label={`Transición escena ${scene.number}`}
                    placeholder="Transición"
                  />
                  {scene.dialogue.map((line, lineIndex) => (
                    <textarea
                      key={`${line.character}-${lineIndex}`}
                      value={`${line.character}: ${line.text}`}
                      onChange={e => {
                        const [character, ...text] = e.target.value.split(":");
                        setStructure(current => ({
                          ...current,
                          scenes: current.scenes.map((currentScene, sceneIndex) =>
                            sceneIndex === index
                              ? {
                                  ...currentScene,
                                  dialogue: currentScene.dialogue.map((currentLine, currentLineIndex) =>
                                    currentLineIndex === lineIndex
                                      ? { ...currentLine, character: character.trim(), text: text.join(":").trim() }
                                      : currentLine
                                  )
                                }
                              : currentScene
                          )
                        }));
                      }}
                      aria-label={`Diálogo ${lineIndex + 1} escena ${scene.number}`}
                    />
                  ))}
                </fieldset>
              ))}

              <textarea
                value={structure.closing}
                onChange={e => updateStructure("closing", e.target.value)}
                aria-label="Cierre"
                placeholder="Cierre"
              />
              <button onClick={saveEdits} disabled={saving}>
                {saving ? "Guardando..." : "Guardar edición"}
              </button>
            </div>
          )}

          {!editing && currentScriptId && structure && (
            <button onClick={() => setEditing(true)}>
              Editar guion
            </button>
          )}

          {(currentScriptId || projectId) && structure && (
            <button onClick={saveProject} disabled={saving}>
              {saving
                ? "Guardando proyecto..."
                : projectId
                  ? "Actualizar proyecto"
                  : "Guardar proyecto"}
            </button>
          )}

          {projectId && (
            <div className="script-export-actions">
              <button onClick={() => exportProject("txt")}>
                Exportar TXT
              </button>
              <button onClick={() => exportProject("json")}>
                Exportar JSON
              </button>
            </div>
          )}
        </article>
      )}

      {message && (
        <p role="alert" aria-live="assertive">
          {message}
        </p>
      )}

      <section className="ai-history">
        <h3>Historial</h3>

        {historyLoading && (
          <p role="status">Cargando historial...</p>
        )}

        {!historyLoading && historyMessage && (
          <p role="alert">{historyMessage}</p>
        )}

        {!historyLoading && !historyMessage && history.length === 0 && (
          <p>No tienes guiones generados.</p>
        )}

        {!historyLoading && !historyMessage && history.map(item => (
          <article
            className="history-item"
            key={item._id}
            onClick={() => openHistoryItem(item)}
          >
            <strong>{item.type}</strong>
            <p>{item.prompt}</p>
          </article>
        ))}
      </section>

      <section className="ai-history">
        <h3>Proyectos guardados</h3>

        {projectsLoading && (
          <p role="status">Cargando proyectos...</p>
        )}

        {!projectsLoading && projectsMessage && (
          <p role="alert">{projectsMessage}</p>
        )}

        {!projectsLoading && !projectsMessage && projects.length === 0 && (
          <p>No tienes proyectos guardados.</p>
        )}

        {!projectsLoading && projects.map(project => (
          <article
            className="history-item"
            key={project._id}
          >
            <strong>{project.title}</strong>
            <p>{project.type} · {project.format}</p>
            <button onClick={() => openProject(project)}>
              Abrir proyecto
            </button>
          </article>
        ))}
      </section>
    </section>
  );
}
