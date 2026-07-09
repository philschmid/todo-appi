import React, { useState, useEffect, useRef } from 'react';
import { useTodoStore, type Task } from './store/useTodoStore';

export default function App() {
  const {
    tasks,
    filter,
    selectedCategory,
    focusTaskId,
    addTask,
    deleteTask,
    toggleTask,
    updateTaskText,
    setFilter,
    setSelectedCategory,
    setFocusTaskId,
    clearCompleted
  } = useTodoStore();

  const [inputValue, setInputValue] = useState('');
  const [inputCategory, setInputCategory] = useState<Task['category']>('work');
  const [inputPriority, setInputPriority] = useState<Task['priority']>('none');

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Hide Completed state (persisted in localStorage or transient, let's keep it in local state or persist to keep it convenient)
  const [hideCompleted, setHideCompleted] = useState(() => {
    try {
      return localStorage.getItem('minimal_todo_hide_completed') === 'true';
    } catch {
      return false;
    }
  });

  // Sorting state: 'newest' | 'oldest'
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>(() => {
    try {
      return (localStorage.getItem('minimal_todo_sort_by') as 'newest' | 'oldest') || 'newest';
    } catch {
      return 'newest';
    }
  });

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('minimal_todo_dark_mode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Inline edit state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sync hideCompleted to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('minimal_todo_hide_completed', String(hideCompleted));
    } catch {}
  }, [hideCompleted]);

  // Sync sortBy to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('minimal_todo_sort_by', sortBy);
    } catch {}
  }, [sortBy]);

  // Sync Dark Mode class & localStorage
  useEffect(() => {
    try {
      localStorage.setItem('minimal_todo_dark_mode', String(isDarkMode));
    } catch {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Focus editing input when active
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  // Shortcut key to focus input on "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      
      if (e.key === '/') {
        e.preventDefault();
        const mainInput = document.getElementById('main-task-input');
        if (mainInput) mainInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addTask(inputValue, inputCategory, inputPriority);
    setInputValue('');
    setInputPriority('none');
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      updateTaskText(id, editingText);
    }
    setEditingTaskId(null);
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  // Helper to format Date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Filter tasks based on criteria
  const getProcessedTasks = () => {
    let list = [...tasks];

    // Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((task) => task.category === selectedCategory);
    }

    // Active/Completed Filter
    if (filter === 'active') {
      list = list.filter((task) => !task.completed);
    } else if (filter === 'completed') {
      list = list.filter((task) => task.completed);
    }

    // Hide Completed Toggle
    if (hideCompleted) {
      list = list.filter((task) => !task.completed);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((task) => task.text.toLowerCase().includes(q));
    }

    // Sorting
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  };

  const filteredTasks = getProcessedTasks();
  const activeTaskCount = tasks.filter((t) => !t.completed).length;
  const completedTaskCount = tasks.filter((t) => t.completed).length;

  const categoryPills: Record<Task['category'], { bg: string; text: string; darkBg: string; darkText: string }> = {
    urgent: { bg: 'bg-[#FDEBEC]', text: 'text-[#9F2F2D]', darkBg: 'bg-[#401311]', darkText: 'text-[#FFA19E]' },
    work: { bg: 'bg-[#E1F3FE]', text: 'text-[#1F6C9F]', darkBg: 'bg-[#0E3552]', darkText: 'text-[#9AD8FF]' },
    personal: { bg: 'bg-[#EDF3EC]', text: 'text-[#346538]', darkBg: 'bg-[#18361B]', darkText: 'text-[#A3E5AA]' },
    ideas: { bg: 'bg-[#FBF3DB]', text: 'text-[#956400]', darkBg: 'bg-[#412B00]', darkText: 'text-[#FFD875]' }
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'No Priority'
  };

  // If focus mode is active, fetch focused task
  const focusedTask = tasks.find(t => t.id === focusTaskId);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-16 sm:py-24 selection:bg-[#E1F3FE] dark:selection:bg-[#0E3552] selection:text-[#1F6C9F] dark:selection:text-[#9AD8FF] min-h-screen transition-colors duration-200">
      
      {/* Editorial Header */}
      <header className="mb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl italic tracking-tight text-[#111111] dark:text-[#F3F3F3] leading-none mb-3">
              Workspace
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-[#787774] dark:text-[#A0A0A0]">
              A calm, desaturated writing space. Press <kbd className="bg-white dark:bg-[#1E1E1E] px-1.5 py-0.5 rounded border border-[#EAEAEA] dark:border-[#2D2D2D] text-[10px] font-sans font-semibold text-[#111111] dark:text-[#F3F3F3]">/</kbd> to draft.
            </p>
          </div>
        </div>
      </header>

      {focusedTask ? (
        /* DISTRACTION-FREE FOCUS MODE */
        <main className="animate-fadeIn">
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#2D2D2D] rounded-xl p-8 md:p-12 mb-8 text-center min-h-[250px] flex flex-col justify-between transition-colors duration-200">
            <div className="flex justify-center gap-2 mb-4">
              <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded ${isDarkMode ? `${categoryPills[focusedTask.category].darkBg} ${categoryPills[focusedTask.category].darkText}` : `${categoryPills[focusedTask.category].bg} ${categoryPills[focusedTask.category].text}`}`}>
                {focusedTask.category}
              </span>
              {focusedTask.priority !== 'none' && (
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#F7F6F3] dark:bg-[#252525] text-[#787774] dark:text-[#A0A0A0] border border-[#EAEAEA] dark:border-[#2D2D2D]">
                  {focusedTask.priority}
                </span>
              )}
            </div>

            <h2 className={`font-serif text-3xl md:text-4xl italic text-[#111111] dark:text-[#F3F3F3] leading-snug my-auto px-4 ${focusedTask.completed ? 'line-through text-[#787774]/70 dark:text-[#A0A0A0]/50' : ''}`}>
              "{focusedTask.text}"
            </h2>

            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={() => toggleTask(focusedTask.id)}
                className="text-xs font-mono text-[#787774] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-[#F3F3F3] transition-colors cursor-pointer"
              >
                {focusedTask.completed ? 'Mark Active' : 'Mark Completed'}
              </button>
              <span className="text-[#EAEAEA] dark:text-[#2D2D2D] font-mono text-xs">|</span>
              <button
                onClick={() => setFocusTaskId(null)}
                className="text-xs font-mono text-[#787774] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-[#F3F3F3] transition-colors cursor-pointer"
              >
                Exit Focus Mode
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* STANDARD WORKSPACE LAYOUT */
        <main className="space-y-8">
          
          {/* Bento-style Task Form */}
          <section className="bg-white dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#2D2D2D] rounded-xl p-5 shadow-xs transition-colors duration-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                id="main-task-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Draft a new task..."
                className="w-full bg-transparent border-0 outline-none text-sm text-[#111111] dark:text-[#F3F3F3] placeholder-[#787774]/60 dark:placeholder-[#A0A0A0]/50 py-1"
              />

              {/* Categorization Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F9F9F8] dark:border-[#252525]">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#787774] dark:text-[#A0A0A0]">
                  {/* Category select */}
                  <div className="flex items-center gap-1.5">
                    <span>Category:</span>
                    <select
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value as Task['category'])}
                      className="bg-transparent border-0 outline-none text-[#111111] dark:text-[#F3F3F3] font-semibold cursor-pointer"
                    >
                      <option value="work" className="bg-white dark:bg-[#1C1C1C]">Work</option>
                      <option value="personal" className="bg-white dark:bg-[#1C1C1C]">Personal</option>
                      <option value="urgent" className="bg-white dark:bg-[#1C1C1C]">Urgent</option>
                      <option value="ideas" className="bg-white dark:bg-[#1C1C1C]">Ideas</option>
                    </select>
                  </div>

                  {/* Priority select */}
                  <div className="flex items-center gap-1.5">
                    <span>Priority:</span>
                    <select
                      value={inputPriority}
                      onChange={(e) => setInputPriority(e.target.value as Task['priority'])}
                      className="bg-transparent border-0 outline-none text-[#111111] dark:text-[#F3F3F3] font-semibold cursor-pointer"
                    >
                      <option value="none" className="bg-white dark:bg-[#1C1C1C]">None</option>
                      <option value="low" className="bg-white dark:bg-[#1C1C1C]">Low</option>
                      <option value="medium" className="bg-white dark:bg-[#1C1C1C]">Medium</option>
                      <option value="high" className="bg-white dark:bg-[#1C1C1C]">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#111111] dark:bg-[#F3F3F3] text-white dark:text-[#111111] text-xs font-mono hover:bg-[#2F3437] dark:hover:bg-[#E0DFDB] transition-colors cursor-pointer active:scale-95 font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </section>

          {/* Real-time Search Filter Bar */}
          <section className="bg-white dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#2D2D2D] rounded-xl px-4 py-2 flex items-center gap-2 shadow-xs transition-colors duration-200">
            <svg
              className="w-4 h-4 text-[#787774] dark:text-[#A0A0A0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by search keyword..."
              className="w-full bg-transparent border-0 outline-none text-xs text-[#111111] dark:text-[#F3F3F3] placeholder-[#787774]/60 dark:placeholder-[#A0A0A0]/50 py-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] font-mono text-[#787774] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-[#F3F3F3]"
              >
                Clear
              </button>
            )}
          </section>

          {/* Filtering Bars */}
          <section className="space-y-4">
            
            {/* Category Filter row */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-[#EAEAEA] dark:border-[#2D2D2D]">
              {(['all', 'work', 'personal', 'urgent', 'ideas'] as const).map((cat) => {
                const isActive = selectedCategory === cat;
                const pastel = cat !== 'all' ? categoryPills[cat] : null;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      isActive
                        ? pastel
                          ? isDarkMode
                            ? `${pastel.darkBg} ${pastel.darkText} font-bold`
                            : `${pastel.bg} ${pastel.text} font-bold`
                          : 'bg-[#111111] dark:bg-[#F3F3F3] text-white dark:text-[#111111] font-bold'
                        : 'text-[#787774] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-[#F3F3F3]'
                    }`}
                  >
                    {cat === 'all' ? 'All categories' : cat}
                  </button>
                );
              })}
            </div>

            {/* Completion Filter row + Sorting & Hide Completed */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs font-mono text-[#787774] dark:text-[#A0A0A0]">
              <div className="flex gap-4 items-center">
                {(['all', 'active', 'completed'] as const).map((f) => {
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`hover:text-[#111111] dark:hover:text-[#F3F3F3] transition-colors cursor-pointer ${isActive ? 'text-[#111111] dark:text-[#F3F3F3] font-bold underline underline-offset-4' : ''}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Hide Completed Toggle Button */}
                <button
                  onClick={() => setHideCompleted(!hideCompleted)}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                    hideCompleted
                      ? 'bg-[#111111] dark:bg-[#F3F3F3] text-white dark:text-[#111111] border-transparent'
                      : 'border-[#EAEAEA] dark:border-[#2D2D2D] hover:border-[#111111] dark:hover:border-[#F3F3F3] hover:text-[#111111] dark:hover:text-[#F3F3F3]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${hideCompleted ? 'bg-white dark:bg-[#111111]' : 'bg-transparent border border-current'}`}></span>
                  <span>Hide Completed</span>
                </button>

                {/* Sort Order Toggle Button */}
                <button
                  onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                  className="px-2 py-0.5 rounded border border-[#EAEAEA] dark:border-[#2D2D2D] hover:border-[#111111] dark:hover:border-[#F3F3F3] hover:text-[#111111] dark:hover:text-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {sortBy === 'newest' ? 'Newest First ↑' : 'Oldest First ↓'}
                </button>

                {completedTaskCount > 0 && (
                  <>
                    <span className="text-[#EAEAEA] dark:text-[#2D2D2D] hidden sm:inline">|</span>
                    <button
                      onClick={clearCompleted}
                      className="hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear completed ({completedTaskCount})
                    </button>
                  </>
                )}
              </div>
            </div>

          </section>

          {/* Task List container */}
          <section className="bg-white dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#2D2D2D] rounded-xl overflow-hidden divide-y divide-[#EAEAEA] dark:divide-[#2D2D2D] shadow-2xs transition-colors duration-200">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#787774] dark:text-[#A0A0A0] font-mono">
                No items to display.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-[#FBFBFA] dark:hover:bg-[#232323] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox circle */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded-full border border-[#787774]/40 dark:border-[#A0A0A0]/40 flex items-center justify-center shrink-0 hover:border-[#111111] dark:hover:border-[#F3F3F3] transition-colors cursor-pointer"
                      title={task.completed ? 'Mark active' : 'Mark completed'}
                    >
                      {task.completed && (
                        <span className="w-2 h-2 rounded-full bg-[#111111] dark:bg-[#F3F3F3]" />
                      )}
                    </button>

                    {/* Task Title / Inline Editor */}
                    {editingTaskId === task.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveEdit(task.id)}
                        onKeyDown={(e) => handleKeyDownEdit(e, task.id)}
                        className="flex-1 bg-[#F7F6F3] dark:bg-[#252525] border border-[#EAEAEA] dark:border-[#2D2D2D] rounded px-2 py-0.5 text-sm text-[#111111] dark:text-[#F3F3F3] outline-none"
                      />
                    ) : (
                      <span className={`text-sm text-[#111111] dark:text-[#F3F3F3] truncate ${task.completed ? 'line-through text-[#787774]/70 dark:text-[#A0A0A0]/50' : ''}`}>
                        {task.text}
                      </span>
                    )}

                    {/* Category Label */}
                    <span className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded shrink-0 ${isDarkMode ? `${categoryPills[task.category].darkBg} ${categoryPills[task.category].darkText}` : `${categoryPills[task.category].bg} ${categoryPills[task.category].text}`}`}>
                      {task.category}
                    </span>

                    {/* Priority label if set */}
                    {task.priority !== 'none' && !task.completed && (
                      <span className="text-[10px] font-mono text-[#787774] dark:text-[#A0A0A0] shrink-0">
                        · {priorityLabels[task.priority]}
                      </span>
                    )}

                    {/* Date stamp */}
                    <span className="text-[10px] font-mono text-[#787774]/60 dark:text-[#A0A0A0]/40 shrink-0" title={`Created at ${new Date(task.createdAt).toLocaleString()}`}>
                      · {formatDate(task.createdAt)}
                    </span>
                  </div>

                  {/* Actions strip */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Inline Edit button */}
                    {editingTaskId !== task.id && (
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="text-[11px] font-mono text-[#787774] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-[#F3F3F3] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Edit task title inline"
                      >
                        edit
                      </button>
                    )}

                    {/* Focus Mode button */}
                    {!task.completed && (
                      <button
                        onClick={() => setFocusTaskId(task.id)}
                        className="text-[11px] font-mono text-[#787774] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-[#F3F3F3] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Enter Focus Mode"
                      >
                        focus
                      </button>
                    )}
                    
                    {/* Delete button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-[11px] font-mono text-[#787774] dark:text-[#A0A0A0] hover:text-red-700 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete task"
                    >
                      delete
                    </button>
                  </div>

                </div>
              ))
            )}
          </section>

          {/* Counts metrics */}
          <footer className="text-right text-[11px] font-mono text-[#787774] dark:text-[#A0A0A0]">
            {activeTaskCount} active tasks remaining
          </footer>

        </main>
      )}

      {/* Footer Branding & Simple Dark Mode Toggle */}
      <footer className="mt-20 pt-6 border-t border-[#EAEAEA] dark:border-[#2D2D2D] flex flex-col sm:flex-row gap-4 justify-between items-center text-[10px] font-mono text-[#787774] dark:text-[#A0A0A0]">
        <div className="flex items-center gap-4">
          <span>Workspace · Minimalist UI</span>
          <span>·</span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hover:text-[#111111] dark:hover:text-[#F3F3F3] underline transition-colors cursor-pointer"
            title="Switch UI theme color scheme"
          >
            {isDarkMode ? 'Bone Light Mode' : 'Charcoal Dark Mode'}
          </button>
        </div>
        <a
          href="https://github.com/philschmid/todo-appi"
          target="_blank"
          className="hover:text-[#111111] dark:hover:text-[#F3F3F3] underline transition-colors"
        >
          GitHub
        </a>
      </footer>

    </div>
  );
}
