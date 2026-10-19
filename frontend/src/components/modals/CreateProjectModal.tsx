import React, { useState } from 'react';
import { Project } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6D5BD0');
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'completed'>('in_progress');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    { label: 'Royal Purple', hex: '#6D5BD0' },
    { label: 'Ocean Blue', hex: '#3B82F6' },
    { label: 'Vibrant Pink', hex: '#EC4899' },
    { label: 'Emerald Green', hex: '#10B981' },
    { label: 'Amber Gold', hex: '#F59E0B' },
    { label: 'Indigo Night', hex: '#6366F1' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res = await api.createProject({
        name: name.trim(),
        description: description.trim(),
        color,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      onProjectCreated(res.project);
      setName('');
      setDescription('');
      setStartDate('');
      setDueDate('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Project Name"
          placeholder="e.g. Mobile App Redesign v2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="What is the objective and scope of this project?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Color Palette Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Project Theme Color
          </label>
          <div className="flex items-center gap-3">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                  color === c.hex ? 'scale-125 ring-3 ring-offset-2 ring-brand-500 shadow-md' : 'hover:scale-110'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Target Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
