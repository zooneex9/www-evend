import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function EventStatsPage() {
  const { organizerSubdomain, eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get(`/events/${eventId}`);
        setEvent(eventRes.data);
        // Validar acceso: solo el organizador dueño puede ver
        if (!user || user.role !== 'organizer' || user.id !== eventRes.data.organizer_id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        const ticketsRes = await api.get(`/tickets?event_id=${eventId}`);
        setTickets(ticketsRes.data);
        const purchasesRes = await api.get(`/ticket-purchases?event_id=${eventId}`);
        setPurchases(purchasesRes.data);
      } catch (e) {
        setAccessDenied(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [eventId, user]);

  // Cálculos
  const totalVendidos = purchases.reduce((acc, p) => acc + p.quantity, 0);
  const totalIngresos = purchases.reduce((acc, p) => acc + parseFloat(p.amount), 0);
  const totalDisponibles = tickets.reduce((acc, t) => acc + (t.quantity || 0), 0);

  // Datos para gráficos
  const ticketsPorTipo = tickets.map(ticket => {
    const vendidos = purchases.filter(p => p.ticket_id === ticket.id).reduce((acc, p) => acc + p.quantity, 0);
    return { name: ticket.name, vendidos };
  });

  const ingresosPorTicket = tickets.map(ticket => {
    const ingresos = purchases.filter(p => p.ticket_id === ticket.id).reduce((acc, p) => acc + parseFloat(p.amount), 0);
    return { name: ticket.name, ingresos };
  });

  const barData = {
    labels: ticketsPorTipo.map(t => t.name),
    datasets: [
      {
        label: 'Tickets vendidos',
        data: ticketsPorTipo.map(t => t.vendidos),
        backgroundColor: '#e50914',
      },
    ],
  };

  const pieData = {
    labels: ingresosPorTicket.map(t => t.name),
    datasets: [
      {
        label: 'Ingresos por ticket',
        data: ingresosPorTicket.map(t => t.ingresos),
        backgroundColor: [
          '#e50914', '#1f8a3b', '#222', '#ff9800', '#3b5998', '#E1306C', '#FF0000', '#000', '#666'
        ],
      },
    ],
  };

  if (accessDenied) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32, color: '#fff', textAlign: 'center' }}>
        <h2 style={{ color: '#e50914', marginBottom: 24 }}>Acceso denegado</h2>
        Solo el organizador dueño del evento puede ver las estadísticas.<br />
        Si crees que esto es un error, inicia sesión con la cuenta organizadora correspondiente.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <Link to={organizerSubdomain ? `/event/${organizerSubdomain}/${eventId}` : '/panel'} style={{ color: '#e50914', textDecoration: 'underline', marginBottom: 24, display: 'inline-block' }}>
        &larr; Volver al evento
      </Link>
      <h1 style={{ color: '#e50914', marginBottom: 24 }}>Estadísticas del evento</h1>
      {loading ? (
        <div style={{ color: '#fff' }}>Cargando estadísticas...</div>
      ) : !event ? (
        <div style={{ color: 'red' }}>No se pudo cargar el evento.</div>
      ) : (
        <>
          <h2 style={{ color: '#fff', marginBottom: 8 }}>{event.title}</h2>
          <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ background: '#222', borderRadius: 8, padding: 24, color: '#fff', minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Tickets vendidos</div>
              <div style={{ fontSize: 32, color: '#1f8a3b', fontWeight: 700 }}>{totalVendidos}</div>
            </div>
            <div style={{ background: '#222', borderRadius: 8, padding: 24, color: '#fff', minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Tickets disponibles</div>
              <div style={{ fontSize: 32, color: '#e50914', fontWeight: 700 }}>{totalDisponibles}</div>
            </div>
            <div style={{ background: '#222', borderRadius: 8, padding: 24, color: '#fff', minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Ingresos totales</div>
              <div style={{ fontSize: 32, color: '#e50914', fontWeight: 700 }}>${totalIngresos.toFixed(2)}</div>
            </div>
          </div>

          {/* Gráficos */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ background: '#181818', borderRadius: 8, padding: 24, minWidth: 350, flex: 1 }}>
              <h4 style={{ color: '#fff', marginBottom: 16 }}>Tickets vendidos por tipo</h4>
              <div style={{ height: 320 }}>
                <Bar data={barData} options={{
                  plugins: { legend: { display: false } },
                  scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
                  responsive: true,
                  maintainAspectRatio: false,
                }} />
              </div>
            </div>
            <div style={{ background: '#181818', borderRadius: 8, padding: 24, minWidth: 350, flex: 1 }}>
              <h4 style={{ color: '#fff', marginBottom: 16 }}>Distribución de ingresos por ticket</h4>
              <div style={{ height: 320 }}>
                <Pie data={pieData} options={{
                  plugins: { legend: { labels: { color: '#fff', font: { weight: 'bold' } } } },
                  responsive: true,
                  maintainAspectRatio: false,
                }} />
              </div>
            </div>
          </div>

          <h3 style={{ color: '#fff', marginBottom: 12 }}>Compras recientes</h3>
          <div style={{ background: '#222', borderRadius: 8, padding: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', minWidth: 500, fontSize: '0.97rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>Usuario</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Ticket</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Cantidad</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Monto</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr><td colSpan={6} style={{ color: '#aaa', textAlign: 'center', padding: 16 }}>No hay compras registradas.</td></tr>
                ) : (
                  purchases.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: 8 }}>{p.user_name || p.user_id}</td>
                      <td style={{ padding: 8 }}>{p.ticket_name || p.ticket_id}</td>
                      <td style={{ padding: 8 }}>{p.quantity}</td>
                      <td style={{ padding: 8 }}>${parseFloat(p.amount).toFixed(2)}</td>
                      <td style={{ padding: 8 }}>{new Date(p.created_at).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{p.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 