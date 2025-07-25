import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/users', { ...form, role: 'client' });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
      <h1 style={{ color: '#e50914', marginBottom: 24, textAlign: 'center' }}>Registro</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#181818', borderRadius: 12, padding: 32, boxShadow: '0 4px 24px #000a', border: '1px solid #e50914' }}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre completo"
          required
          style={{ padding: 10, borderRadius: 6, border: 'none', background: '#222', color: '#fff' }}
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Correo electrónico"
          required
          style={{ padding: 10, borderRadius: 6, border: 'none', background: '#222', color: '#fff' }}
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Contraseña"
          required
          style={{ padding: 10, borderRadius: 6, border: 'none', background: '#222', color: '#fff' }}
        />
        <input
          type="password"
          name="password_confirmation"
          value={form.password_confirmation}
          onChange={handleChange}
          placeholder="Confirmar contraseña"
          required
          style={{ padding: 10, borderRadius: 6, border: 'none', background: '#222', color: '#fff' }}
        />
        <button type="submit" disabled={loading} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#1f8a3b', textAlign: 'center' }}>¡Registro exitoso! Redirigiendo...</div>}
      </form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        ¿Ya tienes cuenta? <a href="/login" style={{ color: '#e50914', textDecoration: 'underline' }}>Inicia sesión</a>
      </div>
    </div>
  );
} 