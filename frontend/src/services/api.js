import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add user ID to requests
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers.userId = userId;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const tenantAPI = {
  getTenants: (userId) => api.get(`/user/${userId}/tenants`),
  createTenant: (userId, name) => api.post(`/user/${userId}/tenants`, { name }),
};

export const subscriptionAPI = {
  getSubscription: (tenantId) => api.get(`/tenant/${tenantId}/subscription`),
  createSubscription: (tenantId, priceId) => api.post(`/tenant/${tenantId}/subscription`, { priceId }),
  updateSubscription: (tenantId, subscriptionId, action, newPriceId) => 
    api.put(`/tenant/${tenantId}/subscription/${subscriptionId}`, { action, newPriceId }),
};

export const plansAPI = {
  getPlans: () => api.get('/plans'),
};

export const invoiceAPI = {
  getInvoices: (tenantId) => api.get(`/tenant/${tenantId}/invoices`),
};

export default api;
