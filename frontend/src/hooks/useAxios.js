import axios from 'axios';
import { useMemo } from 'react';

const useAxios = () => {
    return useMemo(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
        const client = axios.create({ baseURL: backendUrl });
        
        client.interceptors.request.use((config) => {
            const token = localStorage.getItem('sitenex_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        
        return client;
    }, []);
};

export default useAxios;
