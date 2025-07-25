import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Ticket, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Eye,
  DollarSign
} from 'lucide-react';
import { getRecentActivity, getOrganizerRecentActivity, getClientRecentActivity } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "primary" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="h-100 border-0 shadow-sm bg-white">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1 text-secondary">{title}</h6>
            <h3 className="fw-bold mb-2 text-dark">{value}</h3>
            {trend && (
              <div className="d-flex align-items-center">
                {trend === 'up' ? (
                  <TrendingUp size={16} className="text-success me-1" />
                ) : (
                  <TrendingDown size={16} className="text-danger me-1" />
                )}
                <small className={`text-${trend === 'up' ? 'success' : 'danger'}`}>{trendValue}</small>
              </div>
            )}
          </div>
          <div className={`bg-${color} bg-opacity-10 p-3 rounded`}>
            <Icon size={24} className={`text-${color}`} />
          </div>
        </div>
      </Card.Body>
    </Card>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, onClick, variant = "primary" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card 
      className="h-100 border-0 shadow-sm bg-white cursor-pointer" 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body className="text-center p-4">
        <div className={`bg-${variant} bg-opacity-10 p-3 rounded-circle d-inline-block mb-3`}>
          <Icon size={32} className={`text-${variant}`} />
        </div>
        <h6 className="fw-semibold mb-2 text-dark">{title}</h6>
        <p className="text-secondary small mb-0">{description}</p>
      </Card.Body>
    </Card>
  </motion.div>
);

const RecentActivityCard = ({ activities }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border-0 shadow-sm bg-white">
      <Card.Header className="bg-transparent border-0">
        <h6 className="fw-semibold mb-0 text-dark">Actividad Reciente</h6>
      </Card.Header>
      <Card.Body className="p-0">
        {activities.map((activity, index) => (
          <div key={index} className="d-flex align-items-center p-3 border-bottom border-light">
            <div className={`bg-${activity.color} bg-opacity-10 p-2 rounded-circle me-3`}>
              <activity.icon size={16} className={`text-${activity.color}`} />
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold small text-dark">{activity.title}</div>
              <div className="text-secondary small">{activity.description}</div>
            </div>
            <small className="text-muted">{activity.time}</small>
          </div>
        ))}
      </Card.Body>
    </Card>
  </motion.div>
);

export default function DashboardWidgets({ userRole, stats = {}, onQuickActionClick }) {
  const [recentActivity, setRecentActivity] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (userRole === 'superadmin') {
      getRecentActivity().then(setRecentActivity);
    } else if (userRole === 'organizer' && user?.id) {
      getOrganizerRecentActivity(user.id).then(setRecentActivity);
    } else if (userRole === 'client' && user?.id) {
      getClientRecentActivity(user.id).then(setRecentActivity);
    }
  }, [userRole, user]);

  const getStatsForRole = () => {
    if (userRole === 'superadmin') {
      return [
        {
          title: "Total Usuarios",
          value: stats.total_users || "1,234",
          icon: Users,
          trend: "up",
          trendValue: "+12%",
          color: "primary"
        },
        {
          title: "Eventos Activos",
          value: stats.active_events || "56",
          icon: Calendar,
          trend: "up",
          trendValue: "+8%",
          color: "success"
        },
        {
          title: "Tickets Vendidos",
          value: stats.tickets_sold || "8,901",
          icon: Ticket,
          trend: "up",
          trendValue: "+15%",
          color: "warning"
        },
        {
          title: "Ingresos Totales",
          value: `$${stats.total_revenue || "45,678"}`,
          icon: DollarSign,
          trend: "up",
          trendValue: "+23%",
          color: "info"
        }
      ];
    } else if (userRole === 'organizer') {
      return [
        {
          title: "Mis Eventos",
          value: stats.myEvents || "12",
          icon: Calendar,
          trend: "up",
          trendValue: "+2",
          color: "primary"
        },
        {
          title: "Tickets Vendidos",
          value: stats.myTickets || "1,234",
          icon: Ticket,
          trend: "up",
          trendValue: "+18%",
          color: "success"
        },
        {
          title: "Ingresos",
          value: `$${stats.myRevenue || "12,345"}`,
          icon: DollarSign,
          trend: "up",
          trendValue: "+25%",
          color: "warning"
        },
        {
          title: "Vistas",
          value: stats.views || "5,678",
          icon: Eye,
          trend: "up",
          trendValue: "+12%",
          color: "info"
        }
      ];
    } else {
      return [
        {
          title: "Total de Tickets",
          value: stats.total_tickets || "0",
          icon: Ticket,
          trend: "up",
          trendValue: "+2",
          color: "primary"
        },
        {
          title: "Eventos Únicos",
          value: stats.unique_events || "0",
          icon: Calendar,
          trend: "up",
          trendValue: "+1",
          color: "success"
        },
        {
          title: "Total Gastado",
          value: `$${stats.total_spent || "0"}`,
          icon: CreditCard,
          trend: "up",
          trendValue: "+15%",
          color: "warning"
        },
        {
          title: "Tickets Recientes",
          value: stats.recent_tickets || "0",
          icon: TrendingUp,
          trend: "up",
          trendValue: "28 días",
          color: "info"
        }
      ];
    }
  };

  const getQuickActions = () => {
    if (userRole === 'superadmin') {
      return [
        {
          title: "Crear Organizador",
          description: "Agregar nuevo organizador",
          icon: Users,
          variant: "primary"
        },
        {
          title: "Ver Eventos",
          description: "Gestionar todos los eventos",
          icon: Calendar,
          variant: "success"
        },
        {
          title: "Reportes",
          description: "Ver estadísticas generales",
          icon: TrendingUp,
          variant: "info"
        }
      ];
    } else if (userRole === 'organizer') {
      return [
        {
          title: "Crear Evento",
          description: "Publicar nuevo evento",
          icon: Calendar,
          variant: "primary"
        },
        {
          title: "Mis Tickets",
          description: "Ver ventas de tickets",
          icon: Ticket,
          variant: "success"
        },
        {
          title: "Estadísticas",
          description: "Ver métricas de eventos",
          icon: TrendingUp,
          variant: "info"
        }
      ];
    } else {
      return [
        {
          title: "Buscar Eventos",
          description: "Encontrar eventos",
          icon: Calendar,
          variant: "primary"
        },
        {
          title: "Mis Tickets",
          description: "Ver tickets comprados",
          icon: Ticket,
          variant: "success"
        },
        {
          title: "Historial",
          description: "Ver eventos asistidos",
          icon: Eye,
          variant: "info"
        }
      ];
    }
  };

  const getRecentActivities = (data) => {
    if (userRole === 'superadmin' && data) {
      // Mezclar y ordenar por fecha las actividades
      const activities = [];
      data.users.forEach(u => activities.push({
        title: 'Nuevo usuario registrado',
        description: `${u.name} (${u.email})`,
        time: new Date(u.created_at).toLocaleString(),
        icon: Users,
        color: 'primary'
      }));
      data.tickets.forEach(t => activities.push({
        title: 'Venta de ticket',
        description: `${t.user_name} compró ${t.quantity} x ${t.ticket_name} para ${t.event_title}`,
        time: new Date(t.created_at).toLocaleString(),
        icon: Ticket,
        color: 'success'
      }));
      data.events.forEach(e => activities.push({
        title: 'Nuevo evento creado',
        description: `${e.title}`,
        time: new Date(e.created_at).toLocaleString(),
        icon: Calendar,
        color: 'info'
      }));
      // Ordenar por fecha descendente
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      return activities.slice(0, 5);
    } else if (userRole === 'organizer' && data) {
      // Datos reales del organizador
      const activities = [];
      
      // Tickets vendidos recientemente
      data.tickets.forEach(t => activities.push({
        title: 'Ticket vendido',
        description: `${t.user_name} compró ${t.quantity} x ${t.ticket_name} para ${t.event_title}`,
        time: new Date(t.created_at).toLocaleString(),
        icon: Ticket,
        color: 'success'
      }));
      
      // Eventos creados recientemente
      data.events.forEach(e => activities.push({
        title: e.is_published ? 'Evento publicado' : 'Evento creado',
        description: `${e.title}`,
        time: new Date(e.created_at).toLocaleString(),
        icon: Calendar,
        color: 'primary'
      }));
      
      // Eventos actualizados recientemente
      data.updated_events.forEach(e => activities.push({
        title: 'Evento actualizado',
        description: `${e.title}`,
        time: new Date(e.updated_at).toLocaleString(),
        icon: Calendar,
        color: 'info'
      }));
      
      // Ordenar por fecha descendente
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      return activities.slice(0, 5);
    } else if (userRole === 'client' && data) {
      // Actividades del cliente
      const activities = [];
      
      data.purchases.forEach(p => activities.push({
        title: 'Ticket comprado',
        description: `${p.quantity} x ${p.ticket_name} para ${p.event_title}`,
        time: new Date(p.created_at).toLocaleString(),
        icon: Ticket,
        color: 'success'
      }));
      
      return activities.slice(0, 5);
    } else {
      return [
        {
          title: "Ticket comprado",
          description: "Concierto de Rock - Asiento A12",
          time: "1 hora",
          icon: Ticket,
          color: "success"
        },
        {
          title: "Evento asistido",
          description: "Teatro Municipal - Comedia",
          time: "2 días",
          icon: Calendar,
          color: "primary"
        },
        {
          title: "Reseña enviada",
          description: "5 estrellas para Concierto de Jazz",
          time: "3 días",
          icon: Eye,
          color: "warning"
        }
      ];
    }
  };

  const statCards = getStatsForRole();
  const quickActions = getQuickActions();
  const activities = recentActivity ? getRecentActivities(recentActivity) : getRecentActivities();

  // Al inicio del componente DashboardWidgets
  console.log("DashboardWidgets props:", { userRole, stats });

  return (
    <div style={{ background: 'yellow', color: 'black', padding: 40 }}>
      <h1>PRUEBA DE RENDER</h1>
      <pre>{JSON.stringify({ userRole, stats }, null, 2)}</pre>
    </div>
  );
} 