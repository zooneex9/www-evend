import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TicketForm({ eventId, userId, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      api.get('/events')
        .then(res => setEvents(res.data))
        .catch(err => console.error('Error al cargar eventos:', err));
    }
    if (!eventId) {
      api.get('/users')
        .then(res => setUsers(res.data))
        .catch(err => console.error('Error al cargar usuarios:', err));
    }
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/tickets', {
        ...formData,
        event_id: eventId,
        user_id: userId,
      });
      toast.success('Ticket creado exitosamente');
      setFormData({ name: '', description: '', price: '', quantity: '' });
      if (onCreated) onCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre del ticket"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Descripción"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff', minHeight: 100 }}
      />
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Precio"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Cantidad"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <button type="submit" style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
        Crear ticket
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
