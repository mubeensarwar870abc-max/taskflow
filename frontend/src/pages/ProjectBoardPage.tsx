import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Users,
  Search,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Project, Task, TaskStatus, TaskPriority, User } from '../types';
import { Header } from '../components/layout/Header';
import { KanbanColumn } from '../components/board/KanbanColumn';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { InviteMemberModal } from '../components/modals/InviteMemberModal';

export const ProjectBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { socket, joinProject, leaveProject } = useSocket();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchProjectAndTasks = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        api.getProjectById(projectId),
        api.getProjectTasks(projectId),
      ]);
      setProject(projRes.project);
      setTasks(tasksRes.tasks || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error loading project board');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  // Connect to project's Socket.IO room for real-time collaboration
  useEffect(() => {
    if (!projectId || !socket) return;

    joinProject(projectId);

    const handleTaskCreated = (newTask: Task) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [...prev, newTask];
      });
    };

    const handleTaskStatusChanged = (data: { taskId: string; status: TaskStatus; task: Task }) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === data.taskId ? { ...t, status: data.status } : t))
      );
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      if (selectedTask && selectedTask._id === updatedTask._id) {
        setSelectedTask(updatedTask);
      }
    };

    const handleTaskDeleted = (data: { taskId: string }) => {
      setTasks((prev) => prev.filter((t) => t._id !== data.taskId));
      if (selectedTask && selectedTask._id === data.taskId) {
        setSelectedTask(null);
      }
    };

    const handleMemberAdded = () => {
      api.getProjectById(projectId).then((res) => {
        if (res.project) setProject(res.project);
      });
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:status_changed', handleTaskStatusChanged);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('project:member_added', handleMemberAdded);

    return () => {
      leaveProject(projectId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:status_changed', handleTaskStatusChanged);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('project:member_added', handleMemberAdded);
    };
  }, [projectId, socket, selectedTask]);

  // Handle Drag & Drop status transition
  const handleDropTask = async (taskId: string, targetStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await api.updateTaskStatus(taskId, { status: targetStatus });
    } catch (err) {
      console.error('Failed to update task status in backend:', err);
      // Revert if error
      fetchProjectAndTasks();
    }
  };

  const handleOpenAddTask = (columnStatus: TaskStatus) => {
    setDefaultColumnStatus(columnStatus);
    setIsCreateTaskOpen(true);
  };

  const columns: Array<{ id: TaskStatus; title: string; color: string }> = [
    { id: 'backlog', title: 'Backlog', color: '#94A3B8' },
    { id: 'todo', title: 'To Do', color: '#3B82F6' },
    { id: 'in_progress', title: 'In Progress', color: '#8B5CF6' },
    { id: 'in_review', title: 'In Review', color: '#F59E0B' },
    { id: 'done', title: 'Done', color: '#10B981' },
  ];

  const projectMembersList = (project?.members || []).map((m: any) => m.user);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      {/* Top Header */}
      <Header
        title={project?.name || 'Project Board'}
        subtitle="Kanban Board"
        searchValue={search}
        onSearchChange={setSearch}
        onOpenNewTaskModal={() => handleOpenAddTask('todo')}
      />

      {/* Sub-bar: Back button, Project Members, Priority Filters */}
      <div className="px-4 md:px-8 py-3 bg-white dark:bg-[#161B30] border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project?.color || '#6D5BD0' }}
            />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {project?.name}
            </span>
          </div>

          {/* Member Stack + Add Member Button */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-center -space-x-1.5">
              {projectMembersList.slice(0, 4).map((m: any, idx: number) => (
                <Avatar key={idx} name={m?.name} src={m?.avatar} size="xs" />
              ))}
            </div>

            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              <UserPlus className="w-3 h-3" />
              Invite
            </button>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1C223C] p-1 rounded-2xl">
          {['all', 'low', 'medium', 'high', 'urgent'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer capitalize ${
                priorityFilter === p
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto overflow-y-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : (
          <div className="flex gap-4 sm:gap-5 h-full items-start">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                tasks={filteredTasks.filter((t) => t.status === col.id)}
                onTaskClick={(task) => setSelectedTask(task)}
                onAddTask={handleOpenAddTask}
                onDropTask={handleDropTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={projectId}
        defaultStatus={defaultColumnStatus}
        members={projectMembersList as any}
        onTaskCreated={(newTask) => setTasks((prev) => [...prev, newTask])}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        projectMembers={projectMembersList as any}
        onTaskUpdated={(updatedTask) =>
          setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)))
        }
        onTaskDeleted={(deletedId) => setTasks((prev) => prev.filter((t) => t._id !== deletedId))}
      />

      {projectId && (
        <InviteMemberModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          projectId={projectId}
          existingMemberIds={projectMembersList.map((m: any) => m?.id || m?._id)}
          onMemberAdded={fetchProjectAndTasks}
        />
      )}
    </div>
  );
};
