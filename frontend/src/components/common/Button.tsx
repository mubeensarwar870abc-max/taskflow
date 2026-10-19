import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'pink' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantClasses = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 active:scale-[0.98] focus:ring-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500',
    pink:
      'bg-accent-pink hover:bg-accent-pinkHover text-white shadow-md shadow-accent-pink/30 active:scale-[0.98] focus:ring-accent-pink',
    secondary:
      'bg-brand-100 hover:bg-brand-200 text-brand-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 active:scale-[0.98] focus:ring-brand-400',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-[0.98] focus:ring-slate-400',
    danger:
      'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98] focus:ring-red-400',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2 rounded-2xl gap-2',
    lg: 'text-base px-6 py-2.5 rounded-2xl gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
