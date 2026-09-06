import api from './api';

export const ticketService = {
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  updateTicket: async (id, updates) => {
    const response = await api.put(`/tickets/${id}`, updates);
    return response.data;
  },

  assignTicket: async (id, agentId) => {
    const response = await api.put(`/tickets/${id}/assign`, { agentId });
    return response.data;
  },

  addInternalNote: async (id, note) => {
    const response = await api.post(`/tickets/${id}/notes`, { note });
    return response.data;
  },

  getSuggestedReply: async (id) => {
    const response = await api.get(`/tickets/${id}/suggest-reply`);
    return response.data;
  },
};
