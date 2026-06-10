import { useTodoStore } from '../store/useTodoStore';
import { ChartPie, ListChecks } from '@phosphor-icons/react';

export default function AnalyticsView() {
  const { tasks, accentColor } = useTodoStore();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority counts
  const highPriority = tasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const medPriority = tasks.filter((t) => t.priority === 'medium' && !t.completed).length;
  const lowPriority = tasks.filter((t) => t.priority === 'low' && !t.completed).length;
  const noPriority = tasks.filter((t) => t.priority === 'none' && !t.completed).length;

  const priorityMax = Math.max(highPriority, medPriority, lowPriority, noPriority, 1);

  // Color Maps
  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500 dark:bg-rose-600',
    cobalt: 'bg-blue-500 dark:bg-blue-600',
    emerald: 'bg-emerald-500 dark:bg-emerald-600',
    violet: 'bg-violet-500 dark:bg-violet-600',
  };

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl shadow-xs">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <ChartPie size={18} className={accentTextMap[accentColor]} />
        <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
          Analytics Lab
        </h3>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="flex flex-col p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/35 rounded-xl">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Total</span>
          <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{total}</span>
        </div>
        <div className="flex flex-col p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/35 rounded-xl">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Active</span>
          <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{active}</span>
        </div>
        <div className="flex flex-col p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/35 rounded-xl">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Done</span>
          <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{completed}</span>
        </div>
      </div>

      {/* Completion Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-zinc-500 font-medium">Completion Rate</span>
          <span className="font-bold font-mono text-zinc-800 dark:text-zinc-100">{completionRate}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200/20">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${accentBgMap[accentColor]}`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Priority Distribution Bar Graph */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5 flex items-center gap-1.5">
          <ListChecks size={13} />
          Active Priorities
        </h4>

        <div className="space-y-2.5">
          {/* High Priority */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-semibold text-zinc-500 text-right uppercase tracking-wider shrink-0">High</span>
            <div className="flex-1 h-3 bg-zinc-50 dark:bg-zinc-950 rounded-md overflow-hidden relative border border-zinc-200/10">
              <div
                className="h-full bg-red-500/80 rounded-md transition-all duration-300"
                style={{ width: `${(highPriority / priorityMax) * 100}%` }}
              />
            </div>
            <span className="w-4 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 text-right shrink-0">{highPriority}</span>
          </div>

          {/* Medium Priority */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-semibold text-zinc-500 text-right uppercase tracking-wider shrink-0">Med</span>
            <div className="flex-1 h-3 bg-zinc-50 dark:bg-zinc-950 rounded-md overflow-hidden relative border border-zinc-200/10">
              <div
                className="h-full bg-amber-500/80 rounded-md transition-all duration-300"
                style={{ width: `${(medPriority / priorityMax) * 100}%` }}
              />
            </div>
            <span className="w-4 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 text-right shrink-0">{medPriority}</span>
          </div>

          {/* Low Priority */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-semibold text-zinc-500 text-right uppercase tracking-wider shrink-0">Low</span>
            <div className="flex-1 h-3 bg-zinc-50 dark:bg-zinc-950 rounded-md overflow-hidden relative border border-zinc-200/10">
              <div
                className="h-full bg-zinc-400 dark:bg-zinc-600 rounded-md transition-all duration-300"
                style={{ width: `${(lowPriority / priorityMax) * 100}%` }}
              />
            </div>
            <span className="w-4 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 text-right shrink-0">{lowPriority}</span>
          </div>

          {/* No Priority */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-semibold text-zinc-500 text-right uppercase tracking-wider shrink-0">None</span>
            <div className="flex-1 h-3 bg-zinc-50 dark:bg-zinc-950 rounded-md overflow-hidden relative border border-zinc-200/10">
              <div
                className="h-full bg-zinc-200 dark:bg-zinc-800 rounded-md transition-all duration-300"
                style={{ width: `${(noPriority / priorityMax) * 100}%` }}
              />
            </div>
            <span className="w-4 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 text-right shrink-0">{noPriority}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
