import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Nav, Tab, Table, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardWidgets from '../components/DashboardWidgets';
import DataTable from '../components/DataTable';
import ModernForm from '../components/ModernForm';
import ModernModal, { ConfirmModal } from '../components/ModernModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  BarChart3, 
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Ticket
} from 'lucide-react';

export default function OrganizerPanelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ticketsByEvent, setTicketsByEvent] = useState({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [ticketForm, setTicketForm] = useState({ eventId: '', name: '', price: '', quantity: '' });
  const [addingTicket, setAddingTicket] = useState(false);
  const [stats, setStats] = useState({});
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditError, setCreditError] = useState(null);
  const [creditMethod, setCreditMethod] = useState(null);

  // Sidebar y menú horizontal unificados
  const tabItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <span className="me-2">📊</span> },
    { key: 'events', label: 'Mis Eventos', icon: <Calendar size={16} className="me-2" /> },
    { key: 'tickets', label: 'Mis Tickets', icon: <Ticket size={16} className="me-2" /> },
    { key: 'addTicket', label: 'Agregar Ticket', icon: <Plus size={16} className="me-2" /> },
    { key: 'create', label: 'Crear Evento', icon: <Plus size={16} className="me-2" /> },
  ];

  // Obtener créditos y eventos del organizador
  const fetchCredits = async () => {
    try {
      const res = await api.get(`/credits?organizer_id=${user.id}`);
      const total = res.data.reduce((acc, c) => acc + (c.amount - (c.used || 0)), 0);
      setCredits(total);
    } catch (e) {
      setCredits(0);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get(`/events?organizer_id=${user.id}`);
      setEvents(res.data);
    } catch (e) {
      setEvents([]);
    }
  };

  const fetchTickets = async eventId => {
    try {
      const res = await api.get(`/tickets?event_id=${eventId}`);
      setTicketsByEvent(prev => ({ ...prev, [eventId]: res.data }));
    } catch (e) {
      setTicketsByEvent(prev => ({ ...prev, [eventId]: [] }));
    }
  };

  // Obtener estadísticas reales del organizador
  const fetchStats = async () => {
    try {
      const res = await api.get(`/organizer-stats?organizer_id=${user.id}`);
      setStats({
        myEvents: res.data.total_events,
        myTickets: res.data.tickets_sold_28d,
        myRevenue: res.data.revenue,
        views: res.data.views,
      });
    } catch (e) {
      setStats({});
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'organizer' && user.role !== 'superadmin')) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchCredits();
      fetchEvents();
      fetchStats();
    }
  }, [user]);

  // Cargar tickets cuando se activa la pestaña de tickets
  useEffect(() => {
    if (activeTab === 'tickets' && events.length > 0) {
      events.forEach(event => {
        if (!ticketsByEvent[event.id]) {
          fetchTickets(event.id);
        }
      });
    }
  }, [activeTab, events]);

  const handleEventCreated = () => {
    toast.success('¡Evento creado exitosamente!');
    fetchEvents();
    fetchCredits();
    setShowEventForm(false);
  };

  const handleBuyCredit = async () => {
    setLoading(true);
    try {
      await api.post('/credits', { 
        organizer_id: user.id, 
        amount: 1, 
        used: 0, 
        description: 'Compra simulada' 
      });
      fetchCredits();
      toast.success('Crédito comprado exitosamente');
    } catch (e) {
      toast.error('Error al comprar crédito');
    }
    setLoading(false);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setLoading(true);
    try {
      await api.delete(`/events/${eventToDelete.id}`);
      fetchEvents();
      toast.success('Evento eliminado exitosamente');
    } catch (err) {
      toast.error('Error al eliminar evento');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const handleShareEvent = (event) => {
    const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
    const url = `${window.location.origin}/event/${organizerSubdomain}/${event.id}`;
    navigator.clipboard.writeText(url);
    toast.success('¡Link copiado al portapapeles!');
  };

  const handleViewStats = (event) => {
    const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
    navigate(`/event/${organizerSubdomain}/${event.id}/stats`);
  };

  const handleTicketCreated = (eventId) => {
    fetchTickets(eventId);
    toast.success('Ticket creado exitosamente');
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    setAddingTicket(true);
    try {
      await api.post('/tickets', {
        event_id: ticketForm.eventId,
        user_id: user.id,
        name: ticketForm.name,
        price: ticketForm.price,
        quantity: ticketForm.quantity,
      });
      toast.success('Ticket agregado exitosamente');
      setTicketForm({ eventId: '', name: '', price: '', quantity: '' });
      fetchTickets(ticketForm.eventId);
    } catch (err) {
      toast.error('Error al agregar ticket');
    } finally {
      setAddingTicket(false);
    }
  };

  const handleOpenCreditModal = () => {
    setShowCreditModal(true);
    setCreditAmount(1);
    setCreditError(null);
    setCreditMethod(null);
  };
  const handleCloseCreditModal = () => {
    setShowCreditModal(false);
    setCreditError(null);
    setCreditMethod(null);
  };
  const handleStartCreditPayment = async (method) => {
    setCreditLoading(true);
    setCreditError(null);
    setCreditMethod(method);
    try {
      if (method === 'stripe') {
        const res = await api.post('/stripe/credit-session', {
          organizer_id: user.id,
          amount: creditAmount,
          user_id: user.id,
        });
        window.location.href = res.data.url;
      } else if (method === 'mercadopago') {
        const res = await api.post('/mercadopago/credit-preference', {
          organizer_id: user.id,
          amount: creditAmount,
          user_id: user.id,
        });
        window.location.href = res.data.init_point;
      }
    } catch (err) {
      setCreditError('Error al iniciar el pago. Intenta de nuevo.');
    }
    setCreditLoading(false);
  };

  // Configuración de la tabla de eventos
  const eventColumns = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      filterable: true
    },
    {
      key: 'location',
      label: 'Ubicación',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="d-flex align-items-center text-white">
          <MapPin size={16} className="me-2 text-muted" />
          {value}
        </div>
      )
    },
    {
      key: 'start_date',
      label: 'Fecha de Inicio',
      sortable: true,
      type: 'date',
      render: (value) => (
        <div className="d-flex align-items-center text-white">
          <Clock size={16} className="me-2 text-muted" />
          {new Date(value).toLocaleDateString()}
      </div>
      )
    },
    {
      key: 'is_published',
      label: 'Estado',
      sortable: true,
      type: 'status',
      render: (value) => (
        <Badge bg={value ? 'success' : 'warning'}>
          {value ? 'Publicado' : 'Borrador'}
        </Badge>
      )
    },
    {
      key: 'tickets_sold',
      label: 'Tickets Vendidos',
      sortable: true,
      render: (value, event) => {
        const tickets = ticketsByEvent[event.id] || [];
        const sold = tickets.reduce((acc, t) => acc + (t.sold || 0), 0);
        return (
          <div className="d-flex align-items-center text-white">
            <Users size={16} className="me-2 text-muted" />
            {sold}
          </div>
        );
      }
    }
  ];

  // Configuración del formulario de evento
  const eventFormFields = [
    {
      name: 'title',
      label: 'Título del Evento',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el título del evento'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Describe tu evento'
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      required: true,
      placeholder: 'Dirección del evento'
    },
    {
      name: 'start_date',
      label: 'Fecha y Hora de Inicio',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'end_date',
      label: 'Fecha y Hora de Fin',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'is_published',
      label: 'Publicar Evento',
      type: 'checkbox'
    },
    {
      name: 'main_image',
      label: 'Imagen del Evento',
      type: 'file',
      required: false,
      helpText: 'Opcional. Sube una imagen para el evento (JPG, PNG, etc.)'
    }
  ];

  const renderDashboard = () => (
    <DashboardWidgets 
      userRole={user?.role} 
      stats={stats}
    />
  );

  const renderEventsList = () => (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h5 className="fw-bold mb-0 me-3">Créditos disponibles: <span className="text-success">{credits}</span></h5>
        <Button variant="outline-primary" onClick={handleOpenCreditModal} className="ms-2">Recargar créditos</Button>
      </div>
      {/* Modal de recarga de créditos */}
      <Modal show={showCreditModal} onHide={handleCloseCreditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recargar créditos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad de créditos</Form.Label>
            <Form.Control type="number" min={1} value={creditAmount} onChange={e => setCreditAmount(Number(e.target.value))} disabled={creditLoading} />
          </Form.Group>
          <div className="d-flex flex-column gap-2">
            <Button variant="primary" size="lg" disabled={creditLoading} onClick={() => handleStartCreditPayment('stripe')}>Pagar con Stripe</Button>
            <Button style={{ background: '#00b1ea', border: 'none' }} size="lg" disabled={creditLoading} onClick={() => handleStartCreditPayment('mercadopago')}>Pagar con MercadoPago</Button>
          </div>
          {creditError && <div className="text-danger mt-3">{creditError}</div>}
        </Modal.Body>
      </Modal>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-semibold mb-0">Mis Eventos</h5>
        {credits > 0 && (
          <Button 
            variant="primary" 
            onClick={() => setShowEventForm(true)}
            className="d-flex align-items-center"
          >
            <Plus size={16} className="me-2" />
            Crear Evento
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Calendar size={48} className="text-muted mb-3" />
            <h6 className="text-muted">No tienes eventos creados</h6>
      {credits > 0 && (
              <Button 
                variant="primary" 
                onClick={() => setShowEventForm(true)}
                className="mt-3"
              >
                Crear mi primer evento
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <DataTable
          data={events}
          columns={eventColumns}
          title="Mis Eventos"
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onView={(event) => {
            const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
            navigate(`/event/${organizerSubdomain}/${event.id}`);
          }}
          onStats={handleViewStats}
          searchable={true}
          filterable={true}
          pagination={true}
          itemsPerPage={5}
        />
      )}
    </div>
  );

  const renderEventForm = () => (
    <ModernForm
      fields={eventFormFields}
      initialData={editingEvent || {}}
      title={editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
      submitText={editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
      cancelText="Cancelar"
      onSubmit={async (formData) => {
        setLoading(true);
        try {
          // Crear FormData si hay archivos
          const hasFiles = formData.main_image instanceof File;
          let dataToSend;
          
          if (hasFiles) {
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
              if (key === 'main_image' && formData[key] instanceof File) {
                formDataObj.append('main_image', formData[key]);
              } else if (key !== 'main_image') {
                formDataObj.append(key, formData[key]);
              }
            });
            formDataObj.append('organizer_id', user.id);
            dataToSend = formDataObj;
          } else {
            dataToSend = { ...formData, organizer_id: user.id };
          }

          if (editingEvent) {
            await api.put(`/events/${editingEvent.id}`, dataToSend);
            toast.success('Evento actualizado exitosamente');
          } else {
            await api.post('/events', dataToSend);
            toast.success('Evento creado exitosamente');
          }
          fetchEvents();
          fetchCredits();
          setShowEventForm(false);
          setEditingEvent(null);
        } catch (err) {
          console.error('Error al guardar evento:', err);
          toast.error('Error al guardar evento');
        } finally {
          setLoading(false);
        }
      }}
      onCancel={() => {
        setShowEventForm(false);
        setEditingEvent(null);
      }}
      loading={loading}
      layout="grid"
    />
  );

  // Renderizado de la pestaña 'Mis Tickets'
  const renderTicketsList = () => {
    // Verificar si hay eventos
    if (events.length === 0) {
      return (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Mis Tickets Vendidos</h5>
            <div className="text-center text-muted py-4">No hay eventos creados.</div>
          </Card.Body>
        </Card>
      );
    }

    // Verificar si los tickets están cargando
    const isLoadingTickets = events.some(event => !ticketsByEvent[event.id]);

    return (
      <Card className="shadow-sm border-0 mt-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Mis Tickets Vendidos</h5>
          {loading || isLoadingTickets ? (
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
    );
  };

  const renderAddTicketForm = () => (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body>
        <h5 className="fw-bold mb-3">Agregar Ticket a un Evento</h5>
        <form onSubmit={handleAddTicket}>
          <div className="mb-3">
            <label className="form-label">Evento</label>
            <select
              className="form-select"
              value={ticketForm.eventId}
              onChange={e => setTicketForm(f => ({ ...f, eventId: e.target.value }))}
              required
            >
              <option value="">Selecciona un evento</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre del Ticket</label>
                    <input
                      type="text"
              className="form-control text-white"
              value={ticketForm.name}
              onChange={e => setTicketForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Precio</label>
                    <input
              type="number"
              className="form-control text-white"
              value={ticketForm.price}
              onChange={e => setTicketForm(f => ({ ...f, price: e.target.value }))}
              min={0}
              step={0.01}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Cantidad</label>
                    <input
              type="number"
              className="form-control text-white"
              value={ticketForm.quantity}
              onChange={e => setTicketForm(f => ({ ...f, quantity: e.target.value }))}
              min={1}
              required
            />
          </div>
          <Button type="submit" variant="primary" disabled={addingTicket}>
            {addingTicket ? 'Agregando...' : 'Agregar Ticket'}
          </Button>
        </form>
      </Card.Body>
    </Card>
  );

  return (
    <Layout title="Panel de Organizador">
      <Container fluid>
        {/* Header de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Card className="border-0 bg-gradient-primary text-white">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col>
                  <h2 className="fw-bold mb-2">¡Bienvenido, {user?.name}!</h2>
                  <p className="mb-0 opacity-75">
                    Gestiona tus eventos y tickets desde este panel.
                  </p>
                </Col>
                <Col xs="auto">
                  <div className="bg-white bg-opacity-20 p-3 rounded-circle">
                    <CreditCard size={32} />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>
        <Outlet />
      </Container>
    </Layout>
  );
} 