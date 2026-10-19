import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, Sparkles } from 'lucide-react';

interface OverviewWidgetProps {
  data?: Array<{ month: string; completed: number; target: number }>;
  totalHours?: number;
  completedTasks?: number;
  targetTasks?: number;
}

export const OverviewWidget: React.FC<OverviewWidgetProps> = ({
  data = [
    { month: 'Jan', completed: 18, target: 25 },
    { month: 'Feb', completed: 24, target: 28 },
    { month: 'Mar', completed: 32, target: 35 },
    { month: 'Apr', completed: 58, target: 50 },
    { month: 'May', completed: 42, target: 45 },
    { month: 'Jun', completed: 64, target: 60 },
    { month: 'Jul', completed: 48, target: 55 },
    { month: 'Aug', completed: 72, target: 70 },
    { month: 'Sep', completed: 68, target: 65 },
    { month: 'Oct', completed: 86, target: 90 },
  ],
  totalHours = 748,
  completedTasks = 86,
  targetTasks = 95,
}) => {
  const [period, setPeriod] = useState<'Monthly' | 'Weekly'>('Monthly');

  // Custom sleek tooltip matching reference image
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10">
          <p className="font-semibold text-accent-pink">{label}</p>
          <p className="text-white font-bold">{payload[0].value} Completed</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#4E3FA9] via-[#5C4DBF] to-[#453696] text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-md shadow-indigo-950/20 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent-pink/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Title + Period Selector */}
      <div className="flex items-center justify-between mb-1 relative z-10">
        <div>
          <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white/95 flex items-center gap-1.5">
            Overview
            <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/15 text-pink-200">
              <Sparkles className="w-2.5 h-2.5 text-pink-300" /> Live
            </span>
          </h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setPeriod((prev) => (prev === 'Monthly' ? 'Weekly' : 'Monthly'))}
            className="flex items-center gap-1 text-[10px] bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-full text-white/90 font-medium transition-all cursor-pointer backdrop-blur-sm"
          >
            <span>{period}</span>
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-28 sm:h-32 lg:h-[125px] w-full my-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.65)', fontSize: 9 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 8.5 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#F472B6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#velocityGradient)"
              dot={{ fill: '#FFFFFF', stroke: '#EC4899', strokeWidth: 2, r: 2.5 }}
              activeDot={{ fill: '#EC4899', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 3 Metrics (matching the reference footer) */}
      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/10 relative z-10 text-center">
        <div className="p-0.5">
          <p className="text-[8.5px] text-white/60 uppercase font-medium truncate">Logged</p>
          <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{totalHours} Hr</p>
          <p className="text-[8px] text-white/50 truncate">Sprint</p>
        </div>

        <div className="p-0.5 border-x border-white/10">
          <p className="text-[8.5px] text-white/60 uppercase font-medium truncate">Done</p>
          <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5 truncate">{completedTasks} T</p>
          <p className="text-[8px] text-emerald-300 font-medium truncate">On Track</p>
        </div>

        <div className="p-0.5">
          <p className="text-[8.5px] text-white/60 uppercase font-medium truncate">Goal</p>
          <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{targetTasks} T</p>
          <p className="text-[8px] text-pink-300 font-medium truncate">Target</p>
        </div>
      </div>
    </div>
  );
};
