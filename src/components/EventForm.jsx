import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EventForm({ onCreated, organizerId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    is_published: false,
    main_image: null,
    gallery: [],
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    other: '',
  });
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    if (!organizerId) {
      api.get('/organizers')
        .then(res => setOrganizers(res.data))
        .catch(err => console.error('Error al cargar organizadores:', err));
    }
  }, [organizerId]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (name === 'main_image') {
        setFormData({ ...formData, main_image: files[0] });
      } else if (name === 'gallery') {
        setFormData({ ...formData, gallery_images: Array.from(files).slice(0, 2) });
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'main_image' && formData[key]) {
        formDataToSend.append('main_image', formData[key]);
      } else if (key === 'gallery_images' && formData[key]?.length > 0) {
        formData[key].forEach(file => {
          formDataToSend.append('gallery_images[]', file);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await api.post('/events', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Evento creado exitosamente');
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        is_published: false,
        main_image: null,
        gallery: [],
        facebook: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        other: '',
      });
      if (onCreated) onCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear el evento');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {!organizerId && (
        <div>
          <label>Organizador: </label>
          <select name="organizer_id" value={formData.organizer_id} onChange={handleChange} required>
            <option value="">Seleccione un organizador</option>
            {organizers.map(organizer => (
              <option key={organizer.id} value={organizer.id}>
                {organizer.company_name} ({organizer.subdomain})
              </option>
            ))}
          </select>
        </div>
      )}
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Título del evento"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Descripción"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff', minHeight: 100 }}
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Ubicación"
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="datetime-local"
        name="start_date"
        value={formData.start_date}
        onChange={handleChange}
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="datetime-local"
        name="end_date"
        value={formData.end_date}
        onChange={handleChange}
        required
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <label style={{ color: '#fff' }}>
        <input
          type="checkbox"
          name="is_published"
          checked={formData.is_published}
          onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
          style={{ marginRight: 8 }}
        />
        Publicar evento
      </label>
      <div>
        <label style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Imagen principal:</label>
        <input
          type="file"
          name="main_image"
          onChange={handleChange}
          accept="image/*"
          style={{ color: '#fff' }}
        />
      </div>
      <div>
        <label style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Galería (máximo 2 imágenes):</label>
        <input
          type="file"
          name="gallery"
          onChange={handleChange}
          accept="image/*"
          multiple
          style={{ color: '#fff' }}
        />
      </div>
      <input
        type="url"
        name="facebook"
        value={formData.facebook}
        onChange={handleChange}
        placeholder="URL de Facebook"
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="url"
        name="instagram"
        value={formData.instagram}
        onChange={handleChange}
        placeholder="URL de Instagram"
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="url"
        name="youtube"
        value={formData.youtube}
        onChange={handleChange}
        placeholder="URL de Youtube"
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="url"
        name="tiktok"
        value={formData.tiktok}
        onChange={handleChange}
        placeholder="URL de TikTok"
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <input
        type="url"
        name="other"
        value={formData.other}
        onChange={handleChange}
        placeholder="Otra URL"
        style={{ padding: 8, background: '#333', border: 'none', borderRadius: 4, color: '#fff' }}
      />
      <button type="submit" style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
        Crear evento
      </button>
    </form>
  );
} 