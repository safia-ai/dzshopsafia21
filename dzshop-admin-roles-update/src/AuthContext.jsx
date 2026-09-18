import { createContext, useEffect, useState } from 'react';
import api, { setAuthToken } from './api/axios';

const normalizeRole = (role) => {
  if (role === 'client') return 'user';
  if (role === 'vendor') return 'vendor';
  if (role === 'admin') return 'admin';
  return 'user';
};

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem('dzshop_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return null;
    return { ...parsed, user: { ...parsed.user, role: normalizeRole(parsed.user.role) } };
  } catch {
    return null;
  }
};

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession()?.user || null);
  const [token, setToken] = useState(() => readStoredSession()?.token || null);

  useEffect(() => {
    if (user && token) {
      setAuthToken(token);
      localStorage.setItem('dzshop_session', JSON.stringify({ user, token }));
    } else {
      setAuthToken(null);
      localStorage.removeItem('dzshop_session');
    }
  }, [user, token]);

  const saveSession = (session) => {
    const nextUser = { ...session.user, role: normalizeRole(session.user?.role) };
    setUser(nextUser);
    setToken(session.token);
    setAuthToken(session.token);
    localStorage.setItem('dzshop_session', JSON.stringify({ user: nextUser, token: session.token }));
  };

  const login = async (email, password) => {
    try {
      const { data: result } = await api.post('/auth/login', { email, password });
      saveSession(result);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Impossible de contacter le serveur.' };
    }
  };

  const register = async (nomOrData, emailArgument, passwordArgument) => {
    const registration = typeof nomOrData === 'object'
      ? nomOrData
      : { nom: nomOrData, email: emailArgument, password: passwordArgument };
    const { nom, email, password, role = 'client' } = registration;
    const publicRole = role === 'vendor' ? 'vendor' : 'user';
    try {
      const { data: result } = await api.post('/auth/register', { nom, email, password, role: publicRole });
      if (result.token && result.user) saveSession(result);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Impossible de contacter le serveur.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('dzshop_session');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}