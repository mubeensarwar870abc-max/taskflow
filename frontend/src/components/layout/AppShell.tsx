import React from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="h-screen w-full bg-[#ECEBFA] dark:bg-[#0C0F1D] flex items-center justify-center p-0 md:p-2 lg:p-3 overflow-hidden transition-colors duration-300">
      {/* Outer Application Frame matching the reference image's rounded bezel */}
      <div className="w-full max-w-[1600px] h-full bg-white dark:bg-[#12162B] rounded-none md:rounded-[24px] lg:rounded-[32px] shadow-2xl shadow-indigo-900/10 dark:shadow-black/50 border-0 md:border md:border-white/80 dark:md:border-white/5 flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Central Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#FAFAFE] dark:bg-[#14182E] overflow-hidden transition-colors duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};
