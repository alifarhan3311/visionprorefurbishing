import axios from 'axios';
//live
const api = axios.create({
  // Sirf /api/v1 likhein, browser khud IP aur Port (8083) utha lega
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

//local
// const api = axios.create({
//   // Sirf /api/v1 likhein, browser khud IP aur Port (8083) utha lega
//   baseURL: 'http://localhost:5000/api/v1',
//   headers: { 'Content-Type': 'application/json' }
// });
// Interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
