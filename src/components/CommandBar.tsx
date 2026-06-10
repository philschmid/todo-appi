import { useState, useEffect, useRef } from 'react';
import { useTodoStore, type AccentColor, type FilterType, type Theme } from '../store/useTodoStore';
import { Command, X, Sparkle, PaintBrush, CheckSquare, Timer, SunDim } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandOption {
  category: string;
  icon: React.ReactNode;
  label: string;
  action: string;
  value: string;
}

export default function CommandBar() {
  const {
    features,
    setTheme,
    setAccentColor,
    setFilter,
    clearCompleted,
    setTimerActive,
    resetTimer,
    addTask,
    accentColor
  } = useTodoStore();

  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Command options config
  const commandOptions: CommandOption[] = [
    { category: 'Theme', icon: <SunDim size={14} />, label: 'Switch to Dark Mode', action: 'theme', value: 'dark' },
    { category: 'Theme', icon: <SunDim size={14} />, label: 'Switch to Light Mode', action: 'theme', value: 'light' },
    { category: 'Accent Color', icon: <PaintBrush size={14} />, label: 'Set color Rose', action: 'accent', value: 'rose' },
    { category: 'Accent Color', icon: <PaintBrush size={14} />, label: 'Set color Cobalt', action: 'accent', value: 'cobalt' },
    { category: 'Accent Color', icon: <PaintBrush size={14} />, label: 'Set color Emerald', action: 'accent', value: 'emerald' },
    { category: 'Accent Color', icon: <PaintBrush size={14} />, label: 'Set color Violet', action: 'accent', value: 'violet' },
    { category: 'Filter', icon: <CheckSquare size={14} />, label: 'Show All Tasks', action: 'filter', value: 'all' },
    { category: 'Filter', icon: <CheckSquare size={14} />, label: 'Show Active Tasks', action: 'filter', value: 'active' },
    { category: 'Filter', icon: <CheckSquare size={14} />, label: 'Show Completed Tasks', action: 'filter', value: 'completed' },
    { category: 'Tasks', icon: <CheckSquare size={14} />, label: 'Clear Completed Tasks', action: 'clear', value: '' },
    { category: 'Focus Timer', icon: <Timer size={14} />, label: 'Start Focus Timer', action: 'timer', value: 'play' },
    { category: 'Focus Timer', icon: <Timer size={14} />, label: 'Pause Focus Timer', action: 'timer', value: 'pause' },
    { category: 'Focus Timer', icon: <Timer size={14} />, label: 'Reset Focus Timer', action: 'timer', value: 'reset' },
  ];

  // Open / Close with Cmd+K or Ctrl+K
  useEffect(() => {
    if (!features.commandBar) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [features.commandBar, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
        setValue('');
      }, 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getFilteredOptions = () => {
    const query = value.toLowerCase().trim();
    if (!query) return commandOptions;

    // Support "add <task>" command
    if (query.startsWith('add ') || query.startsWith('todo ')) {
      return [
        {
          category: 'Quick Add',
          icon: <Sparkle size={14} />,
          label: `Create task: "${value.substring(4)}"`,
          action: 'add',
          value: value.substring(4)
        }
      ];
    }

    return commandOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.category.toLowerCase().includes(query)
    );
  };

  const filteredOptions = getFilteredOptions();

  const handleExecute = (opt: CommandOption) => {
    switch (opt.action) {
      case 'theme':
        setTheme(opt.value as Theme);
        break;
      case 'accent':
        setAccentColor(opt.value as AccentColor);
        break;
      case 'filter':
        setFilter(opt.value as FilterType);
        break;
      case 'clear':
        clearCompleted();
        break;
      case 'timer':
        if (opt.value === 'play') setTimerActive(true);
        else if (opt.value === 'pause') setTimerActive(false);
        else if (opt.value === 'reset') resetTimer();
        break;
      case 'add':
        addTask(opt.value);
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  // Keyboard navigation inside options list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[selectedIndex]) {
        handleExecute(filteredOptions[selectedIndex]);
      }
    }
  };

  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/10',
    cobalt: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/10',
    violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/10',
  };

  if (!features.commandBar) return null;

  return (
    <>
      {/* Top trigger badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer select-none"
        title="Open Command Bar (Cmd+K)"
      >
        <Command size={14} />
        <span>Command Bar</span>
        <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-sans font-semibold bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200/50 dark:border-zinc-700/50">
          ⌘K
        </kbd>
      </button>

      {/* Modal Command Bar */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs">
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Input Header */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-850">
                <Command size={18} className={`shrink-0 text-zinc-400 dark:text-zinc-500`} />
                <input
                  ref={inputRef}
                  type="text"
                  id="command-bar-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or 'add <task name>'..."
                  className="flex-1 bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 text-sm py-0.5"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Options List */}
              <div className="max-h-[280px] overflow-y-auto p-2">
                {filteredOptions.length === 0 ? (
                  <div className="py-8 px-4 text-center text-zinc-400 dark:text-zinc-600 text-xs">
                    No matching commands. Try "theme", "color", "timer" or "add".
                  </div>
                ) : (
                  filteredOptions.map((opt, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={`${opt.category}-${opt.label}-${index}`}
                        onClick={() => handleExecute(opt)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? `${accentBgMap[accentColor]} border-l-2`
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className={`shrink-0 ${isSelected ? accentTextMap[accentColor] : 'text-zinc-400 dark:text-zinc-600'}`}>
                          {opt.icon}
                        </span>
                        
                        <span className="flex-1 font-medium text-zinc-850 dark:text-zinc-200 truncate">
                          {opt.label}
                        </span>

                        <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-650 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/20">
                          {opt.category}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer Guide */}
              <div className="flex justify-between items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900/50 text-[10px] text-zinc-400 dark:text-zinc-600">
                <span className="flex gap-2">
                  <span><kbd className="font-mono bg-white dark:bg-zinc-800 px-1 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs">↑↓</kbd> navigate</span>
                  <span><kbd className="font-mono bg-white dark:bg-zinc-800 px-1 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs">enter</kbd> select</span>
                </span>
                <span>Press <kbd className="font-mono bg-white dark:bg-zinc-800 px-1 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs">esc</kbd> to exit</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
