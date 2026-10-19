import React from 'react';
import { Zap, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SprintCardProps {
  velocity?: number;
  activeCount?: number;
  sprintName?: string;
}

export const SprintCard: React.FC<SprintCardProps> = ({
  velocity = 92,
  activeCount = 14,
  sprintName = 'Sprint 4 — Delivery',
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/projects')}
      className="h-full bg-gradient-to-br from-[#6D5BD0] via-[#5D4CBF] to-[#4F3FA6] hover:from-[#6552C9] hover:to-[#49399C] text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md shadow-indigo-900/15 flex flex-col justify-between cursor-pointer transition-all duration-200 group active:scale-[0.99] relative overflow-hidden"
    >
      {/* Top Header: Badge + Action & Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-xs group-hover:scale-105 transition-transform flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-pink-300" />
          </div>
          <div className="w-5 h-5 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-transform group-hover:translate-x-0.5 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>

        <h4 className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate leading-tight">
          Active Sprints
        </h4>
        <p className="text-[9px] text-purple-200 truncate mt-0.5">{sprintName}</p>
      </div>

      {/* Middle Metric: Velocity & Progress */}
      <div className="my-1 p-1.5 rounded-lg bg-white/10 backdrop-blur-xs">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[9px] text-purple-200 font-medium">Velocity</span>
          <span className="text-[10px] font-extrabold text-white flex items-center gap-0.5">
            <ArrowUpRight className="w-2.5 h-2.5 text-emerald-300" />
            {velocity}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-pink-400 transition-all duration-500"
            style={{ width: `${velocity}%` }}
          />
        </div>
        <p className="text-[8.5px] text-purple-200 mt-1 font-medium truncate">
          {activeCount} tasks in progress
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="pt-1 border-t border-white/15 flex items-center justify-between">
        <span className="text-[8.5px] text-purple-200 uppercase tracking-wider font-semibold truncate">
          Goal
        </span>
        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-white text-[#5B4DBF] shadow-xs flex-shrink-0">
          On Track
        </span>
      </div>
    </div>
  );
};
