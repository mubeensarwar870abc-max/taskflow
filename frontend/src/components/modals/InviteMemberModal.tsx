import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Search, UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMemberIds?: string[];
  onMemberAdded: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  existingMemberIds = [],
  onMemberAdded,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter((u) => {
    const id = u.id || (u as any)._id;
    const isAlreadyMember = existingMemberIds.includes(id);
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return !isAlreadyMember && matchesSearch;
  });

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError('Please select a user to add');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await api.addProjectMember(projectId, { userId: selectedUserId, role });
      onMemberAdded();
      setSelectedUserId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member to project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member" maxWidth="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-xs rounded-2xl pl-9 pr-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* User Selection List */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Select Member ({filteredUsers.length} available)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No users found or all users are already project members.
              </p>
            ) : (
              filteredUsers.map((u) => {
                const id = u.id || (u as any)._id;
                const isSelected = selectedUserId === id;
                return (
                  <div
                    key={id}
                    onClick={() => setSelectedUserId(id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-[#1A2035] hover:bg-slate-50 dark:hover:bg-[#202742] border border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatar} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Project Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-2xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="member">Member (Can edit tasks and comment)</option>
            <option value="admin">Admin (Can manage project settings and members)</option>
            <option value="viewer">Viewer (Read-only access)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddMember}
            isLoading={isLoading}
            disabled={!selectedUserId}
          >
            Add Member
          </Button>
        </div>
      </div>
    </Modal>
  );
};
