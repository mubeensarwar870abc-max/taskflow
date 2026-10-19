import React from 'react';
import { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'pink' | 'emerald' | 'amber' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    purple: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 border-brand-200/50 dark:border-brand-700/50',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200/50 dark:border-pink-800/50',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50',
    gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium border',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  switch (priority) {
    case 'urgent':
      return (
        <Badge variant="pink" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          Urgent
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="amber" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="purple" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Medium
        </Badge>
      );
    case 'low':
    default:
      return (
        <Badge variant="blue" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Low
        </Badge>
      );
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const formatStatus = (s: string) => {
    switch (s) {
      case 'backlog':
        return { label: 'Backlog', variant: 'gray' as const };
      case 'todo':
        return { label: 'To Do', variant: 'blue' as const };
      case 'in_progress':
        return { label: 'In Progress', variant: 'purple' as const };
      case 'in_review':
        return { label: 'In Review', variant: 'amber' as const };
      case 'done':
      case 'completed':
        return { label: 'Completed', variant: 'emerald' as const };
      default:
        return { label: s.replace('_', ' '), variant: 'gray' as const };
    }
  };

  const config = formatStatus(status);
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};
