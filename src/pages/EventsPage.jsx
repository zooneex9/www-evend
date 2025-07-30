import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import ModernForm from '../components/ModernForm';
import ModernModal, { ConfirmModal } from '../components/ModernModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Eye,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (e) {
      console.error('Error fetching events:', e);
      setEvents([]);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const res = await api.get('/organizers');
      setOrganizers(res.data);
    } catch (e) {
      console.error('Error fetching organizers:', e);
      setOrganizers([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
  }, []);

  const handleEventCreated = () => {
    toast.success('¡Evento creado exitosamente!');
    fetchEvents();
    setShowEventForm(false);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setLoading(true);
    try {
      await api.delete(`/events/${eventToDelete.id}`);
      fetchEvents();
      toast.success('Evento eliminado exitosamente');
    } catch (err) {
      toast.error('Error al eliminar evento');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const handleViewEvent = (event) => {
    const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
    navigate(`/event/${organizerSubdomain}/${event.id}`);
  };

  const handleViewStats = (event) => {
    const organizerSubdomain = event.organizer?.subdomain || event.organizer_subdomain || 'event';
    navigate(`/event/${organizerSubdomain}/${event.id}/stats`);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  // Configuración de la tabla de eventos
  const eventColumns = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      filterable: true
    },
    {
      key: 'organizer_name',
      label: 'Organizador',
      sortable: true,
      filterable: true,
             render: (value, event) => {
         // Intentar obtener el nombre del organizador de diferentes formas
         let organizerName = 'Sin organizador';
         
         if (event.organizer?.name) {
           organizerName = event.organizer.name;
         } else if (event.organizer?.user?.name) {
           organizerName = event.organizer.user.name;
         } else if (event.organizer_name) {
           organizerName = event.organizer_name;
         } else if (event.organizer?.company_name) {
           organizerName = event.organizer.company_name;
         } else if (event.organizer_id) {
           // Buscar en la lista de organizadores cargados
           const organizer = organizers.find(org => org.id === event.organizer_id);
           if (organizer) {
             organizerName = organizer.user?.name || organizer.company_name || organizer.name || `Organizador #${organizer.id}`;
           } else {
             organizerName = `Organizador #${event.organizer_id}`;
           }
         }
         
         return (
           <div className="d-flex align-items-center">
             <Users size={16} className="me-2 text-muted" />
             {organizerName}
           </div>
         );
       }
    },
    {
      key: 'location',
      label: 'Ubicación',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="d-flex align-items-center">
          <MapPin size={16} className="me-2 text-muted" />
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
        <div className="d-flex align-items-center">
          <Clock size={16} className="me-2 text-muted" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'is_published',
      label: 'Estado',
      sortable: true,
      type: 'status',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-warning'}`}>
          {value ? 'Publicado' : 'Borrador'}
        </span>
      )
    },
    {
      key: 'tickets_count',
      label: 'Tickets',
      sortable: true,
      render: (value, event) => {
        const ticketsCount = event.tickets?.length || 0;
        return (
          <div className="d-flex align-items-center">
            <Calendar size={16} className="me-2 text-muted" />
            {ticketsCount}
          </div>
        );
      }
    }
  ];

  // Configuración del formulario de evento
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
      name: 'organizer_id',
      label: 'Organizador',
      type: 'select',
      required: true,
      placeholder: 'Selecciona un organizador',
      options: organizers.map(org => ({
        value: org.id,
        label: (org.user && org.user.name) ? org.user.name : `Organizador #${org.id}`
      }))
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
      name: 'is_published',
      label: 'Publicar Evento',
      type: 'checkbox'
    }
  ];

  const renderEventForm = () => (
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
      onSubmit={async (formData) => {
        setLoading(true);
        try {
          const data = new FormData();
          data.append('title', formData.title);
          data.append('description', formData.description);
          data.append('location', formData.location);
          data.append('start_date', formData.start_date);
          data.append('end_date', formData.end_date);
          data.append('is_published', formData.is_published || false);
          
          if (formData.main_image instanceof File) {
            data.append('main_image', formData.main_image);
          }
          
          if (editingEvent) {
            await api.put(`/events/${editingEvent.id}`, data, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Evento actualizado exitosamente');
          } else {
            await api.post('/events', data, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Evento creado exitosamente');
          }
          fetchEvents();
          setShowEventForm(false);
          setEditingEvent(null);
        } catch (err) {
          console.error('Error al guardar evento:', err);
          toast.error('Error al guardar evento');
        } finally {
          setLoading(false);
        }
      }}
      onCancel={() => {
        setShowEventForm(false);
        setEditingEvent(null);
      }}
      loading={loading}
      layout="vertical"
    />
  );

  return (
    <>
      {/* Modal para crear/editar eventos */}
      {showEventForm && (
        <ModernModal
          show={showEventForm}
          onHide={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          title={editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
          size="xl"
        >
          {renderEventForm()}
        </ModernModal>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteEvent}
        title="Eliminar Evento"
        message={`¿Estás seguro de que quieres eliminar el evento "${eventToDelete?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {loading ? (
        <div className="text-center py-4">Cargando eventos...</div>
      ) : (
        <DataTable
          data={events}
          columns={eventColumns}
          title="Eventos"
          searchable={true}
          filterable={true}
          pagination={true}
          itemsPerPage={10}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onView={handleViewEvent}
          onStats={handleViewStats}
          onCreate={handleCreateEvent}
        />
      )}
    </>
  );
}
