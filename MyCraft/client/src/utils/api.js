// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
});

// INTERCEPTOR: TỰ ĐỘNG GỬI TOKEN
api.interceptors.request.use(
    (config) => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const { token } = JSON.parse(userData);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('api.js - GỬI TOKEN:', token.substring(0, 20) + '...');
                }
            } catch (err) {
                console.error('Lỗi parse user:', err);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR: XỬ LÝ 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
    }
);

export default api;