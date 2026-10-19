import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, MoreHorizontal, Clock, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Partial<Project>;
  index?: number;
  animatedBorder?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index = 0,
  animatedBorder = true,
}) => {
  const navigate = useNavigate();

  const progress = project.progress !== undefined ? project.progress : 0;
  const total = project.totalTasks || 0;
  const completed = project.completedTasks || 0;
  const daysLeft = project.daysLeft;

  // Determine animated border theme based on project color or position index
  const getBorderClass = () => {
    const color = (project.color || '').toLowerCase();
    if (color.includes('10b981') || color.includes('emerald') || color.includes('green')) {
      return 'card-border-emerald';
    }
    if (
      color.includes('ec4899') ||
      color.includes('db2777') ||
      color.includes('pink') ||
      color.includes('rose') ||
      color.includes('red')
    ) {
      return 'card-border-pink';
    }
    if (
      color.includes('3b82f6') ||
      color.includes('2563eb') ||
      color.includes('blue') ||
      color.includes('cyan')
    ) {
      return 'card-border-blue';
    }
    if (
      color.includes('6d5bd0') ||
      color.includes('7c3aed') ||
      color.includes('purple') ||
      color.includes('indigo')
    ) {
      return 'card-border-purple';
    }

    const palette = [
      'card-border-purple',
      'card-border-blue',
      'card-border-pink',
      'card-border-emerald',
    ];
    return palette[index % palette.length];
  };

  const borderClass = getBorderClass();

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className={`h-full bg-white dark:bg-[#191E35] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xs hover:shadow-md hover:shadow-indigo-900/5 dark:hover:shadow-black/30 ${
        animatedBorder
          ? `card-animated-border ${borderClass}`
          : 'border border-slate-100 dark:border-slate-800'
      } transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]`}
    >
      <div>
        {/* Header: Squircle Badge + Options */}
        <div className="flex items-center justify-between mb-1.5">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 flex-shrink-0"
            style={{ backgroundColor: project.color || '#6D5BD0' }}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project._id}`);
            }}
            className="p-1 rounded-full text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer flex-shrink-0"
          >
            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight truncate leading-tight">
          {project.name}
        </h4>
        <p className="text-[9px] sm:text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {project.description || 'Sprint deliverables and milestones'}
        </p>

        {/* Progress Bar & Percentage */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[9px] sm:text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">
              Progress
            </span>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
              {progress}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: project.color || '#6D5BD0',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Chips */}
      <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 truncate">
          <CheckCircle2 className="w-2.5 h-2.5 text-brand-500 flex-shrink-0" />
          {completed}/{total} tasks
        </span>

        {daysLeft !== undefined && daysLeft !== null ? (
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
              daysLeft < 3
                ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Clock className="w-2.5 h-2.5" />
            {daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
            Active
          </span>
        )}
      </div>
    </div>
  );
};
