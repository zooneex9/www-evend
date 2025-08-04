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
  const [editingEvent, setEditingEvent] = useState(null);

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
  }, [user]);

  const fetchCredits = async () => {
    try {
      // Determinar el organizer_id correcto
      let organizerId = user.id;
      if (user.role === 'organizer') {
        try {
          const organizersRes = await api.get('/organizers');
          const userOrganizer = organizersRes.data.find(org => org.user_id === user.id);
          if (userOrganizer) {
            organizerId = userOrganizer.id;
          }
        } catch (e) {
          console.error('Could not fetch organizers for credits:', e);
        }
      }
      
      const res = await api.get(`/credits?organizer_id=${organizerId}`);
      const total = res.data.reduce((acc, c) => acc + (c.amount - (c.used || 0)), 0);
      setCredits(total);
    } catch (e) {
      setCredits(0);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Determinar el organizer_id correcto
      let organizerId = user.id;
      if (user.role === 'organizer') {
        // Para organizadores, necesitamos encontrar su organizer_id
        try {
          const organizersRes = await api.get('/organizers');
          const userOrganizer = organizersRes.data.find(org => org.user_id === user.id);
          if (userOrganizer) {
            organizerId = userOrganizer.id;
          }
        } catch (e) {
          console.error('Could not fetch organizers for credits:', e);
        }
      }
      
      const res = await api.get(`/events?organizer_id=${organizerId}`);
      setEvents(res.data);
    } catch (e) {
      console.error('Error fetching events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
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
      name: 'main_image',
      label: 'Imagen del Evento',
      type: 'file',
      required: false,
      helpText: 'Opcional. Sube una imagen para el evento (JPG, PNG, etc.)'
    },
    {
      name: 'is_published',
      label: 'Publicar Evento',
      type: 'checkbox',
      required: false,
      helpText: 'Marque esta casilla si desea que el evento sea visible públicamente'
    }
  ];

  const handleCreateEvent = async (formData) => {
    try {
      setLoading(true);
      
      // Verificar token de autenticación
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      console.log('User data:', user);
      
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      if (formData.main_image && formData.main_image instanceof File) {
        data.append('main_image', formData.main_image);
      }
      
      // Determinar el organizer_id correcto para crear eventos
      let organizerId = user.organizer_id || user.id;
      if (user.role === 'organizer') {
        try {
          console.log('Fetching organizers for user:', user.id);
          const organizersRes = await api.get('/organizers');
          console.log('Organizers response:', organizersRes.data);
          const userOrganizer = organizersRes.data.find(org => org.user_id === user.id);
          if (userOrganizer) {
            organizerId = userOrganizer.id;
            console.log('Found organizer_id:', organizerId);
          } else {
            console.log('No organizer found for user_id:', user.id);
          }
        } catch (e) {
          console.error('Could not fetch organizers for event creation:', e);
          console.error('Error details:', e.response?.data);
          // Usar el user.id como fallback
          organizerId = user.id;
        }
      }
      
      data.append('organizer_id', organizerId);
      
      if (editingEvent) {
        // Actualizar evento existente
        await api.put(`/events/${editingEvent.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Evento actualizado exitosamente');
      } else {
        // Crear nuevo evento
        await api.post('/events', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Evento creado exitosamente');
      }
      
      fetchEvents();
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error('Error saving event:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      let errorMessage = 'Error al guardar evento';
      if (err.response?.status === 401) {
        errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    // Cargar los datos del evento en el formulario
    const eventData = {
      title: event.title,
      description: event.description,
      location: event.location,
      start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      is_published: event.is_published || false
    };
    
    // Establecer el evento que se está editando
    setEditingEvent(event);
    setShowEventForm(true);
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
        onClick={() => {
          setEditingEvent(null);
          setShowEventForm(true);
        }}
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
          onView={handleViewEvent}
          onStats={handleViewStats}
        />
      )}
      {/* Modal para crear/editar evento */}
      {showEventForm && (
        <ModernModal
          show={showEventForm}
          onHide={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          title={editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
          size="xl"
          showCloseButton={false}
        >
          <ModernForm
            fields={eventFormFields}
            initialData={editingEvent ? {
              title: editingEvent.title,
              description: editingEvent.description,
              location: editingEvent.location,
              start_date: editingEvent.start_date ? new Date(editingEvent.start_date).toISOString().slice(0, 16) : '',
              end_date: editingEvent.end_date ? new Date(editingEvent.end_date).toISOString().slice(0, 16) : '',
              is_published: editingEvent.is_published || false
            } : {}}
            submitText={editingEvent ? "Actualizar Evento" : "Crear Evento"}
            cancelText="Cancelar"
            onSubmit={handleCreateEvent}
            onCancel={() => {
              setShowEventForm(false);
              setEditingEvent(null);
            }}
            loading={loading}
            layout="vertical"
          />
        </ModernModal>
      )}
    </div>
  );
} 