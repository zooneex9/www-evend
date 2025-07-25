import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import api from '../services/api';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [clientUser, setClientUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSubdomainId, setEditingSubdomainId] = useState(null);
  const [subdomainValue, setSubdomainValue] = useState("");

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organizers');
      setOrganizers(res.data);
    } catch (e) {
      setOrganizers([]);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setClientUser(null);
    try {
      const res = await api.get(`/users?email=${searchEmail}`);
      const user = res.data.find(u => u.role === 'client');
      if (user) {
        setClientUser(user);
      } else {
        setError('No se encontró un usuario cliente con ese email.');
      }
    } catch (err) {
      setError('Error al buscar usuario.');
    }
    setSearching(false);
  };

  const handleConvert = async () => {
    if (!clientUser) return;
    setConvertLoading(true);
    setError(null);
    try {
      await api.put(`/users/${clientUser.id}`, { role: 'organizer' });
      toast.success('Usuario convertido a organizador');
      setClientUser(null);
      setSearchEmail('');
      fetchOrganizers();
    } catch (err) {
      setError('Error al convertir usuario.');
    }
    setConvertLoading(false);
  };

  const handleDelete = async (organizer) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al organizador ${organizer.company_name}?`)) return;
    setLoading(true);
    try {
      await api.delete(`/organizers/${organizer.id}`);
      toast.success('Organizador eliminado');
      fetchOrganizers();
    } catch (e) {
      toast.error('Error al eliminar organizador');
    }
    setLoading(false);
  };

  const handleSuspend = async (organizer) => {
    if (!window.confirm(`¿Seguro que deseas suspender al organizador ${organizer.company_name}?`)) return;
    setLoading(true);
    try {
      await api.put(`/organizers/${organizer.id}`, { is_active: false });
      toast.success('Organizador suspendido');
      fetchOrganizers();
    } catch (e) {
      toast.error('Error al suspender organizador');
    }
    setLoading(false);
  };

  const handleSubdomainEdit = (org) => {
    setEditingSubdomainId(org.id);
    setSubdomainValue(org.subdomain || "");
  };

  const handleSubdomainSave = async (org) => {
    try {
      await api.put(`/organizers/${org.id}`, { subdomain: subdomainValue });
      toast.success('Subdominio actualizado');
      setEditingSubdomainId(null);
      fetchOrganizers();
    } catch (e) {
      toast.error('Error al actualizar subdominio');
    }
  };

  const organizerColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'company_name', label: 'Empresa', sortable: true },
    { key: 'user_name', label: 'Nombre', render: (v, org) => org.user?.name || '', sortable: false },
    { key: 'user_email', label: 'Email', render: (v, org) => org.user?.email || '', sortable: false },
    { key: 'user_role', label: 'Rol', render: (v, org) => org.user?.role || '', sortable: false },
    { key: 'subdomain', label: 'Subdominio', render: (v, org) =>
      editingSubdomainId === org.id ? (
        <>
          <input value={subdomainValue} onChange={e => setSubdomainValue(e.target.value)} style={{width:120}} />
          <Button size="sm" variant="success" onClick={() => handleSubdomainSave(org)} className="ms-2">Guardar</Button>
          <Button size="sm" variant="secondary" onClick={() => setEditingSubdomainId(null)} className="ms-2">Cancelar</Button>
        </>
      ) : (
        <>
          {org.subdomain || ''} <Button size="sm" variant="outline-primary" onClick={() => handleSubdomainEdit(org)}>Editar</Button>
        </>
      ), sortable: false },
    { key: 'is_active', label: 'Activo', sortable: true, render: v => v ? 'Sí' : 'No' },
  ];

  return (
    <>
      <Card className="bg-white text-dark border-0 shadow-sm mb-4" style={{ maxWidth: 500 }}>
        <Card.Body>
          <h5 className="fw-bold mb-3">Convertir usuario cliente en organizador</h5>
          <Form onSubmit={handleSearch} autoComplete="off">
            <Form.Group className="mb-3" controlId="searchEmail">
              <Form.Label className="text-white">Buscar por email</Form.Label>
              <Form.Control
                type="email"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                required
                className="bg-white text-dark border-secondary rounded-pill"
                placeholder="correo@dominio.com"
                autoComplete="off"
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={searching}>
                {searching ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                Buscar usuario
              </Button>
            </div>
          </Form>
          {clientUser && (
            <Alert variant="success" className="mt-3">
              <div><b>Usuario encontrado:</b> {clientUser.name} ({clientUser.email})</div>
              <Button variant="warning" className="mt-2 rounded-pill px-4" onClick={handleConvert} disabled={convertLoading}>
                {convertLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                Convertir en organizador
              </Button>
            </Alert>
          )}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Card.Body>
      </Card>
      {loading ? (
        <div className="text-center py-4">Cargando organizadores...</div>
      ) : (
        <DataTable
          data={organizers}
          columns={organizerColumns}
          title="Organizadores"
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
