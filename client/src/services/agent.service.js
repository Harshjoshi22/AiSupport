import api from './api';

export const agentService = {
  // Global directory for Owners/Admins
  getAvailableAgents: async (params = {}) => {
    const response = await api.get('/agents/available', { params });
    return response.data;
  },

  getAgentProfile: async (id) => {
    const response = await api.get(`/agents/profile/${id}`);
    return response.data;
  },

  inviteAgent: async (id) => {
    const response = await api.post(`/agents/${id}/invite`);
    return response.data;
  },

  // Agent inbox
  getMyInvitations: async () => {
    const response = await api.get('/agents/invitations');
    return response.data;
  },

  acceptInvitation: async (id) => {
    const response = await api.patch(`/agents/invitations/${id}/accept`);
    return response.data;
  },

  declineInvitation: async (id) => {
    const response = await api.patch(`/agents/invitations/${id}/decline`);
    return response.data;
  },

  leaveCompany: async () => {
    const response = await api.post('/agents/leave-company');
    return response.data;
  },

  removeAgent: async (id) => {
    const response = await api.delete(`/agents/company/${id}`);
    return response.data;
  },

  getCompanyAgents: async () => {
    const response = await api.get('/agents/company-agents');
    return response.data;
  },
};
