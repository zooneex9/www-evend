import React, { useEffect, useState } from 'react';
import DashboardWidgets from '../components/DashboardWidgets';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Obtener el organizer_id correcto
        let organizerId = user.id;
        
        // Si el usuario es organizador, buscar su organizer_id
        if (user.role === 'organizer') {
          try {
            const organizersRes = await api.get('/organizers');
            const organizer = organizersRes.data.find(org => org.user_id === user.id);
            if (organizer) {
              organizerId = organizer.id;
            }
          } catch (e) {
            console.error('Error fetching organizer data:', e);
          }
        }

        // Obtener eventos del organizador
        const eventsRes = await api.get(`/events?organizer_id=${organizerId}`);
        const events = eventsRes.data || [];
        
        // Obtener tickets vendidos y compras
        let totalTicketsSold = 0;
        let totalRevenue = 0;
        
        for (const event of events) {
          try {
            // Obtener tickets del evento
            const ticketsRes = await api.get(`/tickets?event_id=${event.id}`);
            const eventTickets = ticketsRes.data || [];
            
            // Obtener compras de tickets para este evento
            const purchasesRes = await api.get(`/ticket-purchases?event_id=${event.id}`);
            const eventPurchases = purchasesRes.data || [];
            
            // Calcular tickets vendidos basado en compras
            const eventTicketsSold = eventPurchases.reduce((sum, purchase) => {
              return sum + (purchase.quantity || 0);
            }, 0);
            
            // Calcular ingresos basado en compras
            const eventRevenue = eventPurchases.reduce((sum, purchase) => {
              return sum + parseFloat(purchase.amount || 0);
            }, 0);
            
            totalTicketsSold += eventTicketsSold;
            totalRevenue += eventRevenue;
            
          } catch (e) {
            console.error(`Error fetching data for event ${event.id}:`, e);
          }
        }

        // Calcular vistas (simulado basado en eventos activos)
        const activeEvents = events.filter(event => event.is_published);
        const totalViews = activeEvents.length * 150; // Simulación de vistas

        setStats({
          myEvents: events.length,
          myTickets: totalTicketsSold,
          myRevenue: totalRevenue.toFixed(2),
          views: totalViews,
        });
        
      } catch (e) {
        console.error('Error fetching organizer stats:', e);
        setStats({
          myEvents: 0,
          myTickets: 0,
          myRevenue: 0,
          views: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  const handleQuickAction = (actionTitle) => {
    if (actionTitle === 'Crear Evento') {
      navigate('/organizer-panel/events');
    } else if (actionTitle === 'Mis Tickets') {
      navigate('/organizer-panel/tickets');
    } else if (actionTitle === 'Estadísticas') {
      navigate('/organizer-panel/stats');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardWidgets userRole="organizer" stats={stats} onQuickActionClick={handleQuickAction} />
  );
} 