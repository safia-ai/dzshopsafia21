import { createContext, useState } from 'react';
import api, { setAuthToken } from './api/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const saveSession = (session) => {
    setUser(session.user);
    setToken(session.token);
    setAuthToken(session.token);
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
    const publicRole = role === 'vendor' ? 'vendor' : 'client';
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
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}