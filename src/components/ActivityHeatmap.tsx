import React from 'react';
import { PMOActivity, PMOMember } from '../types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { motion } from 'motion/react';

interface ActivityHeatmapProps {
  activities: PMOActivity[];
  members: PMOMember[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ activities, members }) => {
  const last7Days = [...Array(7)].map((_, i) => subDays(startOfDay(new Date()), i)).reverse();

  return (
    <div className="bg-[#0f1219] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-sm">Team Activity Heatmap</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-mono">Last 7 Days Steering Activity</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-slate-800/50" />
            <div className="w-2 h-2 rounded-sm bg-indigo-900/30" />
            <div className="w-2 h-2 rounded-sm bg-indigo-700/50" />
            <div className="w-2 h-2 rounded-sm bg-indigo-500" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <div />
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map(day => (
                <div key={day.toISOString()} className="text-[10px] font-mono text-slate-500 text-center">
                  {format(day, 'EEE')}
                  <div className="text-[9px] opacity-50">{format(day, 'MMM d')}</div>
                </div>
              ))}
            </div>

            {members.map(member => (
              <React.Fragment key={member.name}>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 uppercase">
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] text-slate-200 font-medium truncate">{member.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono truncate uppercase">{member.role.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {last7Days.map(day => {
                    const dayActivities = activities.filter(a => 
                      (a.userId === member.email || a.userId === member.phone || (a.userName === member.name)) &&
                      isSameDay(new Date(a.timestamp), day)
                    );
                    const count = dayActivities.length;
                    
                    let bgColor = 'bg-slate-800/20';
                    if (count > 0 && count <= 2) bgColor = 'bg-indigo-900/40';
                    if (count > 2 && count <= 5) bgColor = 'bg-indigo-700/60';
                    if (count > 5) bgColor = 'bg-indigo-500';

                    return (
                      <motion.div
                        key={day.toISOString()}
                        whileHover={{ scale: 1.05 }}
                        className={`h-8 rounded-sm ${bgColor} border border-white/5 relative group cursor-help transition-colors`}
                      >
                        {count > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {count} activities on {format(day, 'MMM d')}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
