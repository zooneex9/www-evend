import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import api from '../services/api';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (e) {
      setTickets([]);
    }
    setLoading(false);
  };

  const ticketColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'event_title', label: 'Evento', sortable: false },
    { key: 'price', label: 'Precio', sortable: true },
    { key: 'quantity', label: 'Cantidad', sortable: true },
    { key: 'sold', label: 'Vendidos', sortable: true },
  ];

  return (
    <>
      {loading ? (
        <div className="text-center py-4">Cargando tickets...</div>
      ) : (
        <DataTable
          data={tickets}
          columns={ticketColumns}
          title="Tickets"
          searchable={true}
          filterable={true}
          pagination={true}
          itemsPerPage={10}
        />
      )}
    </>
  );
}
