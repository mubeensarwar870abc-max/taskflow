import React, { useState, useEffect } from 'react';
import { Task, Project, TaskStatus, TaskPriority, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
  projectId?: string;
  defaultStatus?: TaskStatus;
  projects?: Project[];
  members?: User[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId: initialProjectId,
  defaultStatus = 'todo',
  projects = [],
  members = [],
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || (projects[0]?._id || ''));
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>(members);
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load team members if none passed, ensuring current user is always present
  useEffect(() => {
    if (members && members.length > 0) {
      setTeamMembers(members);
    } else if (isOpen) {
      api
        .getUsers()
        .then((res: any) => {
          const list = res.users || res.members || [];
          if (list.length > 0) {
            setTeamMembers(list);
          } else if (user) {
            setTeamMembers([user]);
          }
        })
        .catch(() => {
          if (user) setTeamMembers([user]);
        });
    }
  }, [members, isOpen, user]);

  // Pre-select current user as default assignee when opening modal
  useEffect(() => {
    if (isOpen && user && selectedAssignees.length === 0) {
      const myId = user._id || user.id;
      if (myId) {
        setSelectedAssignees([myId]);
      }
    }
  }, [isOpen, user]);

  const targetProjectId = initialProjectId || selectedProjectId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!targetProjectId) {
      setError('Please select a project');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res = await api.createTask(targetProjectId, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignees: selectedAssignees,
        labels,
      });

      onTaskCreated(res.task);
      // Reset
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedAssignees([]);
      setLabels([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLabel = () => {
    if (!labelInput.trim()) return;
    if (!labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
    }
    setLabelInput('');
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="e.g. Design modern mobile onboarding screens"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {!initialProjectId && projects.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Assignees */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Assign to Team Members
            </label>
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
              {selectedAssignees.length === 0 ? 'Assigned to you by default' : `${selectedAssignees.length} assigned`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
            {teamMembers.map((m) => {
              const mId = m.id || (m as any)._id;
              const isSelected = selectedAssignees.includes(mId);
              const isMe = user && (user._id === mId || user.id === mId);
              return (
                <button
                  key={mId}
                  type="button"
                  onClick={() => toggleAssignee(mId)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-400/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Avatar name={m.name} src={m.avatar} size="xs" />
                  <span>
                    {m.name} {isMe ? '(You)' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          label="Description"
          placeholder="Detailed task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Labels */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Labels
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add label (e.g. Design, Frontend, API)..."
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              className="flex-1 bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddLabel}>
              Add
            </Button>
          </div>
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => (
                <span
                  key={l}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium"
                >
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
