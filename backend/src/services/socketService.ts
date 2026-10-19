import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setIO = (io: SocketIOServer) => {
  ioInstance = io;
};

export const getIO = (): SocketIOServer | null => {
  return ioInstance;
};

export const emitToProject = (projectId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`project:${projectId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};
