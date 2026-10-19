import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { Task } from '../types';
import { Header } from '../components/layout/Header';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Empty leading slots
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Group tasks by date string YYYY-MM-DD
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dateNum = d.getDate();
        if (!tasksByDay[dateNum]) tasksByDay[dateNum] = [];
        tasksByDay[dateNum].push(task);
      }
    }
  });

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300';
      case 'high':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'medium':
        return 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-300';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header title="Project Calendar" subtitle="Timeline Schedule" />

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-[#191E35] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {monthNames[month]} {year}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="bg-white dark:bg-[#191E35] rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[100px] rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-transparent"
                  />
                );
              }

              const dayTasks = tasksByDay[day] || [];
              const todayClass = isToday(day)
                ? 'ring-2 ring-brand-500 bg-brand-50/20 dark:bg-brand-950/20 font-bold'
                : 'bg-[#F9FAFE] dark:bg-[#14182C]';

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[110px] p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-all ${todayClass} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        isToday(day)
                          ? 'w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 font-semibold'
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-20 pr-0.5">
                    {dayTasks.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTask(t)}
                        className={`text-[10px] font-semibold p-1.5 rounded-lg truncate cursor-pointer transition-transform hover:scale-102 border ${getPriorityColor(
                          t.priority
                        )}`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
