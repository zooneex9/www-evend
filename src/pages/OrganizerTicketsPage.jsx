import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Table, Card, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function OrganizerTicketsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [ticketsByEvent, setTicketsByEvent] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ eventId: '', name: '', price: '', quantity: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'organizer' && user.role !== 'superadmin')) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (events.length > 0) {
      events.forEach(event => {
        if (!ticketsByEvent[event.id]) {
          fetchTickets(event.id);
        }
      });
    }
  }, [events]);

  const fetchEvents = async () => {
    try {
      const res = await api.get(`/events?organizer_id=${user.id}`);
      setEvents(res.data);
    } catch (e) {
      setEvents([]);
    }
  };

  const fetchTickets = async (eventId) => {
    try {
      const res = await api.get(`/tickets?event_id=${eventId}`);
      setTicketsByEvent(prev => ({ ...prev, [eventId]: res.data }));
    } catch (e) {
      setTicketsByEvent(prev => ({ ...prev, [eventId]: [] }));
    }
  };

  const handleShowModal = () => {
    setForm({ eventId: '', name: '', price: '', quantity: '' });
    setShowModal(true);
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/tickets', {
        event_id: form.eventId,
        user_id: user.id,
        name: form.name,
        price: form.price,
        quantity: form.quantity,
      });
      toast.success('Ticket agregado exitosamente');
      setShowModal(false);
      setForm({ eventId: '', name: '', price: '', quantity: '' });
      fetchTickets(form.eventId);
    } catch (err) {
      toast.error('Error al agregar ticket');
    }
    setAdding(false);
  };

  return (
    <div className="container py-4 bg-white text-dark">
      <h2 className="text-white mb-4">Mis Tickets</h2>
      <Button variant="primary" className="mb-3" onClick={handleShowModal}>
        + Agregar Ticket
      </Button>
      <Card className="shadow-sm border-0 mt-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Mis Tickets Vendidos</h5>
          {loading || events.some(event => !ticketsByEvent[event.id]) ? (
            <div className="text-center py-4">Cargando tickets...</div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover variant="dark" className="rounded">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Nombre Ticket</th>
                    <th>Vendidos</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => {
                    const eventTickets = ticketsByEvent[event.id] || [];
                    const firstTicket = eventTickets[0];
                    const totalSold = eventTickets.reduce((acc, t) => acc + (t.sold || 0), 0);
                    return (
                      <tr key={event.id}>
                        <td>{event.title}</td>
                        <td>{firstTicket?.name || '-'}</td>
                        <td>{totalSold}</td>
                        <td>${firstTicket?.price || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-white">Agregar Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddTicket}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Evento</Form.Label>
              <Form.Select
                value={form.eventId}
                onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))}
                required
              >
                <option value="">Selecciona un evento</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Nombre del Ticket</Form.Label>
              <Form.Control
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Precio</Form.Label>
              <Form.Control
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                min={0}
                step={0.01}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Cantidad</Form.Label>
              <Form.Control
                type="number"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                min={1}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={adding}>
              {adding ? 'Agregando...' : 'Agregar Ticket'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default OrganizerTicketsPage; 