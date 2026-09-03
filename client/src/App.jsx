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
import PostDetail from "./features/social/PostDetail";
import UserSearch from "./features/users/UserSearch";
import Profile from "./features/users/Profile";

function AppContent() {
  const [user, setUser] = useState(() => {
    try {
      const token =
        localStorage.getItem("kronos_token");

      if (!token) {
        return null;
      }

      const storedUser =
        localStorage.getItem("kronos_user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "KRONOS_USER_LOAD_ERROR:",
        error
      );

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
      console.error(
        "KRONOS_LOGOUT_ERROR:",
        error
      );
    }
  }

  if (!user) {
    return (
      <Auth onLogin={handleLogin} />
    );
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">
          Inicio
        </Link>

        <Link to="/users">
          Explorar
        </Link>

        <Link to="/profile">
          Perfil
        </Link>

        <Link to="/ai">
          IA
        </Link>

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

        <button
          type="button"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<SocialPage />}
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
          path="/post/:id"
          element={<PostDetail />}
        />

        <Route
          path="/users"
          element={<UserSearch />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/users/:id"
          element={<Profile />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}

