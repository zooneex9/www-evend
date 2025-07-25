import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import UserForm from '../components/UserForm';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleCreated = () => {
    toast.success('¡Usuario creado exitosamente!');
    fetchUsers();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario ${user.name}?`)) return;
    setLoading(true);
    try {
      await api.delete(`/users/${user.id}`);
      toast.success('Usuario eliminado');
      fetchUsers();
    } catch (e) {
      toast.error('Error al eliminar usuario');
    }
    setLoading(false);
  };

  const handleSuspend = async (user) => {
    if (!window.confirm(`¿Seguro que deseas suspender al usuario ${user.name}?`)) return;
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, { role: 'suspended' });
      toast.success('Usuario suspendido');
      fetchUsers();
    } catch (e) {
      toast.error('Error al suspender usuario');
    }
    setLoading(false);
  };

  const userColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Rol', sortable: true },
  ];

  return (
    <>
      <h2 className="fw-bold mb-4">Usuarios</h2>
      <div className="mb-4">
        <UserForm onCreated={handleCreated} />
      </div>
      {loading ? (
        <div className="text-center py-4">Cargando usuarios...</div>
      ) : (
        <DataTable
          data={users}
          columns={userColumns}
          title="Usuarios"
          searchable={true}
          filterable={true}
          pagination={true}
          itemsPerPage={10}
          onDelete={handleDelete}
          onEdit={handleSuspend}
        />
      )}
    </>
  );
} 