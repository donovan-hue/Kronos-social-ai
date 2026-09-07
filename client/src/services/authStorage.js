const TOKEN_KEY = "kronos_token";
const USER_KEY = "kronos_user";

export function getToken() { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ""; }
export function getUser() { try { const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { clearSession(); return null; } }
export function saveSession(token, user, remember = true) { clearSession(); const storage = remember ? localStorage : sessionStorage; storage.setItem(TOKEN_KEY, token); storage.setItem(USER_KEY, JSON.stringify(user)); }
export function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); }
