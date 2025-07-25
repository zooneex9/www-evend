import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Table, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function ClientEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'client') {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/client-events?user_id=${user.id}`);
      setEvents(res.data);
    } catch (e) {
      setEvents([]);
    }
    setLoading(false);
  };

  return (
    <Layout title="Mis Eventos">
      <div className="container py-4">
        <h2 className="text-white mb-4">Mis Eventos</h2>
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Eventos Asistidos</h5>
            {loading ? (
              <div className="text-center py-4">Cargando eventos...</div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover variant="dark" className="rounded">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Fecha</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event.id}>
                        <td>{event.title || '-'}</td>
                        <td>{event.start_date ? new Date(event.start_date).toLocaleDateString() : '-'}</td>
                        <td>{event.location || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
} 