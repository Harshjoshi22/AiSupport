import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import chatRoutes from './routes/chat.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import adminRoutes from './routes/admin.routes.js';
import agentRoutes from './routes/agent.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Import Middleware
import { errorHandler } from './middleware/error.middleware.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, '')) : []),
];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, postman, server-to-server)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed =
      allowedOrigins.includes(cleanOrigin) ||
      /\.vercel\.app$/.test(cleanOrigin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for fallback file downloads
app.use('/uploads', express.static(path.resolve('uploads')));

// Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', generalLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI SupportHub API',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Route Handler
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find route ${req.originalUrl} on this server`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
