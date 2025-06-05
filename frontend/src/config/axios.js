import axios from 'axios';

// Set base URL for all API requests
axios.defaults.baseURL = 'http://localhost:5050';

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