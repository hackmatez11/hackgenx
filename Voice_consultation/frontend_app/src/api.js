import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const createCall = (phoneNumber) => api.post('/create-call', { phoneNumber });
export const createWebCall = () => api.post('/create-web-call');
export const getLatestCall = () => api.get('/latest-call');

export default api;
