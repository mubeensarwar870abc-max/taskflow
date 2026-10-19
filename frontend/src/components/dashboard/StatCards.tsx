import React from 'react';
import { FolderKanban, Zap, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  totalProjects?: number;
  activeProjects?: number;
  myPendingTasks?: number;
  completedTasks?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalProjects = 0,
  activeProjects = 0,
  myPendingTasks = 0,
  completedTasks = 0,
}) => {
  const cards = [
    {
      title: 'Total Projects',
      value: totalProjects,
      subtitle: 'In workspace',
      icon: FolderKanban,
      color: '#6D5BD0',
      bgLight: 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400',
      borderClass: 'card-border-purple',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      subtitle: 'In progress',
      icon: Zap,
      color: '#3B82F6',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      borderClass: 'card-border-blue',
    },
    {
      title: 'Pending Tasks',
      value: myPendingTasks,
      subtitle: 'Assigned to you',
      icon: Clock,
      color: '#EC4899',
      bgLight: 'bg-pink-50 dark:bg-pink-950/40 text-accent-pink',
      borderClass: 'card-border-pink',
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      subtitle: 'Delivered',
      icon: CheckCircle2,
      color: '#10B981',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      borderClass: 'card-border-emerald',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`w-[118px] sm:w-[126px] xl:w-[132px] flex-shrink-0 bg-white dark:bg-[#191E35] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 card-animated-border ${c.borderClass} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            style={{ minHeight: '76px' }}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                {c.title}
              </span>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bgLight}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                {c.value}
              </h4>
              <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-1 font-medium truncate">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
