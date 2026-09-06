import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  registerCompany: async (companyData) => {
    const response = await api.post('/auth/register-company', companyData);
    return response.data;
  },

  registerAgent: async (agentData) => {
    const response = await api.post('/auth/register-agent', agentData);
    return response.data;
  },

  requestAdminJoin: async (requestData) => {
    const response = await api.post('/auth/request-admin', requestData);
    return response.data;
  },

  registerCustomer: async (customerData) => {
    const response = await api.post('/auth/register-customer', customerData);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};
