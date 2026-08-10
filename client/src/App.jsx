import { Routes, Route, Navigate } from "react-router-dom";
import SocialPage from "./features/social/SocialPage";
import ScriptGenerator from "./features/script-ai/ScriptGenerator";
import ImageGenerator from "./features/image-ai/ImageGenerator";
import VideoGenerator from "./features/video-ai/VideoGenerator";
import AICenter from "./features/ai/AICenter";
import UserSearch from "./features/users/UserSearch";

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

function ImageAI() { return <ImageGenerator />; }

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
    
        <Route path="/ai" element={<AICenter />} />
        <Route path="/users" element={<UserSearch />} />
</Routes>
  );
}
