import React, { useEffect, useState } from 'react';
import DashboardWidgets from './DashboardWidgets';
import { getAdminStats, getRecentActivity } from '../services/api';
import { Spinner, Alert } from 'react-bootstrap';

export default function AdminDashboard({ onQuickActionClick, stats: propStats }) {
  const [stats, setStats] = useState(propStats || null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propStats) {
      setStats(propStats);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      getAdminStats(),
      getRecentActivity()
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setRecentActivity(activityData);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error al cargar datos del dashboard de administrador.');
        setLoading(false);
      });
  }, [propStats]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <DashboardWidgets 
      userRole="superadmin" 
      stats={stats || {}} 
      onQuickActionClick={onQuickActionClick}
      recentActivity={recentActivity}
    />
  );
} 