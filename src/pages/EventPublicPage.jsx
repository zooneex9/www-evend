import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import MercadoPagoCardForm from "../components/MercadoPagoCardForm";
import { Container, Row, Col, Card, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { PersonCircle, Cart3 } from 'react-bootstrap-icons';

export default function EventPublicPage() {
  const { organizerSubdomain, eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data);
      } catch (e) {
        setError('No se pudo cargar el evento');
      }
      setLoading(false);
    };
    const fetchTickets = async () => {
      try {
        const res = await api.get(`/tickets?event_id=${eventId}`);
        setTickets(res.data);
      } catch (e) {
        setTickets([]);
      }
    };
    fetchEvent();
    fetchTickets();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      console.log('main_image:', event.main_image);
    }
  }, [event]);

  const handleUserIconClick = () => {
    if (!user) return navigate('/login');
    if (user.role === 'organizer') {
      navigate('/organizer-panel');
    } else {
      navigate('/client-panel');
    }
  };

  const handleQuantityChange = (ticketId, value, max) => {
    let val = parseInt(value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > max) val = max;
    setSelectedQuantities(prev => ({ ...prev, [ticketId]: val }));
  };

  const handleBuy = (ticket) => {
    setSelectedTicket(ticket);
    setShowPaymentModal(true);
  };

  // Calcular el monto total del ticket seleccionado
  const getTotalAmount = () => {
    if (!selectedTicket) return 0;
    const quantity = selectedQuantities[selectedTicket.id] || 1;
    return selectedTicket.price * quantity;
  };

  const handlePayment = async (method) => {
    if (!selectedTicket) return;
    setProcessing(true);
    const ticketName = `${selectedTicket.name} - ${event.title}`;
    
    try {
      toast('Redirigiendo a ' + (method === 'mercadopago' ? 'Mercado Pago' : 'Stripe') + '...');
      if (method === 'mercadopago') {
        const res = await api.post('/mercadopago/preference', {
          ticket_name: ticketName,
          ticket_price: selectedTicket.price,
          quantity: selectedQuantities[selectedTicket.id] || 1,
        });
        window.location.href = res.data.init_point;
      } else {
        const res = await api.post('/stripe/session', {
          ticket_id: selectedTicket.id,
          ticket_name: ticketName,
          ticket_price: selectedTicket.price,
          quantity: selectedQuantities[selectedTicket.id] || 1,
          event_id: event.id,
          user_id: user?.id || null,
        });
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Error al procesar pago:', err);
      toast.error('Error al iniciar el pago. Intenta de nuevo.');
    }
    setProcessing(false);
  };

  // Ejemplo de función para Stripe (ajusta según tu implementación actual)
  const handleStripePayment = async () => {
    // Aquí va tu lógica actual de Stripe
    handlePayment('stripe');
  };

  const handleTestPayment = async () => {
    if (!selectedTicket) return;
    setProcessing(true);
    try {
      // Simula una compra exitosa y actualiza en el backend
      const res = await api.post('/test/payment', {
        ticket_id: selectedTicket.id,
        quantity: selectedQuantities[selectedTicket.id] || 1,
        event_id: event.id,
        user_id: user?.id || null, // si tienes autenticación
      });
      toast.success('¡Pago de prueba exitoso!');
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setSelectedTicket(null);
      // Opcional: recargar tickets/evento para actualizar estadísticas
      // await fetchEvent();
      // await fetchTickets();
      window.location.reload(); // o recarga los datos de tickets/evento
    } catch (err) {
      toast.error('Error en el pago de prueba');
    }
    setProcessing(false);
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;
  if (!event) return null;

  return (
    <Container className="py-4">
      {/* Logo grande y centrado y cabecera con iconos */}
      <Row className="justify-content-center align-items-center mb-3">
        <Col xs="auto">
          <img src="/Domkard-White.png" alt="Events Domkar" style={{ width: 180, height: 'auto', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 4px 16px #000a)' }} />
        </Col>
        <Col xs="auto" className="d-flex gap-3 align-items-center">
          {/* Icono usuario */}
          <div onClick={handleUserIconClick} style={{ cursor: 'pointer', background: '#222', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0006', border: '2px solid #e50914' }}>
            <PersonCircle size={28} color="#e50914" />
          </div>
          {/* Icono carrito */}
          <div onClick={() => navigate('/cart')} style={{ cursor: 'pointer', background: '#222', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0006', border: '2px solid #e50914' }}>
            <Cart3 size={26} color="#e50914" />
          </div>
        </Col>
      </Row>
      {/* Cabecera evento */}
      <Row className="justify-content-center mb-4">
        <Col md={10} lg={8}>
          <Card className="shadow-lg border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #181818 80%, #e50914 100%)', borderRadius: 18 }}>
            <Card.Body>
              <h1 className="text-center mb-3 fw-bold" style={{ color: '#fff', letterSpacing: 1 }}>{event.title}</h1>
              <div className="mb-3 d-flex flex-wrap justify-content-center gap-2">
                <Badge bg="danger" className="fs-6 px-3 py-2">Organizador: {organizerSubdomain}</Badge>
                <Badge bg="secondary" className="fs-6 px-3 py-2">Ubicación: {event.location}</Badge>
                <Badge bg="info" className="fs-6 px-3 py-2">Inicio: {event.start_date}</Badge>
                <Badge bg="info" className="fs-6 px-3 py-2">Fin: {event.end_date}</Badge>
              </div>
              <div className="mb-3 text-center" style={{ color: '#fff', fontWeight: 500, fontSize: 18 }}>{event.description}</div>
              {event.main_image && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img src={`http://127.0.0.1:8000/storage/${event.main_image}`} alt="Imagen principal" className="img-fluid rounded shadow mb-3" style={{ maxHeight: 320, objectFit: 'cover', border: '4px solid #e50914' }} />
                </div>
              )}
              {event.gallery_images && Array.isArray(JSON.parse(event.gallery_images)) && (
                <Row className="g-2 mb-3 justify-content-center">
                  {JSON.parse(event.gallery_images).map((img, idx) => (
                    <Col xs={6} md={4} key={idx}>
                      <img src="/parrillada.jpg" alt={`Galería ${idx + 1}`} className="img-fluid rounded shadow" style={{ border: '2px solid #e50914' }} />
                    </Col>
                  ))}
                </Row>
              )}
              <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                {event.facebook && (
                  <Button as="a" href={event.facebook} target="_blank" rel="noopener noreferrer" variant="primary" className="d-flex align-items-center gap-2"><i className="bi bi-facebook"></i> Facebook</Button>
                )}
                {event.instagram && (
                  <Button as="a" href={event.instagram} target="_blank" rel="noopener noreferrer" style={{ background: '#E1306C', border: 'none' }} className="d-flex align-items-center gap-2"><i className="bi bi-instagram"></i> Instagram</Button>
                )}
                {event.youtube && (
                  <Button as="a" href={event.youtube} target="_blank" rel="noopener noreferrer" variant="danger" className="d-flex align-items-center gap-2"><i className="bi bi-youtube"></i> YouTube</Button>
                )}
                {event.tiktok && (
                  <Button as="a" href={event.tiktok} target="_blank" rel="noopener noreferrer" style={{ background: '#000', border: 'none' }} className="d-flex align-items-center gap-2"><i className="bi bi-tiktok"></i> TikTok</Button>
                )}
                {event.other && (
                  <Button as="a" href={event.other} target="_blank" rel="noopener noreferrer" variant="secondary" className="d-flex align-items-center gap-2">Otra</Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Tickets disponibles */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow border-0 mb-4" style={{ borderRadius: 18 }}>
            <Card.Body>
              <h2 className="mb-3 fw-bold text-center" style={{ color: '#e50914', fontSize: '1.5rem', letterSpacing: 1 }}>Tickets disponibles</h2>
              {tickets.length === 0 ? (
                <div className="text-center text-muted py-4">No hay tickets disponibles.</div>
              ) : (
                <Row className="g-3">
                  {tickets.map(ticket => (
                    <Col md={6} key={ticket.id}>
                      <Card className="h-100 border-0 bg-white text-dark shadow-lg" style={{ borderRadius: 14, borderLeft: '6px solid #e50914' }}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold fs-5"><i className="bi bi-ticket-perforated me-2"></i>{ticket.name}</span>
                            <Badge bg="danger" className="fs-6">${ticket.price}</Badge>
                          </div>
                          <div className="mb-2">Cantidad disponible: <b>{ticket.quantity}</b></div>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-white">Cantidad:</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              max={ticket.quantity}
                              value={selectedQuantities[ticket.id] || 1}
                              onChange={e => handleQuantityChange(ticket.id, e.target.value, ticket.quantity)}
                              style={{ width: 80 }}
                              disabled={ticket.quantity <= 0 || processing}
                            />
                          </Form.Group>
                          <Button
                            variant="danger"
                            className="w-100 fw-bold shadow"
                            disabled={ticket.quantity <= 0 || processing}
                            onClick={() => handleBuy(ticket)}
                          >
                            Comprar
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Modal de selección de método de pago */}
      {showPaymentModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white text-dark">
              <div className="modal-header border-0">
                <h5 className="modal-title">Selecciona método de pago</h5>
                <Button variant="secondary" onClick={() => { setShowPaymentModal(false); setPaymentMethod(null); setSelectedTicket(null); }}>×</Button>
              </div>
              <div className="modal-body">
                {!paymentMethod ? (
                  <div className="d-flex flex-column gap-3">
                    <Button variant="primary" size="lg" onClick={() => setPaymentMethod('stripe')}>Stripe</Button>
                    <Button style={{ background: '#00b1ea', border: 'none' }} size="lg" onClick={() => setPaymentMethod('mercadopago')}>Mercado Pago</Button>
                    <Button variant="success" size="lg" onClick={handleTestPayment}>Pago de Prueba</Button>
                  </div>
                ) : paymentMethod === 'stripe' ? (
                  <div className="d-flex flex-column gap-3">
                    <h5>Pagar con Stripe</h5>
                    <Button variant="primary" size="lg" onClick={handleStripePayment}>Pagar con Stripe</Button>
                  </div>
                ) : paymentMethod === 'test' ? (
                  <div className="d-flex flex-column gap-3">
                    <h5>Pago de Prueba</h5>
                    <Button variant="success" size="lg" onClick={handleTestPayment}>Simular pago exitoso</Button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    <h5>Pagar con tarjeta (Mercado Pago)</h5>
                    {/* Resumen del ticket */}
                    {selectedTicket && (
                      <Card className="bg-secondary text-white mb-3">
                        <Card.Body>
                          <div><strong>Ticket:</strong> {selectedTicket.name}</div>
                          <div><strong>Cantidad:</strong> {selectedQuantities[selectedTicket.id] || 1}</div>
                          <div><strong>Precio unitario:</strong> ${selectedTicket.price}</div>
                          <div className="mt-2 border-top pt-2"><strong>Total a pagar:</strong> <span style={{ color: '#e50914' }}>${getTotalAmount()}</span></div>
                        </Card.Body>
                      </Card>
                    )}
                    <MercadoPagoCardForm
                      amount={getTotalAmount()}
                      onPaymentResult={(res) => {
                        if (res.error) {
                          toast.error(res.message);
                        } else {
                          toast.success('¡Pago exitoso!');
                          setShowPaymentModal(false);
                          setPaymentMethod(null);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <Button variant="secondary" onClick={() => { setShowPaymentModal(false); setPaymentMethod(null); setSelectedTicket(null); }}>Cerrar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
} 