import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error de autenticación');
      setUser(null);
      setToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 