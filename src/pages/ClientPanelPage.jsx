import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, Row, Col, Table, Spinner, Button, Nav, Badge } from 'react-bootstrap';
import { User, ShoppingCart, LogOut, Home, Ticket, Calendar } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import DashboardWidgets from '../components/DashboardWidgets';

export default function ClientPanelPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarKeys = ['dashboard', 'purchases', 'tickets', 'events', 'profile'];
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('clientPanelActiveTab');
    return sidebarKeys.includes(saved) ? saved : 'dashboard';
  });
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  // Guardar la pestaña seleccionada en localStorage
  const handleTabSelect = (tab) => {
    if (!tab) return;
    setActiveTab(tab);
    localStorage.setItem('clientPanelActiveTab', tab);
  };

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ticket-purchases?user_id=${user.id}`);
        setPurchases(res.data);
      } catch (e) {
        setPurchases([]);
      }
      setLoading(false);
    };
    if (user) {
      fetchPurchases();
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Aquí puedes ajustar la ruta para obtener estadísticas del cliente
      const res = await api.get(`/client-stats?user_id=${user.id}`);
      setStats(res.data);
    } catch (e) {
      setStats({});
    }
  };

  if (!user) return null;

  // Obtener tickets planos (uno por cada ticket comprado)
  const tickets = purchases.flatMap(p => {
    // Si hay un array de tickets, usarlo, si no, usar el propio purchase
    if (Array.isArray(p.tickets)) {
      return p.tickets.map(t => ({ ...t, event_title: p.event_title, purchase_date: p.created_at, status: p.status }));
    }
    return [{
      id: p.ticket_id,
      name: p.ticket_name,
      event_title: p.event_title,
      qr_code: p.qr_code,
      status: p.status,
      created_at: p.created_at,
      quantity: p.quantity,
      amount: p.amount
    }];
  });

  // Obtener eventos únicos donde el usuario ha comprado tickets
  const uniqueEvents = Array.from(
    purchases.reduce((map, p) => {
      if (!map.has(p.event_id)) {
        map.set(p.event_id, {
          id: p.event_id,
          title: p.event_title,
          date: p.event_date || p.created_at,
          location: p.event_location || '',
          tickets: [],
        });
      }
      map.get(p.event_id).tickets.push(p);
      return map;
    }, new Map()).values()
  );

  // Sidebar navigation items
  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={18} className="me-2" /> },
    { key: 'purchases', label: 'Mis Compras', icon: <ShoppingCart size={18} className="me-2" /> },
    { key: 'tickets', label: 'Mis Tickets', icon: <Ticket size={18} className="me-2" /> },
    { key: 'events', label: 'Mis Eventos', icon: <Calendar size={18} className="me-2" /> },
    { key: 'profile', label: 'Perfil', icon: <User size={18} className="me-2" /> },
  ];

  console.log('activeTab:', activeTab);

  return (
    <Layout
      sidebar={
        <>
          <div className="d-flex flex-column align-items-center py-4">
            <img src="/Domkard-White.png" alt="Logo" style={{ width: 90, marginBottom: 24 }} />
            <div className="mb-4 text-center">
              <div className="fw-bold" style={{ color: '#e50914', fontSize: 18 }}>{user.name}</div>
              <div className="text-muted" style={{ fontSize: 14 }}>{user.email}</div>
            </div>
            <Nav variant="pills" className="flex-column w-100 mb-4" activeKey={activeTab} onSelect={handleTabSelect}>
              {sidebarItems.map(item => (
                <Nav.Link
                  key={item.key}
                  eventKey={item.key}
                  className="d-flex align-items-center mb-2 px-3"
                  style={{ fontWeight: 500, fontSize: 16 }}
                >
                  {item.icon} {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="mt-auto w-100">
              <LogoutButton className="w-100" />
            </div>
          </div>
        </>
      }
      sidebarWidth={260}
      bg="dark"
    >
      <div className="container-fluid py-4">
        <h2 className="text-white mb-4">Panel del Cliente</h2>
        <DashboardWidgets userRole={user?.role} stats={stats} />
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold" style={{ color: '#e50914' }}>Panel de Cliente</h2>
            <div className="text-muted">Bienvenido, aquí puedes ver tu perfil y tus compras de tickets.</div>
          </Col>
        </Row>
        {/* Tabs Content */}
        {activeTab === 'dashboard' && (
          <Row className="g-4">
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Mi perfil</h5>
                  <div className="mb-2"><b>Nombre:</b> {user.name}</div>
                  <div className="mb-2"><b>Email:</b> {user.email}</div>
                  <div className="mb-2"><b>Rol:</b> {user.role}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Resumen de compras</h5>
                  <div className="mb-2"><b>Total de compras:</b> {purchases.length}</div>
                  <div className="mb-2"><b>Última compra:</b> {purchases[0] ? new Date(purchases[0].created_at).toLocaleString() : 'N/A'}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        {activeTab === 'purchases' && (
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Mis compras</h5>
              {loading ? (
                <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
              ) : purchases.length === 0 ? (
                <div className="text-center text-muted py-4">No tienes compras registradas.</div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover variant="dark" className="rounded">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Ticket</th>
                        <th>Cantidad</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map(p => (
                        <tr key={p.id}>
                          <td>{p.event_title || p.event_id}</td>
                          <td>{p.ticket_name || p.ticket_id}</td>
                          <td>{p.quantity}</td>
                          <td>${parseFloat(p.amount).toFixed(2)}</td>
                          <td>{new Date(p.created_at).toLocaleString()}</td>
                          <td>{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        {activeTab === 'tickets' && (
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Mis tickets</h5>
              {loading ? (
                <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
              ) : tickets.length === 0 ? (
                <div className="text-center text-muted py-4">No tienes tickets registrados.</div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover variant="dark" className="rounded">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>QR</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t, idx) => (
                        <tr key={t.id || idx}>
                          <td>{t.event_title}</td>
                          <td>{t.name || t.ticket_name}</td>
                          <td>{t.quantity || 1}</td>
                          <td>
                            {t.qr_code ? (
                              <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.qr_code}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={t.status === 'pagado' || t.status === 'usado' ? 'success' : 'secondary'}>
                              {t.status}
                            </Badge>
                          </td>
                          <td>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        {activeTab === 'events' && (
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Mis eventos</h5>
              {loading ? (
                <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
              ) : uniqueEvents.length === 0 ? (
                <div className="text-center text-muted py-4">No tienes eventos registrados.</div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover variant="dark" className="rounded">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Fecha</th>
                        <th>Ubicación</th>
                        <th>Tickets comprados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueEvents.map(ev => (
                        <tr key={ev.id}>
                          <td>{ev.title}</td>
                          <td>{ev.date ? new Date(ev.date).toLocaleDateString() : '-'}</td>
                          <td>{ev.location}</td>
                          <td>{ev.tickets.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        {activeTab === 'profile' && (
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Mi perfil</h5>
              <div className="mb-2"><b>Nombre:</b> {user.name}</div>
              <div className="mb-2"><b>Email:</b> {user.email}</div>
              <div className="mb-2"><b>Rol:</b> {user.role}</div>
            </Card.Body>
          </Card>
        )}
      </div>
    </Layout>
  );
} 