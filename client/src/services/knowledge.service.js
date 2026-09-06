import api from './api';

export const knowledgeService = {
  getKnowledge: async (params = {}) => {
    const response = await api.get('/knowledge', { params });
    return response.data;
  },

  createKnowledge: async (data) => {
    const response = await api.post('/knowledge', data);
    return response.data;
  },

  uploadDocument: async (formData) => {
    const response = await api.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateKnowledge: async (id, data) => {
    const response = await api.put(`/knowledge/${id}`, data);
    return response.data;
  },

  deleteKnowledge: async (id) => {
    const response = await api.delete(`/knowledge/${id}`);
    return response.data;
  },

  testSearch: async (query) => {
    const response = await api.post('/knowledge/search', { query });
    return response.data;
  },
};
