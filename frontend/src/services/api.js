import axios from 'axios';
//live
// const api = axios.create({
//   // Sirf /api/v1 likhein, browser khud IP aur Port (8083) utha lega
//   baseURL: '/api/v1',
//   headers: { 'Content-Type': 'application/json' }
// });

//local
const api = axios.create({
  // Sirf /api/v1 likhein, browser khud IP aur Port (8083) utha lega
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

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

export const getImageUrl = (url) => {
  if (!url) return '';
  
  // Agar URL pehle se hi complete web link ya data URI hai, toh usko wese hi return kar dein
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // 1. Pehle VITE_IMAGE_URL check karein (jo aapne env mein set kiya hai)
  let serverBase = import.meta.env.VITE_IMAGE_URL || '';

  // 2. Agar VITE_IMAGE_URL nahi milta, toh VITE_API_URL ko fallback banayein
  if (!serverBase) {
    const apiBase = import.meta.env.VITE_API_URL || '';
    if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
      serverBase = apiBase.split('/api/v1')[0];
    }
  }

  // 3. Agar dono nahi hain, toh current website ka domain (origin) use karein
  if (!serverBase) {
    serverBase = window.location.origin;
  }

  // Server base ke aakhir se saare extra slashes (/) khatam karein
  serverBase = serverBase.replace(/\/$/, '');

  // Ensure karein ke image path ke shuru mein ek slash (/) zaroor ho
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  return `${serverBase}${cleanUrl}`;
};

export default api;
