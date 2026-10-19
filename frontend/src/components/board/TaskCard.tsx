import React from 'react';
import { Clock, MessageSquare, CheckSquare, MoreVertical, GripVertical } from 'lucide-react';
import { Task } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onMoveToColumn?: (taskId: string, targetStatus: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onMoveToColumn }) => {
  const completedChecklist = (task.checklist || []).filter((item) => item.completed).length;
  const totalChecklist = (task.checklist || []).length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white dark:bg-[#1A2035] hover:bg-slate-50/80 dark:hover:bg-[#202742] rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/60 dark:border-slate-800 transition-all duration-150 cursor-pointer group select-none relative"
    >
      {/* Top Header: Priority Badge + Labels */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} size="sm" />
          {(task.labels || []).slice(0, 2).map((label, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="text-slate-300 group-hover:text-slate-400 dark:text-slate-600 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2 leading-snug">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Checklist Progress */}
      {totalChecklist > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-medium">
          <CheckSquare className="w-3.5 h-3.5 text-brand-500" />
          <span>
            {completedChecklist}/{totalChecklist} completed
          </span>
        </div>
      )}

      {/* Footer: Due date, comments, and Assignee Avatars */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue ? 'text-red-500 dark:text-red-400 font-semibold' : ''
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {new Date(task.dueDate).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Assignee Avatar Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {(task.assignees || []).slice(0, 3).map((assignee, idx) => (
            <Avatar
              key={assignee.id || (assignee as any)._id || idx}
              name={assignee.name}
              src={assignee.avatar}
              size="xs"
            />
          ))}
          {(task.assignees || []).length > 3 && (
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
              +{task.assignees.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
