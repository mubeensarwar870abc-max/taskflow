import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { initSocket, disconnectSocket } from '../services/socket';
import { NotificationItem } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  latestNotification: NotificationItem | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const sock = initSocket(token);
      setSocket(sock);

      sock.on('connect', () => {
        setIsConnected(true);
      });

      sock.on('disconnect', () => {
        setIsConnected(false);
      });

      sock.on('notification:new', (notif: NotificationItem) => {
        setLatestNotification(notif);
        setUnreadNotificationsCount((prev) => prev + 1);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  const joinProject = useCallback(
    (projectId: string) => {
      if (socket && isConnected) {
        socket.emit('project:join', { projectId });
      }
    },
    [socket, isConnected]
  );

  const leaveProject = useCallback(
    (projectId: string) => {
      if (socket && isConnected) {
        socket.emit('project:leave', { projectId });
      }
    },
    [socket, isConnected]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinProject,
        leaveProject,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        latestNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
