import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onOpenNewTaskModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-16 h-14 md:h-full min-h-full self-stretch bg-[#5B4DBF] dark:bg-[#45369B] text-white flex flex-row md:flex-col items-center justify-between px-3 py-2 md:py-5 md:px-2 flex-shrink-0 z-20 shadow-lg shadow-indigo-900/10">
      {/* Top Group: Brand Logo & Featured Nav Icons appearing from the top */}
      <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 w-auto md:w-full">
        {/* Brand Icon / Logo */}
        <div className="flex items-center justify-center">
          <NavLink
            to="/"
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all group"
            title="TaskFlow"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-pink" />
            </div>
          </NavLink>
        </div>

        {/* Featured Nav Icons starting to appear from the top */}
        <nav className="flex flex-row md:flex-col items-center gap-1 md:gap-1.5 w-auto md:w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-7.5 h-7.5 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-white text-[#5B4DBF] shadow-sm shadow-black/10 font-bold scale-105'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
                title={item.name}
              >
                <Icon className="w-4 h-4" />
                {/* Tooltip */}
                <span className="hidden md:group-hover:block absolute left-12 bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-lg pointer-events-none z-50">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Group: Just the Arrow Icon anchored at the bottom of the page */}
      <div className="flex items-center justify-center md:mt-auto pt-0 md:pt-3 md:border-t md:border-white/15 w-auto md:w-full pb-0 md:pb-1">
        <button
          onClick={handleLogout}
          className="w-7.5 h-7.5 md:w-8 md:h-8 rounded-lg md:rounded-xl text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 relative group cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:group-hover:block absolute left-12 bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-lg pointer-events-none z-50">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};
