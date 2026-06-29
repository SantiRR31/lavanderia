import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:5000/api`,
    withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

// Response interceptor: handle unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token expired or invalid
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
