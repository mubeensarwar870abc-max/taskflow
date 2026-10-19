import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Sparkles, ArrowRight, Lock, Mail, User } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await register({ name, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEBFA] dark:bg-[#0C0F1D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#15192E] rounded-[36px] shadow-2xl p-8 border border-white/80 dark:border-white/5 relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-brand-600 text-white shadow-glow-purple mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Join your team on TaskFlow platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Sarah Connor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@taskflow.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
