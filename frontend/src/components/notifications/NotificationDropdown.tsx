import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { NotificationItem } from '../../types';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unreadNotificationsCount, setUnreadNotificationsCount, latestNotification } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // When a new notification arrives via WebSocket, prepend to list
  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => [latestNotification, ...prev]);
    }
  }, [latestNotification]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const handleClickItem = async (n: NotificationItem) => {
    if (!n.read) {
      try {
        await api.markNotificationRead(n._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
        );
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        // Continue navigation
      }
    }
    setIsOpen(false);
    if (n.entityType === 'project' && n.entityId) {
      navigate(`/projects/${n.entityId}`);
    } else if (n.entityType === 'task') {
      navigate('/tasks');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white dark:bg-[#1A2035] text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-[#222842] shadow-sm border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-pink text-[11px] font-bold text-white shadow-glow-pink animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#191E35] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Notifications
              </h4>
              {unreadNotificationsCount > 0 && (
                <span className="bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadNotificationsCount} new
                </span>
              )}
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You are all caught up! No notifications.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleClickItem(n)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 ${
                    !n.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full block ${
                        !n.read ? 'bg-accent-pink' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      title="Mark as read"
                      className="p-1 hover:text-brand-600 text-slate-400 flex-shrink-0 self-center"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
