import axios from 'axios';
import useAuth from '../store/authStore';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3456/api';

export const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:3456';

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = useAuth.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuth.getState().logout();
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }

        return Promise.reject(error);
    },
);

export default apiClient;
