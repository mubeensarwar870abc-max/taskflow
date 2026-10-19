import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Shield, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { Header } from '../components/layout/Header';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';

export const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="Team Directory"
        subtitle="Collaborators"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing {filteredUsers.length} team members
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#191E35] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              No team members match your search
            </h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((u) => {
              const id = u.id || (u as any)._id;
              return (
                <div
                  key={id}
                  className="bg-white dark:bg-[#191E35] rounded-[30px] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 dark:hover:shadow-black/30 border border-slate-100 dark:border-slate-800 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={u.name} src={u.avatar} size="lg" online />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {u.name}
                        </h4>
                        <Badge variant={u.role === 'admin' ? 'purple' : 'gray'} size="sm">
                          {u.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-brand-500" />
                      Collaborator
                    </span>
                    {u.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(u.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
