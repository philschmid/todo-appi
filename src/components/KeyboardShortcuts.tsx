import { useState, useEffect } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { Keyboard, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ['/'], description: 'Focus search input' },
  { keys: ['n'], description: 'Focus new task input' },
  { keys: ['esc'], description: 'Clear search / blur input' },
  { keys: ['a'], description: 'Show all tasks' },
  { keys: ['o'], description: 'Show active tasks' },
  { keys: ['d'], description: 'Show completed tasks' },
  { keys: ['t'], description: 'Show today\'s tasks' },
  { keys: ['u'], description: 'Show upcoming tasks' },
  { keys: ['p'], description: 'Play / Pause focus timer' },
  { keys: ['r'], description: 'Reset focus timer' },
  { keys: ['k'], description: 'Toggle Command Bar' },
  { keys: ['?'], description: 'Toggle keyboard cheat sheet' },
];

export default function KeyboardShortcuts() {
  const {
    features,
    setFilter,
    timerActive,
    setTimerActive,
    resetTimer,
    accentColor
  } = useTodoStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!features.keyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case '/': {
          e.preventDefault();
          const searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.focus();
          break;
        }
        case 'n': {
          e.preventDefault();
          const taskInput = document.querySelector('form input[type="text"]') as HTMLInputElement;
          if (taskInput) taskInput.focus();
          break;
        }
        case 'a':
          setFilter('all');
          break;
        case 'o':
          setFilter('active');
          break;
        case 'd':
          setFilter('completed');
          break;
        case 't':
          setFilter('today');
          break;
        case 'u':
          setFilter('upcoming');
          break;
        case 'p':
          setTimerActive(!timerActive);
          break;
        case 'r':
          resetTimer();
          break;
        case 'k': {
          // Let CommandBar handle it, but can be a fallback
          const cmdBarInput = document.getElementById('command-bar-input');
          if (cmdBarInput) cmdBarInput.focus();
          break;
        }
        case '?':
          setIsOpen((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [features.keyboardShortcuts, setFilter, timerActive, setTimerActive, resetTimer]);

  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    cobalt: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  if (!features.keyboardShortcuts) return null;

  return (
    <>
      {/* Keyboard Trigger Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer select-none"
        title="Show Keyboard Shortcuts (?)"
      >
        <Keyboard size={14} />
        <span>Shortcuts</span>
        <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-sans font-semibold bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200/50 dark:border-zinc-700/50">
          ?
        </kbd>
      </button>

      {/* Modal Cheat Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1 flex items-center gap-2">
                <Keyboard size={20} className={accentTextMap[accentColor]} />
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
                Speed up your task flow. These commands work when you are not typing in input fields.
              </p>

              {/* Shortcuts Grid */}
              <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.description} className="flex flex-col gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-100/50 dark:border-zinc-800/10">
                    <div className="flex gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700 shadow-xs uppercase"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg hover:opacity-95 transition-opacity cursor-pointer ${accentBgMap[accentColor]} text-white`}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
