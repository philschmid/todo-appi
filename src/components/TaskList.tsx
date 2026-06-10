import { useTodoStore, type Task } from '../store/useTodoStore';
import { Trash, CalendarBlank, Flag, Clock, Tag, Play, Pause, Circle, CheckCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } }
};

export default function TaskList() {
  const {
    tasks,
    filter,
    searchQuery,
    toggleTask,
    deleteTask,
    accentColor,
    activeTaskId,
    setActiveTaskId,
    timerActive,
    setTimerActive,
    features
  } = useTodoStore();

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleTask(id);
    // Trigger confetti on completion if sounds/animations aren't completely disabled
    if (!currentlyCompleted) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: accentColor === 'rose' 
          ? ['#f43f5e', '#fb7185', '#fda4af']
          : accentColor === 'cobalt'
          ? ['#3b82f6', '#60a5fa', '#93c5fd']
          : accentColor === 'emerald'
          ? ['#10b981', '#34d399', '#6ee7b7']
          : ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });
    }
  };

  const getFilteredTasks = (): Task[] => {
    const query = searchQuery.toLowerCase().trim();
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter((task) => {
      const matchesSearch =
        task.text.toLowerCase().includes(query) ||
        task.tags.some((t) => t.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      switch (filter) {
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        case 'today':
          return task.dueDate === todayStr;
        case 'upcoming':
          return task.dueDate > todayStr;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  // Color Maps
  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };



  const accentBorderMap = {
    rose: 'border-rose-500 dark:border-rose-400',
    cobalt: 'border-blue-500 dark:border-blue-400',
    emerald: 'border-emerald-500 dark:border-emerald-400',
    violet: 'border-violet-500 dark:border-violet-400',
  };

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return '';
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderEmptyState = () => {
    let title = "No tasks found";
    let desc = "Try clearing filters, searching for something else, or creating a task.";

    if (filter === 'today') {
      title = "Clear path today";
      desc = "No tasks scheduled for today. Take a deep breath or add a new one.";
    } else if (filter === 'upcoming') {
      title = "Calm horizon";
      desc = "No upcoming tasks in the pipeline. Sit back or plan ahead.";
    } else if (filter === 'active') {
      title = "All caught up";
      desc = "No active tasks remaining. High five!";
    } else if (filter === 'completed') {
      title = "Workspace cleared";
      desc = "No completed tasks yet. Finish a task to see them here.";
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-4 border border-zinc-200/50 dark:border-zinc-800/50">
          <CalendarBlank size={24} />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
          {desc}
        </p>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {filteredTasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2.5"
          >
            <AnimatePresence>
              {filteredTasks.map((task) => {
                const isFocused = activeTaskId === task.id;
                
                return (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    layoutId={`task-${task.id}`}
                    exit="exit"
                    className={`flex items-start gap-3 p-3.5 rounded-xl border bg-white dark:bg-zinc-900 transition-all duration-200 ${
                      task.completed
                        ? 'border-zinc-100 dark:border-zinc-900/50 opacity-60'
                        : isFocused
                        ? `border-zinc-200 dark:border-zinc-800 ring-1 ${accentBorderMap[accentColor]} shadow-sm`
                        : 'border-zinc-100 dark:border-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-xs'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(task.id, task.completed)}
                      className="mt-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer active:scale-95"
                      title={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed ? (
                        <CheckCircle size={20} weight="fill" className={accentTextMap[accentColor]} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm select-none break-words leading-relaxed ${
                        task.completed 
                          ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal' 
                          : 'text-zinc-800 dark:text-zinc-200 font-medium'
                      }`}>
                        {task.text}
                      </p>

                      {/* Meta Tags & Details */}
                      {(task.priority !== 'none' || task.dueDate || task.duration > 0 || task.tags.length > 0) && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Priority Badge */}
                          {task.priority !== 'none' && !task.completed && (
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              task.priority === 'high'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                            }`}>
                              <Flag size={10} weight="fill" />
                              {task.priority}
                            </span>
                          )}

                          {/* Due Date */}
                          {task.dueDate && !task.completed && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-zinc-500 dark:text-zinc-400">
                              <CalendarBlank size={11} />
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}

                          {/* Focus Duration */}
                          {task.duration > 0 && !task.completed && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-zinc-500 dark:text-zinc-400">
                              <Clock size={11} />
                              {task.duration}m
                            </span>
                          )}

                          {/* Tags */}
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-0.5 text-[10.5px] text-zinc-400 dark:text-zinc-500 font-mono"
                            >
                              <Tag size={9} />
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                      {/* Pomodoro Focus Launcher */}
                      {features.pomodoro && !task.completed && (
                        <button
                          onClick={() => {
                            if (isFocused) {
                              setTimerActive(!timerActive);
                            } else {
                              setActiveTaskId(task.id);
                              setTimerActive(true);
                            }
                          }}
                          className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            isFocused ? accentTextMap[accentColor] : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                          title={isFocused && timerActive ? "Pause Focus session" : "Start Focus session"}
                        >
                          {isFocused && timerActive ? <Pause size={15} weight="bold" /> : <Play size={15} weight="fill" />}
                        </button>
                      )}

                      {/* Trash Button */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
