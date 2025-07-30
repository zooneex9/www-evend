import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es un error 401 (no autorizado), limpiar el token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
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
