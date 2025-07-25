import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import ModernForm from '../components/ModernForm';
import ModernModal from '../components/ModernModal';
import { Plus, Calendar, Users } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'organizer' && user.role !== 'superadmin')) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCredits();
      fetchEvents();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchCredits = async () => {
    try {
      const res = await api.get(`/credits?organizer_id=${user.id}`);
      const total = res.data.reduce((acc, c) => acc + (c.amount - (c.used || 0)), 0);
      setCredits(total);
    } catch (e) {
      setCredits(0);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get(`/events?organizer_id=${user.id}`);
      setEvents(res.data);
    } catch (e) {
      setEvents([]);
    }
  };

  const eventColumns = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      filterable: true
    },
    {
      key: 'location',
      label: 'Ubicación',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="d-flex align-items-center text-dark">
          <Calendar size={16} className="me-2 text-muted" />
          {value}
        </div>
      )
    },
    {
      key: 'start_date',
      label: 'Fecha de Inicio',
      sortable: true,
      type: 'date',
      render: (value) => (
        <div className="d-flex align-items-center text-dark">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Definir los campos del formulario justo antes del modal
  const eventFormFields = [
    {
      name: 'title',
      label: 'Título del Evento',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el título del evento'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Describe el evento'
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      required: true,
      placeholder: 'Dirección del evento'
    },
    {
      name: 'start_date',
      label: 'Fecha y Hora de Inicio',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'end_date',
      label: 'Fecha y Hora de Fin',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'image',
      label: 'Imagen del Evento',
      type: 'file',
      required: false,
      helpText: 'Opcional. Sube una imagen para el evento (JPG, PNG, etc.)'
    },
    {
      name: 'prueba',
      label: 'Campo de Prueba',
      type: 'text',
      required: false,
      placeholder: 'Esto es una prueba'
    }
  ];

  const handleCreateEvent = async (formData) => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('start_date', formData.start_date);
      data.append('end_date', formData.end_date);
      if (formData.image) {
        data.append('image', formData.image);
      }
      data.append('organizer_id', user.organizer_id || user.id);
      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Evento creado exitosamente');
      fetchEvents();
      setShowEventForm(false);
    } catch (err) {
      toast.error('Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    // Aquí puedes abrir un modal de edición o navegar a una página de edición
    toast('Funcionalidad de editar evento (por implementar)', { icon: '✏️' });
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el evento "${event.title}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/events/${event.id}`);
      toast.success('Evento eliminado');
      fetchEvents();
    } catch (e) {
      toast.error('Error al eliminar evento');
    }
    setLoading(false);
  };

  const handleViewEvent = (event) => {
    const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
    window.open(`/event/${organizerSubdomain}/${event.id}`, '_blank');
  };

  const handleViewStats = (event) => {
    const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
    window.open(`/event/${organizerSubdomain}/${event.id}/stats`, '_blank');
  };

  return (
    <div className="container py-4 bg-white text-dark">
      <h2 className="text-white mb-4">Mis Eventos</h2>
      <button
        type="button"
        className="d-flex align-items-center btn btn-primary mb-3"
        onClick={() => setShowEventForm(true)}
      >
        <Plus className="me-2" />
        Crear Evento
      </button>
      {loading ? (
        <div className="text-center py-4">Cargando eventos...</div>
      ) : events.length === 0 ? (
        <div className="bg-white text-dark p-4 rounded">No tienes eventos creados.</div>
      ) : (
        <DataTable
          data={events}
          columns={eventColumns}
          title="Mis Eventos"
          searchable={true}
          filterable={true}
          pagination={true}
          itemsPerPage={5}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onView={handleViewEvent}        // ← Agregar esta línea
          onStats={handleViewStats}       // ← Agregar esta línea
        />
      )}
      {/* Modal para crear evento */}
      {showEventForm && (
        <ModernModal
          show={showEventForm}
          onHide={() => setShowEventForm(false)}
          title="Crear Nuevo Evento"
          size="lg"
          showCloseButton={false}
        >
          <ModernForm
            fields={eventFormFields}
            initialData={{}}
            submitText="Crear Evento"
            cancelText="Cancelar"
            onSubmit={handleCreateEvent}
            onCancel={() => setShowEventForm(false)}
            loading={loading}
            layout="vertical"
          />
        </ModernModal>
      )}
    </div>
  );
} 