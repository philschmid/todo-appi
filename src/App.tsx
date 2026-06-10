import { useEffect } from 'react';
import { useTodoStore } from './store/useTodoStore';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import TimerPanel from './components/TimerPanel';
import FeatureLab from './components/FeatureLab';
import AnalyticsView from './components/AnalyticsView';
import ThemeSelector from './components/ThemeSelector';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import CommandBar from './components/CommandBar';
import { MagnifyingGlass, Broom, Sparkle } from '@phosphor-icons/react';

export default function App() {
  const {
    tasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    clearCompleted,
    theme,
    accentColor,
    features
  } = useTodoStore();

  // Initialize Theme class on document Element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Count helper functions for filters
  const todayStr = new Date().toISOString().split('T')[0];
  const countAll = tasks.length;
  const countActive = tasks.filter((t) => !t.completed).length;
  const countCompleted = tasks.filter((t) => t.completed).length;
  const countToday = tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;
  const countUpcoming = tasks.filter((t) => t.dueDate > todayStr && !t.completed).length;

  // Color Maps
  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500 text-white',
    cobalt: 'bg-blue-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    violet: 'bg-violet-500 text-white',
  };

  return (
    <div className="min-h-screen pb-16 transition-colors duration-200">
      
      {/* Decorative Aurora Background glow (restrained, no slop) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] pointer-events-none overflow-hidden opacity-30 dark:opacity-20 z-0">
        <div className={`absolute -top-40 left-1/4 w-[500px] h-[300px] rounded-full blur-[120px] transition-colors duration-500 ${
          accentColor === 'rose'
            ? 'bg-rose-300 dark:bg-rose-950'
            : accentColor === 'cobalt'
            ? 'bg-blue-300 dark:bg-blue-950'
            : accentColor === 'emerald'
            ? 'bg-emerald-300 dark:bg-emerald-950'
            : 'bg-violet-300 dark:bg-violet-950'
        }`} />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Bar */}
        <header className="h-16 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 mb-8">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 shadow-xs`}>
              <Sparkle size={16} className={accentTextMap[accentColor]} weight="fill" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
                Todo.Lab
              </span>
              <span className="text-[9px] uppercase font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-650 px-1.5 py-0.5 rounded-sm border border-zinc-200/20 ml-2">
                Beta
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {features.commandBar && <CommandBar />}
            {features.keyboardShortcuts && <KeyboardShortcuts />}
            <ThemeSelector />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* PRIMARY COLUMN: Tasks */}
          <main className="lg:col-span-2 space-y-6">
            
            {/* Search and Input Container */}
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40 rounded-2xl p-5 shadow-xs backdrop-blur-xs">
              <div className="flex flex-col gap-4">
                
                {/* Search field */}
                <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/50 rounded-xl px-3 py-1.5 focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all">
                  <MagnifyingGlass size={14} className="text-zinc-400 dark:text-zinc-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    id="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks or tags... (Press '/' to focus)"
                    className="flex-1 bg-transparent border-0 outline-none text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-700 text-xs py-0.5"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono px-1.5 rounded cursor-pointer"
                    >
                      clear
                    </button>
                  )}
                </div>

                {/* Main input */}
                <TaskInput />
              </div>
            </div>

            {/* Filter Navigation & Tasks Container */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                
                {/* Filters Row */}
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { id: 'all', label: 'All', count: countAll },
                    { id: 'active', label: 'Active', count: countActive },
                    { id: 'completed', label: 'Done', count: countCompleted },
                    { id: 'today', label: 'Today', count: countToday },
                    { id: 'upcoming', label: 'Upcoming', count: countUpcoming }
                  ] as const).map((item) => {
                    const isSelected = filter === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setFilter(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? `${accentBgMap[accentColor]} shadow-xs`
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`px-1 py-0.2 rounded-md text-[9px] font-mono font-bold ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-650 border border-zinc-200/10'
                        }`}>
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Clear Completed Action */}
                {countCompleted > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors cursor-pointer select-none"
                    title="Remove all completed tasks"
                  >
                    <Broom size={13} />
                    <span>Clear completed</span>
                  </button>
                )}
              </div>

              {/* Tasks List */}
              <TaskList />
            </div>

          </main>

          {/* SECONDARY SIDEBAR: Laboratory (Pomodoro, FeatureLab, Analytics) */}
          <aside className="space-y-6">
            {features.pomodoro && <TimerPanel />}
            {features.analytics && <AnalyticsView />}
            <FeatureLab />
          </aside>

        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-zinc-250/20 dark:border-zinc-800/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 dark:text-zinc-650">
          <div className="flex items-center gap-2">
            <span>Todo.Lab · Crafted under Apache-2.0</span>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/philschmid/todo-appi" target="_blank" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              GitHub Repository
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
