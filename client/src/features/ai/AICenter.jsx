import { useState } from "react";
import ScriptGenerator from "../script-ai/ScriptGenerator";
import ImageGenerator from "../image-ai/ImageGenerator";
import VideoGenerator from "../video-ai/VideoGenerator";

const modes = [
  { id: "script", label: "Scripts" },
  { id: "image", label: "Imagen" },
  { id: "video", label: "Video" }
];

export default function AICenter() {
  const [mode, setMode] = useState("script");

  return (
    <section className="ai-center page">
      <header className="ai-center-header">
        <h1>KRONOS AI</h1>
        <p>
          Genera scripts, imágenes y videos desde un solo lugar.
        </p>
      </header>

      <nav className="ai-mode-selector">
        {modes.map(item => (
          <button
            key={item.id}
            className={mode === item.id ? "active" : ""}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="ai-workspace">
        {mode === "script" && <ScriptGenerator />}
        {mode === "image" && <ImageGenerator />}
        {mode === "video" && <VideoGenerator />}
      </main>
    </section>
  );
}
