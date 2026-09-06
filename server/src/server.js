import http from 'http';
import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

import { initSocket } from './socket/socket.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);



// Connect Database and Start Server
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      logger.success(`🚀 AI SupportHub Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`🌐 Health check endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error(`Fatal Server Startup Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
