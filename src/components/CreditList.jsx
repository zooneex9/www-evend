import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CreditList({ credits, onUpdated, onDeleted }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ organizer_id: '', amount: '', used: 0, description: '' });
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId !== null) {
      api.get('/organizers')
        .then(res => setOrganizers(res.data))
        .catch(err => console.error('Error al cargar organizadores:', err));
    }
  }, [editId]);

  const startEdit = credit => {
    setEditId(credit.id);
    setEditForm({
      organizer_id: credit.organizer_id,
      amount: credit.amount,
      used: credit.used,
      description: credit.description,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ organizer_id: '', amount: '', used: 0, description: '' });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e, creditId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/credits/${creditId}`, editForm);
      setEditId(null);
      setEditForm({ organizer_id: '', amount: '', used: 0, description: '' });
      if (onUpdated) onUpdated();
      toast.success('Crédito actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar crédito');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async creditId => {
    if (!window.confirm('¿Seguro que deseas eliminar este crédito?')) return;
    setLoading(true);
    try {
      await api.delete(`/credits/${creditId}`);
      if (onDeleted) onDeleted();
      toast.success('Crédito eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar crédito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {credits.length === 0 && (
        <div style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>No hay créditos registrados.</div>
      )}
      {credits.map(credit => (
        <div
          key={credit.id}
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
          {editId === credit.id ? (
            <form onSubmit={e => handleEditSubmit(e, credit.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Organizador:
                <select name="organizer_id" value={editForm.organizer_id} onChange={handleEditChange} required>
                  <option value="">Seleccione un organizador</option>
                  {organizers.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.company_name} ({org.subdomain})
                    </option>
                  ))}
                </select>
              </label>
              <input name="amount" value={editForm.amount} onChange={handleEditChange} required placeholder="Cantidad" />
              <input name="used" value={editForm.used} onChange={handleEditChange} placeholder="Usados" />
              <input name="description" value={editForm.description} onChange={handleEditChange} placeholder="Descripción" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Organizador: {credit.organizer_id}</span>
              <span style={{ color: '#e50914', fontWeight: 500 }}>Cantidad: {credit.amount} | Usados: {credit.used}</span>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>Descripción: {credit.description}</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(credit)}>Editar</button>
                <button onClick={() => handleDelete(credit.id)} style={{ background: '#b0060f' }}>Eliminar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
} 