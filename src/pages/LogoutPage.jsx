import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      setTimeout(() => navigate('/login'), 2000);
    };
    doLogout();
  }, [logout, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#181818' }}>
      <div style={{ background: '#222', padding: 40, borderRadius: 16, boxShadow: '0 4px 24px #000a', minWidth: 340, width: 360, textAlign: 'center' }}>
        <img src="/Domkard-White.png" alt="Domkard Logo" style={{ width: 120, height: 'auto', marginBottom: 24 }} />
        <h2 style={{ color: '#e50914', marginBottom: 16 }}>¡Hasta pronto!</h2>
        <div style={{ color: '#fff', marginBottom: 16 }}>Tu sesión ha sido cerrada correctamente.</div>
        <div style={{ color: '#aaa' }}>Redirigiendo al login...</div>
      </div>
    </div>
  );
} 