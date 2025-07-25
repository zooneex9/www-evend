import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <button onClick={handleLogout} style={{ background: '#b0060f', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
      Cerrar sesión
    </button>
  );
} 