import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UserList({ users, onUpdated, onDeleted }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const startEdit = user => {
    setEditId(user.id);
    setEditForm({ name: user.name, email: user.email });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', email: '' });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e, userId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, editForm);
      setEditId(null);
      setEditForm({ name: '', email: '' });
      if (onUpdated) onUpdated();
      toast.success('Usuario actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async userId => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setLoading(true);
    try {
      await api.delete(`/users/${userId}`);
      if (onDeleted) onDeleted();
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {users.length === 0 && (
        <div style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>No hay usuarios registrados.</div>
      )}
      {users.map(user => (
        <div
          key={user.id}
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
          {editId === user.id ? (
            <form onSubmit={e => handleEditSubmit(e, user.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input name="name" value={editForm.name} onChange={handleEditChange} required />
              <input name="email" value={editForm.email} onChange={handleEditChange} required />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.name}</span>
              <span style={{ color: '#e50914', fontWeight: 500 }}>{user.email}</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(user)}>Editar</button>
                <button onClick={() => handleDelete(user.id)} style={{ background: '#b0060f' }}>Eliminar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
} 