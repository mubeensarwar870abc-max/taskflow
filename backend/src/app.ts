import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import workspaceRoutes from './routes/workspace.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import commentRoutes from './routes/comment.routes';
import notificationRoutes from './routes/notification.routes';
import activityRoutes from './routes/activity.routes';
import dashboardRoutes from './routes/dashboard.routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin or any web origin (Netlify, localhost, etc.)
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
};
