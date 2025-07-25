import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function OrganizerList({ organizers, onUpdated, onDeleted }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ company_name: '', subdomain: '', is_active: true });
  const [loading, setLoading] = useState(false);

  const startEdit = organizer => {
    setEditId(organizer.id);
    setEditForm({
      company_name: organizer.company_name,
      subdomain: organizer.subdomain,
      is_active: organizer.is_active,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ company_name: '', subdomain: '', is_active: true });
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e, organizerId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/organizers/${organizerId}`, editForm);
      setEditId(null);
      setEditForm({ company_name: '', subdomain: '', is_active: true });
      if (onUpdated) onUpdated();
      toast.success('Organizador actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar organizador');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async organizerId => {
    if (!window.confirm('¿Seguro que deseas eliminar este organizador?')) return;
    setLoading(true);
    try {
      await api.delete(`/organizers/${organizerId}`);
      if (onDeleted) onDeleted();
      toast.success('Organizador eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar organizador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ul>
      {organizers.map(org => (
        <li key={org.id}>
          {editId === org.id ? (
            <form onSubmit={e => handleEditSubmit(e, org.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input name="company_name" value={editForm.company_name} onChange={handleEditChange} required />
              <input name="subdomain" value={editForm.subdomain} onChange={handleEditChange} required />
              <label style={{ color: '#fff', fontWeight: 500 }}>
                Activo:
                <input type="checkbox" name="is_active" checked={editForm.is_active} onChange={handleEditChange} style={{ marginLeft: 8 }} />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              {org.company_name} ({org.subdomain}) {org.is_active ? <span style={{ color: '#1f8a3b', fontWeight: 600 }}>[Activo]</span> : <span style={{ color: '#e50914', fontWeight: 600 }}>[Inactivo]</span>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(org)}>Editar</button>
                <button onClick={() => handleDelete(org.id)} style={{ background: '#b0060f' }}>Eliminar</button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
