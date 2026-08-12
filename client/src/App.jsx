import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Auth from "./features/auth/Auth";
import ImageGenerator from "./features/image-ai/ImageGenerator";
import ScriptGenerator from "./features/script-ai/ScriptGenerator";
import VideoGenerator from "./features/video-ai/VideoGenerator";
import AICenter from "./features/ai/AICenter";
import SocialPage from "./features/social/SocialPage";
import UserSearch from "./features/users/UserSearch";

function AppContent() {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("kronos_token");

      if (!token) return null;

      return JSON.parse(
        localStorage.getItem("kronos_user") || "null"
      );
    } catch {
      return null;
    }
  });

  function handleLogin(loggedUser) {
    setUser(loggedUser);
  }

  function logout() {
    localStorage.removeItem("kronos_token");
    localStorage.removeItem("kronos_user");
    setUser(null);
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Inicio</Link>
        <Link to="/ai">IA</Link>
        <Link to="/ai/image">Imagen</Link>
        <Link to="/ai/script">Guiones</Link>
        <Link to="/ai/video">Video</Link>
        <Link to="/social">Social</Link>
        <Link to="/users">Usuarios</Link>

        <button onClick={logout}>
          Cerrar sesión
        </button>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <main className="page">
              <h1>
                Kronos Social AI
              </h1>

              <p>
                Bienvenido,{" "}
                {user.displayName ||
                  user.username}
              </p>
            </main>
          }
        />

        <Route
          path="/ai"
          element={<AICenter />}
        />

        <Route
          path="/ai/image"
          element={<ImageGenerator />}
        />

        <Route
          path="/ai/script"
          element={<ScriptGenerator />}
        />

        <Route
          path="/ai/video"
          element={<VideoGenerator />}
        />

        <Route
          path="/social"
          element={<SocialPage />}
        />

        <Route
          path="/users"
          element={<UserSearch />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
