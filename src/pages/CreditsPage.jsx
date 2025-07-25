import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import api from '../services/api';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function CreditsPage() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCredits();
    fetchOrganizers();
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/credits');
      setCredits(res.data);
    } catch (e) {
      setCredits([]);
    }
    setLoading(false);
  };

  const fetchOrganizers = async () => {
    try {
      const res = await api.get('/organizers');
      setOrganizers(res.data);
    } catch (e) {
      setOrganizers([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    try {
      const res = await api.get(`/organizers?email=${searchEmail}`);
      if (res.data.length > 0) {
        setSelectedOrganizer(res.data[0].id);
        setError(null);
      } else {
        setError('No se encontró un organizador con ese email.');
      }
    } catch (err) {
      setError('Error al buscar organizador.');
    }
    setSearching(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedOrganizer || !amount) {
      setError('Selecciona un organizador y una cantidad.');
      return;
    }
    try {
      await api.post('/credits', {
        organizer_id: selectedOrganizer,
        amount: Number(amount),
        used: 0,
        description: description || 'Asignación manual',
      });
      setAmount('');
      setDescription('');
      setSuccess('Crédito asignado correctamente');
      fetchCredits();
    } catch (err) {
      setError('Error al asignar crédito.');
    }
  };

  const creditColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'organizer_id', label: 'Organizador', sortable: true },
    { key: 'amount', label: 'Cantidad', sortable: true },
    { key: 'used', label: 'Usados', sortable: true },
    { key: 'description', label: 'Descripción', sortable: true },
  ];

  return (
    <>
      <Card className="bg-white text-dark border-0 shadow-sm mb-4" style={{ maxWidth: 600 }}>
        <Card.Body>
          <h5 className="fw-bold mb-3">Asignar/Ajustar Créditos a Organizadores</h5>
          <Form onSubmit={handleAssign} autoComplete="off">
            <Form.Group className="mb-3" controlId="organizerSelect">
              <Form.Label className="text-dark">Seleccionar organizador</Form.Label>
              <Form.Select
                className="bg-white text-dark border-secondary rounded-pill"
                value={selectedOrganizer}
                onChange={e => setSelectedOrganizer(e.target.value)}
                required
              >
                <option value="">Selecciona un organizador</option>
                {organizers.map(org => (
                  <option key={org.id} value={org.id}>{org.company_name} ({org.subdomain})</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="searchEmail">
              <Form.Label className="text-dark">Buscar organizador por email</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="email"
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  className="bg-white text-dark border-secondary rounded-pill"
                  placeholder="correo@dominio.com"
                  autoComplete="off"
                />
                <Button type="button" variant="primary" className="rounded-pill px-3" onClick={handleSearch} disabled={searching}>
                  {searching ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                  Buscar
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="amount">
              <Form.Label className="text-dark">Cantidad de créditos</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="bg-white text-dark border-secondary rounded-pill"
                placeholder="Cantidad"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label className="text-dark">Descripción (opcional)</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="bg-white text-dark border-secondary rounded-pill"
                placeholder="Descripción"
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success" className="rounded-pill px-4">
                Asignar/Ajustar Créditos
              </Button>
            </div>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}
          </Form>
        </Card.Body>
      </Card>
      {loading ? (
        <div className="text-center py-4">Cargando créditos...</div>
      ) : (
        <DataTable
          data={credits}
          columns={creditColumns}
          title="Créditos"
          searchable={true}
          filterable={true}
          pagination={true}
          itemsPerPage={10}
        />
      )}
    </>
  );
}
