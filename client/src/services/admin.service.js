import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getCustomers: async (params = {}) => {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },

  getTeam: async () => {
    const response = await api.get('/admin/team');
    return response.data;
  },

  // Owner-only Admin Request approvals
  getAdminRequests: async () => {
    const response = await api.get('/admin/requests');
    return response.data;
  },

  approveAdminRequest: async (id) => {
    const response = await api.patch(`/admin/requests/${id}/approve`);
    return response.data;
  },

  rejectAdminRequest: async (id) => {
    const response = await api.patch(`/admin/requests/${id}/reject`);
    return response.data;
  },

  removeAdmin: async (id) => {
    const response = await api.delete(`/admin/${id}`);
    return response.data;
  },

  getAdminJoinKey: async () => {
    const response = await api.get('/admin/join-key');
    return response.data;
  },

  regenerateAdminJoinKey: async () => {
    const response = await api.post('/admin/regenerate-join-key');
    return response.data;
  },
};
