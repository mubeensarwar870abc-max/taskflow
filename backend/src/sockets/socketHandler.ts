import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { Project } from '../models/Project';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required for WebSocket connection'));
      }

      const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;
      socket.data.user = decoded;
      next();
    } catch (err: any) {
      console.warn('[Socket Auth] Authentication failed:', err.message);
      return next(new Error('Invalid or expired socket authentication token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;
    console.log(`[Socket] Client connected: socketId=${socket.id}, userId=${userId}`);

    // Join personal user room for targeted notifications
    if (userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      console.log(`[Socket] User ${userId} joined room ${userRoom}`);
    }

    // Join a project room with verification
    socket.on('project:join', async (data: { projectId: string }, callback?: (res: any) => void) => {
      try {
        const { projectId } = data;
        if (!projectId) {
          if (callback) callback({ success: false, error: 'Project ID is required' });
          return;
        }

        const project = await Project.findById(projectId);
        if (!project) {
          if (callback) callback({ success: false, error: 'Project not found' });
          return;
        }

        // Verify user is owner or member
        const isOwner = project.owner.toString() === userId;
        const isMember = project.members.some((m) => m.user.toString() === userId);
        const isAdmin = socket.data.user?.role === 'admin';

        if (!isOwner && !isMember && !isAdmin) {
          console.warn(`[Socket Security] User ${userId} unauthorized to join project:${projectId}`);
          if (callback) callback({ success: false, error: 'Unauthorized to join project room' });
          return;
        }

        const projectRoom = `project:${projectId}`;
        socket.join(projectRoom);
        console.log(`[Socket] User ${userId} joined room ${projectRoom}`);
        if (callback) callback({ success: true, room: projectRoom });
      } catch (error: any) {
        console.error('[Socket] Error in project:join:', error);
        if (callback) callback({ success: false, error: 'Server error joining room' });
      }
    });

    // Leave a project room
    socket.on('project:leave', (data: { projectId: string }) => {
      if (data?.projectId) {
        const projectRoom = `project:${data.projectId}`;
        socket.leave(projectRoom);
        console.log(`[Socket] User ${userId} left room ${projectRoom}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: socketId=${socket.id}, reason=${reason}`);
    });
  });
};
