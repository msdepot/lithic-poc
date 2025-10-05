import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  adminLogin: (username, password) => 
    api.post('/auth/admin/login', { username, password }),
  
  userLogin: (email) => 
    api.post('/auth/user/login', { email }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

export const accounts = {
  create: (data) => 
    api.post('/accounts', data),
  
  list: () => 
    api.get('/accounts'),
  
  get: (id) => 
    api.get(`/accounts/${id}`),
};

export const users = {
  create: (data) => 
    api.post('/users', data),
  
  list: () => 
    api.get('/users'),
  
  get: (id) => 
    api.get(`/users/${id}`),
};

export const cards = {
  create: (data) => 
    api.post('/cards', data),
  
  list: () => 
    api.get('/cards'),
  
  get: (id) => 
    api.get(`/cards/${id}`),
};

export const spendingProfiles = {
  create: (data) => 
    api.post('/spending-profiles', data),
  
  list: () => 
    api.get('/spending-profiles'),
  
  get: (id) => 
    api.get(`/spending-profiles/${id}`),
};

export default api;
