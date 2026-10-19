import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Header } from '../components/layout/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { User, Lock, Moon, Sun, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      setProfileError('');
      setProfileSuccess('');

      const res = await api.updateProfile({ name, avatar });
      updateUser(res.user);
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError('');
      setPasswordSuccess('');

      await api.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header title="Account Settings" subtitle="Preferences" />

      <div className="p-4 md:p-6 lg:p-8 max-w-4xl space-y-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#191E35] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Profile Information
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium">
                {profileError}
              </div>
            )}

            <div className="flex items-center gap-5 mb-4">
              <Avatar name={name} src={avatar} size="lg" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Profile Avatar
                </p>
                <p className="text-[11px] text-slate-400">
                  Provide an image URL or let initials be generated
                </p>
              </div>
            </div>

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs rounded-2xl px-4 py-2.5 cursor-not-allowed"
              />
            </div>

            <Input
              label="Avatar Image URL (optional)"
              placeholder="https://images.unsplash.com/..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Theme Settings Card */}
        <div className="bg-white dark:bg-[#191E35] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Sun className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Appearance & Theme
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Light Mode</p>
              <p className="text-[11px] text-slate-400">Soft lavender & white surfaces</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-6 h-6 text-brand-400 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Mode</p>
              <p className="text-[11px] text-slate-400">Deep navy & purple highlights</p>
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-[#191E35] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-5 h-5 text-accent-pink" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Security & Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium">
                {passwordError}
              </div>
            )}

            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
