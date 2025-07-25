import React, { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  House, 
  Users, 
  Calendar, 
  Ticket, 
  CreditCard, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children, title = "Events Domkard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'superadmin') {
      return [
        { path: '/', label: 'Dashboard', icon: House },
        { path: '/users', label: 'Usuarios', icon: Users },
        { path: '/organizers', label: 'Organizadores', icon: Users },
        { path: '/events', label: 'Eventos', icon: Calendar },
        { path: '/tickets', label: 'Tickets', icon: Ticket },
        { path: '/credits', label: 'Créditos', icon: CreditCard },
      ];
    } else if (user?.role === 'organizer') {
      return [
        { path: '/organizer-panel', label: 'Dashboard', icon: House },
        { path: '/organizer-panel/events', label: 'Mis Eventos', icon: Calendar },
        { path: '/organizer-panel/tickets', label: 'Tickets', icon: Ticket },
        { path: '/organizer-panel/stats', label: 'Estadísticas', icon: BarChart3 },
      ];
    } else {
      return [
        { path: '/client-panel', label: 'Dashboard', icon: House },
        { path: '/client-panel/tickets', label: 'Mis Tickets', icon: Ticket },
        { path: '/client-panel/events', label: 'Eventos', icon: Calendar },
      ];
    }
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <div className="d-flex flex-column h-100">
      <Nav className="flex-column flex-grow-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Nav.Link
              key={item.path}
              as="button"
              className={`d-flex align-items-center mb-2 px-3 py-2 rounded ${
                isActive ? 'bg-primary text-white' : 'text-secondary'
              }`}
              onClick={() => {
                navigate(item.path);
                setShowSidebar(false);
              }}
            >
              <Icon size={20} className="me-2" />
              {item.label}
            </Nav.Link>
          );
        })}
      </Nav>
      <div className="p-3 border-top border-secondary">
        <div className="d-flex align-items-center mb-2">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
               style={{ width: 32, height: 32 }}>
            <span className="text-white fw-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <div className="text-white fw-semibold">{user?.name || 'Usuario'}</div>
            <small className="text-secondary">{user?.role || 'Cliente'}</small>
          </div>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          className="w-100"
          onClick={handleLogout}
        >
          <LogOut size={16} className="me-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="d-flex">
      {/* Sidebar for desktop */}
      <div className="d-none d-lg-block" style={{ width: 280, minHeight: '100vh' }}>
        <div className="bg-dark h-100 border-end border-secondary">
          <div className="p-3 border-bottom border-secondary">
            <div className="d-flex align-items-center">
              <img
                src="/Domkard-White.png"
                alt="Logo"
                style={{ width: 40, height: 'auto' }}
                className="me-2"
              />
              <span className="fw-bold" style={{ color: '#D31336' }}>Events Domkard</span>
            </div>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        {/* Top navbar */}
        <Navbar bg="dark" variant="dark" className="border-bottom border-secondary">
          <Container fluid>
            <Button
              variant="outline-secondary"
              className="d-lg-none me-2"
              onClick={() => setShowSidebar(true)}
            >
              <Menu size={20} />
            </Button>
            
            <Navbar.Brand className="d-flex align-items-center">
              <img
                src="/Domkard-White.png"
                alt="Logo"
                style={{ width: 32, height: 'auto' }}
                className="me-2"
              />
              <span className="fw-bold" style={{ color: '#D31336' }}>{title}</span>
            </Navbar.Brand>
            
            <div className="ms-auto d-flex align-items-center">
              <div className="d-none d-md-block me-3">
                <small className="text-secondary">Bienvenido,</small>
                <div className="text-white fw-semibold">{user?.name || 'Usuario'}</div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogout}
                className="d-none d-md-block"
              >
                <LogOut size={16} className="me-1" />
                Salir
              </Button>
            </div>
          </Container>
        </Navbar>

        {/* Main content area */}
        <div className="p-4">
          <div className="fade-in">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="start"
        className="bg-dark"
      >
        <Offcanvas.Header closeButton className="border-bottom border-secondary">
          <Offcanvas.Title className="text-white">
            <div className="d-flex align-items-center">
              <img
                src="/Domkard-White.png"
                alt="Logo"
                style={{ width: 32, height: 'auto' }}
                className="me-2"
              />
              <span className="fw-bold" style={{ color: '#D31336' }}>Events Domkard</span>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Layout; 