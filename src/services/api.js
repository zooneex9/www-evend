import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  // Puedes agregar headers aquí si usas autenticación
});

// Interceptor para manejar FormData
api.interceptors.request.use(
  (config) => {
    // Si los datos son FormData, no establecer Content-Type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export const getAdminStats = async () => {
  const res = await api.get('/admin-stats');
  return res.data;
};

export const getRecentActivity = async () => {
  const res = await api.get('/recent-activity');
  return res.data;
};

export const getOrganizerRecentActivity = async (organizerId) => {
  const res = await api.get(`/organizer-recent-activity?organizer_id=${organizerId}`);
  return res.data;
};

export const getClientRecentActivity = (userId) => {
  return api.get(`/client-recent-activity?user_id=${userId}`).then(res => res.data);
};
