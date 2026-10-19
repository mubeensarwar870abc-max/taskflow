import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  color,
  onTaskClick,
  onAddTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if truly leaving column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 sm:w-80 flex-shrink-0 flex flex-col bg-[#F5F6FC] dark:bg-[#151A2E] rounded-[28px] p-3.5 transition-all duration-200 border ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 ring-2 ring-brand-500/20 scale-[1.01]'
          : 'border-transparent dark:border-slate-800/60'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1E2540] text-slate-500 dark:text-slate-400 shadow-xs">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(id)}
          className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-[#1E2540] text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px] pr-0.5 max-h-[calc(100vh-280px)]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask(id)}
            className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-800 transition-all cursor-pointer group p-2 text-center"
          >
            <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-medium">Add a task</span>
          </div>
        )}
      </div>
    </div>
  );
};
