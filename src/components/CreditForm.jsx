import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CreditForm({ onCreated }) {
  const [form, setForm] = useState({
    organizer_id: '',
    amount: '',
    used: 0,
    description: '',
  });
  const [organizers, setOrganizers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/organizers')
      .then(res => setOrganizers(res.data))
      .catch(err => console.error('Error al cargar organizadores:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/credits', form);
      setForm({
        organizer_id: '',
        amount: '',
        used: 0,
        description: '',
      });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar crédito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <div>
        <label>Organizador: </label>
        <select name="organizer_id" value={form.organizer_id} onChange={handleChange} required>
          <option value="">Seleccione un organizador</option>
          {organizers.map(organizer => (
            <option key={organizer.id} value={organizer.id}>
              {organizer.company_name} ({organizer.subdomain})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Cantidad: </label>
        <input name="amount" value={form.amount} onChange={handleChange} required />
      </div>
      <div>
        <label>Usados: </label>
        <input name="used" value={form.used} onChange={handleChange} />
      </div>
      <div>
        <label>Descripción: </label>
        <input name="description" value={form.description} onChange={handleChange} />
      </div>
      <button type="submit" disabled={loading}>Asignar crédito</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
} 