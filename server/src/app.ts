import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import orgRoutes from './routes/orgRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import departmentRoutes from './routes/departmentRoutes';

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || config.cors.clientUrls.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', orgRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'EMS API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    debug: {
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path
    }
  });
});

// ============================================
// GLOBAL ERROR HANDLER (must be last)
// ============================================
app.use(errorHandler);

export default app;
