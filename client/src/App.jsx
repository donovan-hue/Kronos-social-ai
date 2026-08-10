import { Routes, Route, Navigate } from "react-router-dom";
import SocialPage from "./features/social/SocialPage";
import ScriptGenerator from "./features/script-ai/ScriptGenerator";

function Home() {
  return (
    <main className="app">
      <h1>KRONOS</h1>
      <p>Social AI Platform</p>

      <nav>
        <a href="/social">Red Social</a>
        <a href="/ai/image">IA Imagen</a>
        <a href="/ai/video">IA Video</a>
        <a href="/ai/scripts">IA Scripts</a>
      </nav>
    </main>
  );
}

function Social() { return <SocialPage />; }

function ImageAI() {
  return <section className="page"><h2>Generador de Imágenes</h2></section>;
}

function VideoAI() {
  return <section className="page"><h2>Generador de Videos</h2></section>;
}

function ScriptAI() { return <ScriptGenerator />; }

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/social" element={<Social />} />
      <Route path="/ai/image" element={<ImageAI />} />
      <Route path="/ai/video" element={<VideoAI />} />
      <Route path="/ai/scripts" element={<ScriptAI />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
