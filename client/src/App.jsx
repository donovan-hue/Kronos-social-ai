import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

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

      if (!token) {
        return null;
      }

      const storedUser = localStorage.getItem("kronos_user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("KRONOS_USER_LOAD_ERROR:", error);

      localStorage.removeItem("kronos_token");
      localStorage.removeItem("kronos_user");

      return null;
    }
  });

  function handleLogin(loggedUser) {
    setUser(loggedUser);
  }

  function logout() {
    try {
      localStorage.removeItem("kronos_token");
      localStorage.removeItem("kronos_user");
      setUser(null);
    } catch (error) {
      console.error("KRONOS_LOGOUT_ERROR:", error);
    }
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Inicio</Link>

        <Link to="/ai">IA</Link>

        <Link to="/ai/image">
          Imagen
        </Link>

        <Link to="/ai/script">
          Guiones
        </Link>

        <Link to="/ai/video">
          Video
        </Link>

        <Link to="/social">
          Social
        </Link>

        <Link to="/users">
          Usuarios
        </Link>

        <button
          type="button"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </nav>

      <Routes>
        {/* Inicio = Feed principal */}
        <Route
          path="/"
          element={<SocialPage />}
        />

        {/* Centro de IA */}
        <Route
          path="/ai"
          element={<AICenter />}
        />

        {/* Generador de imágenes */}
        <Route
          path="/ai/image"
          element={<ImageGenerator />}
        />

        {/* Generador de guiones */}
        <Route
          path="/ai/script"
          element={<ScriptGenerator />}
        />

        {/* Generador de videos */}
        <Route
          path="/ai/video"
          element={<VideoGenerator />}
        />

        {/* Red social */}
        <Route
          path="/social"
          element={<SocialPage />}
        />

        {/* Búsqueda de usuarios */}
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
