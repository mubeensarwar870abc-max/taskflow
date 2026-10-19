import React, { useState } from 'react';
import { MessageSquare, Radio, Users, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { User, ActivityItem } from '../../types';
import { useNavigate } from 'react-router-dom';

interface RightCollaborationPanelProps {
  members?: User[];
  activities?: ActivityItem[];
  onOpenInviteModal?: () => void;
}

export const RightCollaborationPanel: React.FC<RightCollaborationPanelProps> = ({
  members = [],
  activities = [],
  onOpenInviteModal,
}) => {
  const [tab, setTab] = useState<'Activities' | 'Online'>('Activities');
  const navigate = useNavigate();

  const defaultMembers = [
    {
      id: '1',
      name: 'Max Stone',
      role: 'Project Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'Active on Sprint',
    },
    {
      id: '2',
      name: 'Grisha Jack',
      role: 'Lead Designer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      status: 'Reviewing UI',
    },
    {
      id: '3',
      name: 'Levi Patrick',
      role: 'Backend Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'Testing APIs',
    },
    {
      id: '4',
      name: 'Cody Bryan',
      role: 'Frontend Dev',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      status: 'Pushing Commits',
    },
  ];

  const defaultActivities: ActivityItem[] = [
    {
      _id: 'act-1',
      actor: { id: 'u1', name: 'Sarah Connor', email: 'sarah@taskflow.dev', role: 'member', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      action: 'created_task',
      project: { _id: 'p1', name: 'Design System & UI Kit', color: '#6D5BD0' },
      metadata: { taskTitle: 'Mobile Wireframe Specs' },
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      _id: 'act-2',
      actor: { id: 'u2', name: 'Max Stone', email: 'max@taskflow.dev', role: 'admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      action: 'task_status_changed',
      project: { _id: 'p2', name: 'Cloud Infrastructure', color: '#3B82F6' },
      metadata: { newStatus: 'In Review' },
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      _id: 'act-3',
      actor: { id: 'u3', name: 'Grisha Jack', email: 'grisha@taskflow.dev', role: 'member', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
      action: 'added_comment',
      project: { _id: 'p3', name: 'Mobile App Redesign', color: '#EC4899' },
      metadata: { taskTitle: 'API Gateway Endpoint' },
      createdAt: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
    },
    {
      _id: 'act-4',
      actor: { id: 'u4', name: 'Levi Patrick', email: 'levi@taskflow.dev', role: 'member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      action: 'created_project',
      project: { _id: 'p2', name: 'Cloud Infrastructure', color: '#3B82F6' },
      metadata: { projectName: 'Cloud Infrastructure' },
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];

  const displayMembers = members.length > 0
    ? members.map((m, idx) => ({
        id: m.id || m._id || String(idx),
        name: m.name,
        role: m.role === 'admin' ? 'Project Lead' : 'Team Member',
        avatar: m.avatar,
        status: 'Online',
      }))
    : defaultMembers;

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const formatActivityAction = (act: ActivityItem) => {
    switch (act.action) {
      case 'created_task':
        return `created task "${act.metadata?.taskTitle || 'new task'}"`;
      case 'task_status_changed':
        return `moved task to ${act.metadata?.newStatus || 'new status'}`;
      case 'added_comment':
        return `commented on "${act.metadata?.taskTitle || 'task'}"`;
      case 'created_project':
        return `created project "${act.metadata?.projectName || 'new project'}"`;
      case 'added_member':
        return `added ${act.metadata?.memberName || 'new member'}`;
      default:
        return act.action.replace('_', ' ');
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-2.5">
      {/* Portion 1: Team Activities Card */}
      <div className="bg-white dark:bg-[#191E35] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              Team Activities
            </h3>
          </div>
          <button
            onClick={() => navigate('/team')}
            className="text-[10px] sm:text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-[#F5F6FC] dark:bg-[#1C223C] p-0.5 rounded-lg mb-2">
          <button
            onClick={() => setTab('Activities')}
            className={`flex-1 text-[10px] font-semibold py-0.5 rounded-md transition-all cursor-pointer ${
              tab === 'Activities'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setTab('Online')}
            className={`flex-1 text-[10px] font-semibold py-0.5 rounded-md transition-all cursor-pointer ${
              tab === 'Online'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Members
          </button>
        </div>

        {/* Activities / Members List */}
        {tab === 'Activities' ? (
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {displayActivities.slice(0, 4).map((act) => (
              <div
                key={act._id}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-2"
              >
                <Avatar name={act.actor?.name || 'Member'} src={act.actor?.avatar} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-700 dark:text-slate-200 leading-tight">
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {act.actor?.name}
                    </strong>{' '}
                    {formatActivityAction(act)}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {new Date(act.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {displayMembers.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={m.name} src={m.avatar} size="xs" online />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                      {m.name}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                      {m.status}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/team')}
                  className="p-1 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors cursor-pointer"
                  title="Open Team Discussion"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portion 2: Live Stream Card */}
      <div className="bg-white dark:bg-[#191E35] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-accent-pink animate-pulse" />
            <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Live Stream
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live
          </span>
        </div>

        {/* Live Stream Event Stream Cards */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {displayActivities.slice(0, 3).map((act) => (
            <div
              key={act._id}
              className="p-1.5 rounded-lg bg-[#F5F6FC] dark:bg-[#1C223C] border border-slate-100 dark:border-slate-800/60 flex items-start gap-2"
            >
              <Avatar name={act.actor?.name || 'Member'} src={act.actor?.avatar} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-700 dark:text-slate-200 leading-tight">
                  <strong className="font-semibold text-slate-900 dark:text-white">
                    {act.actor?.name}
                  </strong>{' '}
                  {formatActivityAction(act)}
                </p>
                <p className="text-[8.5px] text-slate-400 mt-0.5">
                  {new Date(act.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
