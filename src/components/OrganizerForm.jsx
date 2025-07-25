import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function OrganizerForm({ onCreated }) {
  const [form, setForm] = useState({
    user_id: '',
    company_name: '',
    subdomain: '',
    is_active: true,
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar usuarios al montar el componente
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error al cargar usuarios:', err));
  }, []);

  // Filtrar usuarios: solo clientes que no sean organizadores
  const selectableUsers = users.filter(user => user.role === 'client' && !user.organizer_id);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/organizers', form);
      setForm({ user_id: '', company_name: '', subdomain: '', is_active: true });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear organizador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <div>
        <label>Usuario: </label>
        <select name="user_id" value={form.user_id} onChange={handleChange} required>
          <option value="">Seleccione un usuario</option>
          {selectableUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Nombre de la empresa: </label>
        <input name="company_name" value={form.company_name} onChange={handleChange} required />
      </div>
      <div>
        <label>Subdominio: </label>
        <input name="subdomain" value={form.subdomain} onChange={handleChange} required />
      </div>
      <div>
        <label>Activo: </label>
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
      </div>
      <button type="submit" disabled={loading}>Crear organizador</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
