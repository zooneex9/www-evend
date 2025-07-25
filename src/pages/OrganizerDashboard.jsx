import React, { useEffect, useState } from 'react';
import DashboardWidgets from '../components/DashboardWidgets';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
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

  return (
    <DashboardWidgets userRole="organizer" stats={stats} onQuickActionClick={handleQuickAction} />
  );
} 