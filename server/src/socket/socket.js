import { Server } from 'socket.io';
import { setupChatSocket } from './chat.socket.js';
import { logger } from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  setupChatSocket(io);

  logger.info('Socket.io server initialized');
  return io;
};

export const getIO = () => {
  return io;
};
