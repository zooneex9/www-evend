import React, { useEffect, useState } from 'react';
import DashboardWidgets from '../components/DashboardWidgets';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrganizerStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user || (user.role !== 'organizer' && user.role !== 'superadmin')) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
    // eslint-disable-next-line
  }, [user]);

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

  return (
    <div className="container py-4 bg-white text-dark">
      <h2 className="text-white mb-4">Estadísticas</h2>
      <DashboardWidgets userRole={user?.role} stats={stats} />
    </div>
  );
} 