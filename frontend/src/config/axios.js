import axios from 'axios';

// Set base URL for all API requests
const baseURL = import.meta.env.VITE_API_URL || 'https://web-production-c7dc.up.railway.app';
axios.defaults.baseURL = baseURL;

// Add request interceptor to include token
axios.interceptors.request.use(
    (config) => {
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