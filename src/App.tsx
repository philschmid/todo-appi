import React, { useState, useEffect } from 'react';
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
    setFilter,
    setSelectedCategory,
    setFocusTaskId,
    clearCompleted
  } = useTodoStore();

  const [inputValue, setInputValue] = useState('');
  const [inputCategory, setInputCategory] = useState<Task['category']>('work');
  const [inputPriority, setInputPriority] = useState<Task['priority']>('none');
  const [hideCompleted, setHideCompleted] = useState(false);

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

  // Filter tasks based on simple criteria
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !task.completed) ||
        (filter === 'completed' && task.completed);
      
      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;

      const matchesHideCompleted = !hideCompleted || !task.completed;

      return matchesFilter && matchesCategory && matchesHideCompleted;
    });
  };

  const filteredTasks = getFilteredTasks();
  const activeTaskCount = tasks.filter((t) => !t.completed).length;
  const completedTaskCount = tasks.filter((t) => t.completed).length;

  const categoryPills: Record<Task['category'], { bg: string; text: string }> = {
    urgent: { bg: 'bg-[#FDEBEC]', text: 'text-[#9F2F2D]' },
    work: { bg: 'bg-[#E1F3FE]', text: 'text-[#1F6C9F]' },
    personal: { bg: 'bg-[#EDF3EC]', text: 'text-[#346538]' },
    ideas: { bg: 'bg-[#FBF3DB]', text: 'text-[#956400]' }
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
    <div className="max-w-[700px] mx-auto px-6 py-16 sm:py-24 selection:bg-[#E1F3FE] selection:text-[#1F6C9F]">
      
      {/* Editorial Header */}
      <header className="mb-14">
        <h1 className="font-serif text-5xl md:text-6xl italic tracking-tight text-[#111111] leading-none mb-3">
          Workspace
        </h1>
        <p className="text-xs font-mono uppercase tracking-wider text-[#787774]">
          A calm, desaturated writing space. Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#EAEAEA] text-[10px] font-sans font-semibold">/</kbd> to draft.
        </p>
      </header>

      {focusedTask ? (
        /* DISTRACTION-FREE FOCUS MODE */
        <main className="animate-fadeIn">
          <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 md:p-12 mb-8 text-center min-h-[250px] flex flex-col justify-between">
            <div className="flex justify-center gap-2 mb-4">
              <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded ${categoryPills[focusedTask.category].bg} ${categoryPills[focusedTask.category].text}`}>
                {focusedTask.category}
              </span>
              {focusedTask.priority !== 'none' && (
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA]">
                  {focusedTask.priority}
                </span>
              )}
            </div>

            <h2 className={`font-serif text-3xl md:text-4xl italic text-[#111111] leading-snug my-auto px-4 ${focusedTask.completed ? 'line-through text-[#787774]/70' : ''}`}>
              "{focusedTask.text}"
            </h2>

            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={() => toggleTask(focusedTask.id)}
                className="text-xs font-mono text-[#787774] hover:text-[#111111] transition-colors cursor-pointer"
              >
                {focusedTask.completed ? 'Mark Active' : 'Mark Completed'}
              </button>
              <span className="text-[#EAEAEA] font-mono text-xs">|</span>
              <button
                onClick={() => setFocusTaskId(null)}
                className="text-xs font-mono text-[#787774] hover:text-[#111111] transition-colors cursor-pointer"
              >
                Exit Focus Mode
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* STANDARD WORKSPACE LAYOUT */
        <main className="space-y-10">
          
          {/* Bento-style Task Form */}
          <section className="bg-white border border-[#EAEAEA] rounded-xl p-5 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                id="main-task-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Draft a new task..."
                className="w-full bg-transparent border-0 outline-none text-sm text-[#111111] placeholder-[#787774]/60 py-1"
              />

              {/* Categorization Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F9F9F8]">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#787774]">
                  {/* Category select */}
                  <div className="flex items-center gap-1.5">
                    <span>Category:</span>
                    <select
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value as Task['category'])}
                      className="bg-transparent border-0 outline-none text-[#111111] font-semibold cursor-pointer"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="urgent">Urgent</option>
                      <option value="ideas">Ideas</option>
                    </select>
                  </div>

                  {/* Priority select */}
                  <div className="flex items-center gap-1.5">
                    <span>Priority:</span>
                    <select
                      value={inputPriority}
                      onChange={(e) => setInputPriority(e.target.value as Task['priority'])}
                      className="bg-transparent border-0 outline-none text-[#111111] font-semibold cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#111111] text-white text-xs font-mono hover:bg-[#2F3437] transition-colors cursor-pointer active:scale-95"
                >
                  Create
                </button>
              </div>
            </form>
          </section>

          {/* Filtering Bars */}
          <section className="space-y-3">
            
            {/* Category Filter row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EAEAEA]">
              <div className="flex flex-wrap gap-2">
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
                            ? `${pastel.bg} ${pastel.text} font-bold`
                            : 'bg-[#111111] text-white'
                          : 'text-[#787774] hover:text-[#111111]'
                      }`}
                    >
                      {cat === 'all' ? 'All categories' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Hide Completed Toggle */}
              <label className="flex items-center gap-2 text-xs font-mono text-[#787774] cursor-pointer hover:text-[#111111] select-none">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#111111] cursor-pointer"
                />
                <span>Hide Completed</span>
              </label>
            </div>

            {/* Completion Filter row */}
            <div className="flex justify-between items-center text-xs font-mono text-[#787774]">
              <div className="flex gap-4">
                {(['all', 'active', 'completed'] as const).map((f) => {
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`hover:text-[#111111] transition-colors cursor-pointer ${isActive ? 'text-[#111111] font-bold underline underline-offset-4' : ''}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  );
                })}
              </div>

              {completedTaskCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="hover:text-red-700 transition-colors cursor-pointer"
                >
                  Clear completed ({completedTaskCount})
                </button>
              )}
            </div>

          </section>

          {/* Task List container */}
          <section className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden divide-y divide-[#EAEAEA]">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#787774] font-mono">
                No items to display.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-[#FBFBFA] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox circle */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded-full border border-[#787774]/40 flex items-center justify-center shrink-0 hover:border-[#111111] transition-colors cursor-pointer"
                      title={task.completed ? 'Mark active' : 'Mark completed'}
                    >
                      {task.completed && (
                        <span className="w-2 h-2 rounded-full bg-[#111111]" />
                      )}
                    </button>

                    {/* Task Title */}
                    <span className={`text-sm text-[#111111] truncate ${task.completed ? 'line-through text-[#787774]/70' : ''}`}>
                      {task.text}
                    </span>

                    {/* Category Label */}
                    <span className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded shrink-0 ${categoryPills[task.category].bg} ${categoryPills[task.category].text}`}>
                      {task.category}
                    </span>

                    {/* Priority label if set */}
                    {task.priority !== 'none' && !task.completed && (
                      <span className="text-[10px] font-mono text-[#787774] shrink-0">
                        · {priorityLabels[task.priority]}
                      </span>
                    )}
                  </div>

                  {/* Actions strip */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Focus Mode button */}
                    {!task.completed && (
                      <button
                        onClick={() => setFocusTaskId(task.id)}
                        className="text-[11px] font-mono text-[#787774] hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Enter Focus Mode"
                      >
                        focus
                      </button>
                    )}
                    
                    {/* Delete button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-[11px] font-mono text-[#787774] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
          <footer className="text-right text-[11px] font-mono text-[#787774]">
            {activeTaskCount} active tasks remaining
          </footer>

        </main>
      )}

      {/* Footer Branding */}
      <footer className="mt-24 pt-6 border-t border-[#EAEAEA] flex justify-between items-center text-[10px] font-mono text-[#787774]">
        <span>Workspace · Minimalist UI</span>
        <a
          href="https://github.com/philschmid/todo-appi"
          target="_blank"
          className="hover:text-[#111111] underline transition-colors"
        >
          GitHub
        </a>
      </footer>

    </div>
  );
}
