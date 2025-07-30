import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import OrganizersPage from './OrganizersPage';
import EventsPage from './EventsPage';
import TicketsPage from './TicketsPage';
import CreditsPage from './CreditsPage';
import UsersPage from './UsersPage';
import { useAuth } from '../context/AuthContext';
import { getAdminStats } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';

export default function PanelAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'superadmin' && activeTab === 'dashboard') {
      getAdminStats().then(setAdminStats).catch(() => setAdminStats(null));
    }
  }, [user, activeTab]);

  // Nueva función para manejar las acciones rápidas del superadmin
  const handleQuickActionClick = (actionTitle) => {
    switch (actionTitle) {
      case 'Crear Organizador':
        setActiveTab('organizers');
        break;
      case 'Ver Eventos':
        setActiveTab('events');
        break;
      case 'Reportes':
        // Puedes cambiar la ruta si tienes una página específica de reportes
        setActiveTab('dashboard');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  // Nueva función para renderizar la página según la ruta del sidebar
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onQuickActionClick={handleQuickActionClick} stats={adminStats} />;
      case 'users':
        return <UsersPage />;
      case 'organizers':
        return <OrganizersPage />;
      case 'events':
        return <EventsPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'credits':
        return <CreditsPage />;
      default:
        return <AdminDashboard onQuickActionClick={handleQuickActionClick} />;
    }
  };

  return (
    <Layout title="Panel de Administración">
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
                  <h2 className="fw-bold mb-2">¡Bienvenido, {user?.name || 'Administrador'}!</h2>
                  <p className="mb-0 opacity-75">
                    Gestiona todos los aspectos de la plataforma desde este panel central.
                  </p>
                </Col>
                <Col xs="auto">
                  <div className="bg-white bg-opacity-20 p-3 rounded-circle">
                    <span className="fw-bold fs-4">👋</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>
        {/* Renderizar la página seleccionada desde el sidebar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </Container>
    </Layout>
  );
} 