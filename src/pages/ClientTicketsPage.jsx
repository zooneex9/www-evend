import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Table, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function ClientTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'client') {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tickets?user_id=${user.id}`);
      setTickets(res.data);
    } catch (e) {
      setTickets([]);
    }
    setLoading(false);
  };

  return (
    <Layout title="Mis Tickets">
      <div className="container py-4">
        <h2 className="text-white mb-4">Mis Tickets</h2>
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Tickets Comprados</h5>
            {loading ? (
              <div className="text-center py-4">Cargando tickets...</div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover variant="dark" className="rounded">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Nombre Ticket</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td>{ticket.event_title || '-'}</td>
                        <td>{ticket.name || '-'}</td>
                        <td>{ticket.quantity || 1}</td>
                        <td>${ticket.price || '-'}</td>
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