import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-2xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full bg-[#F4F5FB] dark:bg-[#1A2035] border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-2xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
