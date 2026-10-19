import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban, ArrowRight, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { Header } from '../components/layout/Header';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProjects();
      setProjects(res.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="Projects & Boards"
        subtitle="Workspace"
        searchValue={search}
        onSearchChange={setSearch}
        onOpenNewProjectModal={() => setIsCreateOpen(true)}
      />

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Controls Bar: Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A2035] p-1 rounded-2xl">
            {['all', 'in_progress', 'planning', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Projects' : st.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#191E35] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              No projects found
            </h4>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Get started by creating your first collaborative project workspace.
            </p>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const isOwner = user?.id === p.owner?.id || user?.id === (p.owner as any)?._id;
              const progress = p.progress || 0;

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  className="bg-white dark:bg-[#191E35] rounded-[30px] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 dark:hover:shadow-black/30 border border-slate-100 dark:border-slate-800 transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: p.color || '#6D5BD0' }}
                      >
                        <FolderKanban className="w-6 h-6" />
                      </div>

                      {isOwner && (
                        <button
                          onClick={(e) => handleDeleteProject(p._id, e)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description || 'Collaborative team sprint workspace'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">Progress</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: p.color || '#6D5BD0',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    {/* Member Avatars */}
                    <div className="flex items-center -space-x-1.5">
                      {(p.members || []).slice(0, 4).map((m: any, idx: number) => (
                        <Avatar
                          key={idx}
                          name={m.user?.name}
                          src={m.user?.avatar}
                          size="xs"
                        />
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                      Open Board <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
        }}
      />
    </div>
  );
};
