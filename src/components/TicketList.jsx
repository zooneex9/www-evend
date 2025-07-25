import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TicketList({ tickets, onUpdated, onDeleted }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ event_id: '', user_id: '', name: '', category: '', price: '' });
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId !== null) {
      Promise.all([
        api.get('/events'),
        api.get('/users')
      ]).then(([eventsRes, usersRes]) => {
        setEvents(eventsRes.data);
        setUsers(usersRes.data);
      }).catch(err => console.error('Error al cargar datos:', err));
    }
  }, [editId]);

  const startEdit = ticket => {
    setEditId(ticket.id);
    setEditForm({
      event_id: ticket.event_id,
      user_id: ticket.user_id,
      name: ticket.name || '',
      category: ticket.category,
      price: ticket.price,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ event_id: '', user_id: '', name: '', category: '', price: '' });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e, ticketId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/tickets/${ticketId}`, editForm);
      setEditId(null);
      setEditForm({ event_id: '', user_id: '', name: '', category: '', price: '' });
      if (onUpdated) onUpdated();
      toast.success('Ticket actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async ticketId => {
    if (!window.confirm('¿Seguro que deseas eliminar este ticket?')) return;
    setLoading(true);
    try {
      await api.delete(`/tickets/${ticketId}`);
      if (onDeleted) onDeleted();
      toast.success('Ticket eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {tickets.length === 0 && (
        <div style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>No hay tickets registrados.</div>
      )}
      {tickets.map(ticket => (
        <div
          key={ticket.id}
          style={{
            background: 'linear-gradient(90deg, #181818 80%, #e50914 100%)',
            borderRadius: 8,
            padding: 18,
            boxShadow: '0 2px 8px #0006',
            borderLeft: '5px solid #e50914',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          {editId === ticket.id ? (
            <form onSubmit={e => handleEditSubmit(e, ticket.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Evento:
                <select name="event_id" value={editForm.event_id} onChange={handleEditChange} required>
                  <option value="">Seleccione un evento</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {event.location} ({new Date(event.start_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </label>
              <label>Usuario:
                <select name="user_id" value={editForm.user_id} onChange={handleEditChange} required>
                  <option value="">Seleccione un usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </label>
              <input name="name" value={editForm.name} onChange={handleEditChange} required placeholder="Nombre del ticket" />
              <input name="category" value={editForm.category} onChange={handleEditChange} required placeholder="Categoría" />
              <input name="price" value={editForm.price} onChange={handleEditChange} required placeholder="Precio" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Categoría: {ticket.category}</span>
              <span style={{ color: '#e50914', fontWeight: 500 }}>Evento: {ticket.event_id} | Usuario: {ticket.user_id}</span>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>Precio: {ticket.price}</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(ticket)}>Editar</button>
                <button onClick={() => handleDelete(ticket.id)} style={{ background: '#b0060f' }}>Eliminar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
} 