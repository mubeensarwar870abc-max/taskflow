import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { DashboardData, Project, Task } from '../types';
import { Header } from '../components/layout/Header';
import { OverviewWidget } from '../components/dashboard/OverviewWidget';
import { StatCards } from '../components/dashboard/StatCards';
import { SprintCard } from '../components/dashboard/SprintCard';
import { PriorityCard } from '../components/dashboard/PriorityCard';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { RightCollaborationPanel } from '../components/dashboard/RightCollaborationPanel';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { FolderKanban, Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { socket } = useSocket();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDashboardOverview();
      setDashboardData(res.data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time listener: refresh overview stats when relevant socket updates arrive
  useEffect(() => {
    if (!socket) return;

    const handleTaskChange = () => {
      // Re-fetch overview lightly in background
      api.getDashboardOverview().then((res) => {
        if (res.data) setDashboardData(res.data);
      }).catch(() => {});
    };

    socket.on('task:created', handleTaskChange);
    socket.on('task:status_changed', handleTaskChange);
    socket.on('task:updated', handleTaskChange);
    socket.on('task:deleted', handleTaskChange);
    socket.on('activity:new', (newAct) => {
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentActivity: [newAct, ...prev.recentActivity.slice(0, 9)],
        };
      });
    });

    return () => {
      socket.off('task:created', handleTaskChange);
      socket.off('task:status_changed', handleTaskChange);
      socket.off('task:updated', handleTaskChange);
      socket.off('task:deleted', handleTaskChange);
    };
  }, [socket]);

  const projects = dashboardData?.projects || [];
  const velocityData = dashboardData?.analytics?.velocityChartData || [];
  const completedTasksCount = dashboardData?.summary?.completedTasks || 0;
  const totalTasksCount = dashboardData?.summary?.totalTasks || 0;

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      {/* Dashboard Top Header */}
      <Header
        title="Primary Dashboard"
        subtitle="Workspace Overview"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
        onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
      />

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-start">
            {/* Left Area: The 3 Rows (Summary, Velocity/Sprints/Focus, Active Projects) */}
            <div className="w-full md:w-[534px] xl:w-[558px] flex-shrink-0 space-y-3 sm:space-y-3.5">
              {/* Row 1: High-level Summary Metrics Strip */}
              <StatCards
                totalProjects={dashboardData?.summary?.totalProjects}
                activeProjects={dashboardData?.summary?.activeProjects}
                myPendingTasks={dashboardData?.summary?.myPendingTasks}
                completedTasks={dashboardData?.summary?.completedTasks}
              />

              {/* Row 2: Parent div containing exactly 3 child divs, aligned with Row 1's right boundary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-[534px] xl:max-w-[558px] items-stretch">
                {/* Child 1: Overview Card (Length is double of Child 2 & Child 3, spans 2 columns) */}
                <div className="sm:col-span-2 flex flex-col">
                  <OverviewWidget
                    data={velocityData}
                    totalHours={748}
                    completedTasks={completedTasksCount}
                    targetTasks={Math.max(completedTasksCount + 10, totalTasksCount)}
                  />
                </div>

                {/* Child 2: Active Sprints (Length is half of Overview, spans 1 column) */}
                <div className="sm:col-span-1 flex flex-col">
                  <SprintCard
                    velocity={92}
                    activeCount={dashboardData?.summary?.myPendingTasks || 0}
                  />
                </div>

                {/* Child 3: My Focus Tasks (Length is half of Overview, spans 1 column) */}
                <div className="sm:col-span-1 flex flex-col">
                  <PriorityCard
                    urgentCount={dashboardData?.analytics?.priorityDistribution?.urgent || 2}
                    completedHours={748}
                  />
                </div>
              </div>

              {/* Row 3: Active Projects (Exactly 3 cards with equal width/length, aligned with Row 1 & 2's right boundary) */}
              <div className="max-w-[534px] xl:max-w-[558px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Active Projects
                  </h3>
                  <button
                    onClick={() => setIsNewProjectOpen(true)}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Project
                  </button>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1A2035] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <FolderKanban className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      No projects found
                    </p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Create your first project to start organizing sprints and tasks.
                    </p>
                    <button
                      onClick={() => setIsNewProjectOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20"
                    >
                      Create Project
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 items-stretch">
                    {filteredProjects.slice(0, 3).map((proj, idx) => (
                      <ProjectCard
                        key={proj._id}
                        project={proj as any}
                        index={idx}
                        animatedBorder={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Area: Team Activities + Live Stream shifted into the available space right beside the 3 rows */}
            <div className="w-full md:flex-1 md:min-w-[280px] md:max-w-[380px] xl:max-w-[420px] flex-shrink-0">
              <RightCollaborationPanel
                activities={dashboardData?.recentActivity || []}
                onOpenInviteModal={() => setIsNewProjectOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        projects={projects as any}
        onTaskCreated={() => fetchDashboardData()}
      />

      <CreateProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onProjectCreated={() => fetchDashboardData()}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => fetchDashboardData()}
        onTaskDeleted={() => fetchDashboardData()}
      />
    </div>
  );
};
