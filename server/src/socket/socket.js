import { Server } from 'socket.io';
import { setupChatSocket } from './chat.socket.js';
import { logger } from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, '')) : []),
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(cleanOrigin) || /\.vercel\.app$/.test(cleanOrigin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by Socket CORS'));
      },
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
