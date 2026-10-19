import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Plus, User as UserIcon, Settings, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../common/Avatar';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNewTaskModal?: () => void;
  onOpenNewProjectModal?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Primary Dashboard',
  subtitle,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  searchValue,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-4 md:px-6 py-2.5 md:py-3 border-b border-slate-100/80 dark:border-slate-800/80 flex-shrink-0">
      {/* Title & Subtitle */}
      <div>
        {subtitle && (
          <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
            {subtitle}
          </p>
        )}
        <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>
      </div>

      {/* Right Controls: Search, New Task/Project, Theme, Notifications, Avatar */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
        {/* Search Input matching reference design */}
        <div className="relative flex-1 sm:w-52 md:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs rounded-full pl-8 pr-3.5 py-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Quick Action Button */}
        {onOpenNewTaskModal && (
          <button
            onClick={onOpenNewTaskModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        )}

        {onOpenNewProjectModal && (
          <button
            onClick={onOpenNewProjectModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-pink hover:bg-accent-pinkHover text-white text-xs font-semibold shadow-sm shadow-accent-pink/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-[#1A2035] text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
        </button>

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User Profile Pill */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" online />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#191E35] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-brand-500" />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/tasks');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-accent-pink" />
                  My Tasks
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Preferences
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
