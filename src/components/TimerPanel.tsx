import { useEffect } from 'react';
import { useTodoStore } from '../store/useTodoStore';
import { Play, Pause, ArrowCounterClockwise, X, Sparkle } from '@phosphor-icons/react';
import { motion } from 'motion/react';

export default function TimerPanel() {
  const {
    tasks,
    activeTaskId,
    timerSeconds,
    timerActive,
    timerMode,
    tickTimer,
    resetTimer,
    setTimerMode,
    setTimerActive,
    setActiveTaskId,
    accentColor
  } = useTodoStore();

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Tick the timer every second if active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, tickTimer]);

  const getDurationForMode = () => {
    if (timerMode === 'pomodoro') {
      return activeTask?.duration ? activeTask.duration * 60 : 25 * 60;
    } else if (timerMode === 'shortBreak') {
      return 5 * 60;
    } else {
      return 15 * 60;
    }
  };

  const totalSeconds = getDurationForMode();
  const progress = totalSeconds > 0 ? (totalSeconds - timerSeconds) / totalSeconds : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Color Maps
  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700',
    cobalt: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    emerald: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700',
    violet: 'bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700',
  };

  const accentFillMap = {
    rose: 'stroke-rose-500 dark:stroke-rose-400',
    cobalt: 'stroke-blue-500 dark:stroke-blue-400',
    emerald: 'stroke-emerald-500 dark:stroke-emerald-400',
    violet: 'stroke-violet-500 dark:stroke-violet-400',
  };

  const accentRingMap = {
    rose: 'ring-rose-500/25',
    cobalt: 'ring-blue-500/25',
    emerald: 'ring-emerald-500/25',
    violet: 'ring-violet-500/25',
  };

  // SVG configuration
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl shadow-xs">
      
      {/* Mode Switches */}
      <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl mb-6">
        {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setTimerMode(mode)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timerMode === mode
                ? 'bg-white dark:bg-zinc-900 shadow-xs text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Circle visualization */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-zinc-100 dark:stroke-zinc-800"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            className={accentFillMap[accentColor]}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Monospace Countdown string */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono tracking-tight text-zinc-800 dark:text-zinc-100">
            {formatTime(timerSeconds)}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-600 mt-0.5">
            {timerActive ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => resetTimer()}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors active:scale-95 cursor-pointer"
          title="Reset timer"
        >
          <ArrowCounterClockwise size={16} />
        </button>

        <button
          onClick={() => setTimerActive(!timerActive)}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ${accentRingMap[accentColor]} ${accentBgMap[accentColor]}`}
          title={timerActive ? 'Pause Session' : 'Start Session'}
        >
          {timerActive ? <Pause size={20} weight="bold" /> : <Play size={20} weight="fill" />}
        </button>

        {activeTaskId && (
          <button
            onClick={() => setActiveTaskId(null)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors active:scale-95 cursor-pointer"
            title="Clear active task focus"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Focused Task Label */}
      {activeTask ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/30 text-xs w-full max-w-[240px] truncate animate-fadeIn">
          <Sparkle size={13} className={`shrink-0 ${accentTextMap[accentColor]}`} />
          <span className="text-zinc-400 shrink-0">Focusing:</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate flex-1 text-left">
            {activeTask.text}
          </span>
        </div>
      ) : (
        <div className="text-zinc-400 dark:text-zinc-600 text-xs text-center">
          Select a task to start focused tracking
        </div>
      )}
    </div>
  );
}
