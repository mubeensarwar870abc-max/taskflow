import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, ArrowUpDown, Plus } from 'lucide-react';
import { api } from '../services/api';
import { Task } from '../types';
import { Header } from '../components/layout/Header';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchMyTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMyTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleToggleTaskDone = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const res = await api.updateTaskStatus(task._id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.task : t)));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort
  const filteredTasks = tasks
    .filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());

      const now = new Date();
      if (statusFilter === 'overdue') {
        return matchesSearch && t.dueDate && new Date(t.dueDate) < now && t.status !== 'done';
      }
      if (statusFilter === 'all') return matchesSearch;
      return matchesSearch && t.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return a.title.localeCompare(b.title);
    });

  const filterTabs = [
    { id: 'all', label: 'All Tasks' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'in_review', label: 'In Review' },
    { id: 'done', label: 'Completed' },
    { id: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="My Tasks"
        subtitle="Assigned To You"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Controls: Tabs & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A2035] p-1 rounded-2xl overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-[#1A2035] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#191E35] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              No tasks match your filter
            </h4>
            <p className="text-xs text-slate-400">
              You are all caught up on your assigned work.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                !isDone;

              return (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#191E35] hover:bg-slate-50/80 dark:hover:bg-[#202744] border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all cursor-pointer group ${
                    isDone ? 'opacity-60 bg-slate-50/50 dark:bg-[#15192C]' : ''
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={(e) => handleToggleTaskDone(task, e)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 sm:mt-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4
                          className={`text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        {(task.project as any)?.name && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300">
                            {(task.project as any).name}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    {task.dueDate && (
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          isOverdue ? 'text-red-500 font-semibold' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} size="sm" />
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) =>
          setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
        }
        onTaskDeleted={(id) => setTasks((prev) => prev.filter((t) => t._id !== id))}
      />
    </div>
  );
};
