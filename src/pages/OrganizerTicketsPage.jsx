import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Table, Card, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PriceCalculator from '../components/PriceCalculator';

function OrganizerTicketsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [ticketsByEvent, setTicketsByEvent] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ eventId: '', name: '', quantity: '' });
  const [adding, setAdding] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

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
      setLoading(true);
      
      // Determinar el organizer_id correcto
      let organizerId = user.id;
      if (user.role === 'organizer') {
        // Para organizadores, necesitamos encontrar su organizer_id
        try {
          const organizersRes = await api.get('/organizers');
          const userOrganizer = organizersRes.data.find(org => org.user_id === user.id);
          if (userOrganizer) {
            organizerId = userOrganizer.id;
          }
        } catch (e) {
          console.error('Could not fetch organizers for tickets:', e);
        }
      }
      
      const res = await api.get(`/events?organizer_id=${organizerId}`);
      setEvents(res.data);
    } catch (e) {
      console.error('Error fetching events for tickets:', e);
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
    setForm({ eventId: '', name: '', quantity: '' });
    setCalculatedPrice(null);
    setShowModal(true);
  };

  const handlePriceCalculated = (calculation) => {
    setCalculatedPrice(calculation);
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    
    if (!calculatedPrice) {
      toast.error('Por favor calcula el precio antes de agregar el ticket');
      return;
    }
    
    setAdding(true);
    
    const ticketData = {
      event_id: form.eventId,
      user_id: user.id,
      name: form.name,
      price: calculatedPrice.final_price,
      quantity: form.quantity,
    };
    
    try {
      await api.post('/tickets', ticketData);
      toast.success('Ticket agregado exitosamente');
      setShowModal(false);
      setForm({ eventId: '', name: '', quantity: '' });
      setCalculatedPrice(null);
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
                     
                     // Si no hay tickets para este evento, mostrar una fila vacía
                     if (eventTickets.length === 0) {
                       return (
                         <tr key={event.id}>
                           <td>{event.title}</td>
                           <td>-</td>
                           <td>0</td>
                           <td>$-</td>
                         </tr>
                       );
                     }
                     
                     // Mostrar cada ticket por separado
                     return eventTickets.map((ticket, ticketIndex) => (
                       <tr key={`${event.id}-${ticket.id || ticketIndex}`}>
                         <td>{event.title}</td>
                         <td>{ticket.name || '-'}</td>
                         <td>{ticket.sold || 0}</td>
                         <td>${ticket.price || '-'}</td>
                       </tr>
                     ));
                   })}
                   
                   {/* Fila de totales */}
                   {(() => {
                     const allTickets = Object.values(ticketsByEvent).flat();
                     const totalSold = allTickets.reduce((acc, t) => acc + (t.sold || 0), 0);
                     const totalRevenue = allTickets.reduce((acc, t) => acc + ((t.sold || 0) * (t.price || 0)), 0);
                     
                                            return (
                         <tr className="table-danger fw-bold">
                           <td><strong>TOTALES</strong></td>
                           <td>-</td>
                           <td><strong>{totalSold}</strong></td>
                           <td><strong>${totalRevenue}</strong></td>
                         </tr>
                       );
                   })()}
                 </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title className="text-white">Agregar Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col lg={7}>
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
                  <Form.Label className="text-white">Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    min={1}
                    required
                  />
                </Form.Group>

                {calculatedPrice && (
                  <div className="alert alert-success mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Precio Calculado:</strong> ${calculatedPrice.final_price.toFixed(2)} MXN
                      </div>
                      <div>
                        <small>Organizador recibe: ${calculatedPrice.organizer_amount.toFixed(2)} MXN</small>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" variant="primary" disabled={adding || !calculatedPrice}>
                  {adding ? 'Agregando...' : 'Agregar Ticket'}
                </Button>
              </Form>
            </Col>
            
            <Col lg={5}>
              <PriceCalculator 
                onPriceCalculated={handlePriceCalculated}
                className="border-0"
              />
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default OrganizerTicketsPage; 