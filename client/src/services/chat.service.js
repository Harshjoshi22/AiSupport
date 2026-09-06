import api from './api';

export const chatService = {
  getConversations: async (params = {}) => {
    const response = await api.get('/conversations', { params });
    return response.data;
  },

  getConversationById: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  startConversation: async () => {
    const response = await api.post('/conversations/start');
    return response.data;
  },

  sendMessage: async (id, content) => {
    const response = await api.post(`/conversations/${id}/messages`, { content });
    return response.data;
  },

  escalateConversation: async (id, reason) => {
    const response = await api.post(`/conversations/${id}/escalate`, { reason });
    return response.data;
  },

  takeOverConversation: async (id) => {
    const response = await api.post(`/conversations/${id}/takeover`);
    return response.data;
  },

  summarizeChat: async (id) => {
    const response = await api.post(`/conversations/${id}/summarize`);
    return response.data;
  },

  suggestReply: async (id) => {
    const response = await api.post(`/conversations/${id}/suggest-reply`);
    return response.data;
  },

  resolveConversation: async (id) => {
    const response = await api.post(`/conversations/${id}/resolve`);
    return response.data;
  },
};
