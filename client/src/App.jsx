import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import Auth from "./features/auth/Auth";
import ImageGenerator from "./features/image-ai/ImageGenerator";
import ScriptGenerator from "./features/script-ai/ScriptGenerator";
import VideoGenerator from "./features/video-ai/VideoGenerator";
import VideoJobs from "./features/video-ai/VideoJobs";
import AICenter from "./features/ai/AICenter";
import KairosHistory from "./features/ai/KairosHistory";
import MediaLibrary from "./features/ai/MediaLibrary";
import SocialPage from "./features/social/SocialPage";
import PostDetail from "./features/social/PostDetail";
import UserSearch from "./features/users/UserSearch";
import Profile from "./features/users/Profile";
import Messages from "./features/messages/Messages";
import Notifications from "./features/notifications/Notifications";
import CreatePost from "./features/social/CreatePost";
import Settings from "./features/settings/Settings";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { connectSocket, disconnectSocket } from "./services/socket";
function readSession() { try { const storage = localStorage.getItem("kronos_token") ? localStorage : sessionStorage; const token = storage.getItem("kronos_token"); const storedUser = storage.getItem("kronos_user"); return token && storedUser ? JSON.parse(storedUser) : null; } catch { return null; } }
function AppContent() { const [user, setUser] = useState(readSession); useEffect(() => { const interceptor = axios.interceptors.response.use((response) => response, (error) => { if (error.response?.status === 401) logout(); return Promise.reject(error); }); return () => axios.interceptors.response.eject(interceptor); }, []); useEffect(() => { if (!user) { disconnectSocket(); return undefined; } connectSocket(localStorage.getItem("kronos_token") || sessionStorage.getItem("kronos_token")); return () => disconnectSocket(); }, [user]); function logout() { localStorage.removeItem("kronos_token"); localStorage.removeItem("kronos_user"); sessionStorage.removeItem("kronos_token"); sessionStorage.removeItem("kronos_user"); setUser(null); } return <Routes><Route path="/login" element={user ? <Navigate replace to="/home" /> : <Auth onLogin={setUser} initialMode="login" />} /><Route path="/register" element={user ? <Navigate replace to="/home" /> : <Auth onLogin={setUser} initialMode="register" />} /><Route path="/" element={<Navigate replace to={user ? "/home" : "/login"} />} /><Route element={<ProtectedRoute user={user} />}><Route element={<AppLayout user={user} />}><Route path="/home" element={<SocialPage />} /><Route path="/feed" element={<SocialPage />} /><Route path="/social" element={<SocialPage />} /><Route path="/explore" element={<UserSearch />} /><Route path="/search" element={<UserSearch />} /><Route path="/create" element={<CreatePost />} /><Route path="/create-post" element={<CreatePost />} /><Route path="/kairos" element={<AICenter />} /><Route path="/kairos/image" element={<ImageGenerator />} /><Route path="/kairos/video" element={<VideoGenerator />} /><Route path="/kairos/script" element={<ScriptGenerator />} /><Route path="/kairos/history" element={<KairosHistory />} /><Route path="/ai" element={<AICenter />} /><Route path="/ai/image" element={<ImageGenerator />} /><Route path="/ai/script" element={<ScriptGenerator />} /><Route path="/ai/video" element={<VideoGenerator />} /><Route path="/ai/video/jobs" element={<VideoJobs />} /><Route path="/library" element={<MediaLibrary />} /><Route path="/post/:id" element={<PostDetail />} /><Route path="/users" element={<UserSearch />} /><Route path="/profile" element={<Profile />} /><Route path="/profile/:username" element={<Profile />} /><Route path="/users/:id" element={<Profile />} /><Route path="/messages" element={<Messages />} /><Route path="/messages/:userId" element={<Messages />} /><Route path="/notifications" element={<Notifications />} /><Route path="/settings" element={<Settings onLogout={logout} />} /><Route path="/settings/profile" element={<Settings onLogout={logout} />} /></Route></Route><Route path="*" element={<Navigate replace to={user ? "/home" : "/login"} />} /></Routes>; }
export default function App() { return <BrowserRouter><AppContent /></BrowserRouter>; }
