import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EventList({ events, onUpdated, onDeleted }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', start_date: '', end_date: '', is_published: false });
  const [loading, setLoading] = useState(false);

  const startEdit = event => {
    setEditId(event.id);
    setEditForm({
      title: event.title,
      description: event.description,
      location: event.location,
      start_date: event.start_date,
      end_date: event.end_date,
      is_published: event.is_published,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ title: '', description: '', location: '', start_date: '', end_date: '', is_published: false });
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e, eventId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/events/${eventId}`, editForm);
      setEditId(null);
      setEditForm({ title: '', description: '', location: '', start_date: '', end_date: '', is_published: false });
      if (onUpdated) onUpdated();
      toast.success('Evento actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async eventId => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return;
    setLoading(true);
    try {
      await api.delete(`/events/${eventId}`);
      if (onDeleted) onDeleted();
      toast.success('Evento eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {events.length === 0 && (
        <div style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>No hay eventos registrados.</div>
      )}
      {events.map(event => (
        <div
          key={event.id}
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
          {editId === event.id ? (
            <form onSubmit={e => handleEditSubmit(e, event.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input name="title" value={editForm.title} onChange={handleEditChange} required />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} required />
              <input name="location" value={editForm.location} onChange={handleEditChange} required />
              <input type="datetime-local" name="start_date" value={editForm.start_date} onChange={handleEditChange} required />
              <input type="datetime-local" name="end_date" value={editForm.end_date} onChange={handleEditChange} required />
              <label style={{ color: '#fff', fontWeight: 500 }}>
                Publicado:
                <input type="checkbox" name="is_published" checked={editForm.is_published} onChange={handleEditChange} style={{ marginLeft: 8 }} />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{event.title}</span>
              <span style={{ color: '#e50914', fontWeight: 500 }}>Ubicación: {event.location}</span>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>Inicio: {event.start_date} | Fin: {event.end_date}</span>
              <span style={{ color: event.is_published ? '#1f8a3b' : '#e50914', fontWeight: 600 }}>
                {event.is_published ? 'Publicado' : 'No publicado'}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 8,
                  flexWrap: 'wrap',
                  flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                  alignItems: window.innerWidth < 600 ? 'stretch' : 'center',
                }}
              >
                <button onClick={() => startEdit(event)}>Editar</button>
                <button onClick={() => handleDelete(event.id)} style={{ background: '#b0060f' }}>Eliminar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
} 