import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socketInstance) {
    socketInstance.disconnect();
  }

  const socketUrl =
    (import.meta.env.VITE_SOCKET_URL as string) ||
    (import.meta.env.VITE_API_URL as string) ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? window.location.origin
      : 'https://cursor-instructional-accessing-way.trycloudflare.com');

  socketInstance = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect', () => {
    console.log('[Socket] Connected to server, id:', socketInstance?.id);
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
