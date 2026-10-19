import React from 'react';
import { Target, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PriorityCardProps {
  urgentCount?: number;
  completedHours?: number;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  urgentCount = 4,
  completedHours = 748,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tasks')}
      className="h-full bg-gradient-to-br from-[#F43F5E] via-[#EC4899] to-[#E11D48] hover:from-[#FB7185] hover:to-[#BE123C] text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md shadow-pink-500/15 flex flex-col justify-between cursor-pointer transition-all duration-200 group active:scale-[0.99] relative overflow-hidden"
    >
      {/* Top Header: Badge + Action & Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-xs group-hover:scale-105 transition-transform flex-shrink-0">
            <Target className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-transform group-hover:translate-x-0.5 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>

        <h4 className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate leading-tight">
          My Focus Tasks
        </h4>
        <p className="text-[9px] text-pink-100 truncate mt-0.5">{urgentCount} urgent pending</p>
      </div>

      {/* Middle Metric: Hours & Focus Progress */}
      <div className="my-1 p-1.5 rounded-lg bg-white/15 backdrop-blur-xs">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[9px] text-pink-100 font-medium">Focus Log</span>
          <span className="text-[10px] font-extrabold text-white flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5 text-pink-200" />
            {completedHours}h
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: '80%' }}
          />
        </div>
        <p className="text-[8.5px] text-pink-100 mt-1 font-medium truncate">
          Sprint priority targets
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="pt-1 border-t border-white/20 flex items-center justify-between">
        <span className="text-[8.5px] text-pink-100 uppercase tracking-wider font-semibold truncate">
          Priority
        </span>
        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-white text-accent-pink shadow-xs flex-shrink-0">
          View Tasks
        </span>
      </div>
    </div>
  );
};
