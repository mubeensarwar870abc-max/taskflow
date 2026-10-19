import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('alex@taskflow.dev');
    setPassword('password123');
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
            Welcome to TaskFlow
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Collaborative Project Management & Real-Time Boards
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              Sign In
            </Button>
          </div>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full py-2.5 px-4 rounded-2xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold transition-all cursor-pointer"
          >
            ⚡ Auto-fill Demo Account (alex@taskflow.dev)
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};
