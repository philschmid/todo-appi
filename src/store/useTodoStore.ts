import { create } from 'zustand';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low' | 'none';
  dueDate: string; // YYYY-MM-DD or empty
  tags: string[];
  duration: number; // minutes
  createdAt: string;
}

export type Theme = 'light' | 'dark';
export type AccentColor = 'rose' | 'cobalt' | 'emerald' | 'violet';
export type FilterType = 'all' | 'active' | 'completed' | 'today' | 'upcoming';

interface FeatureToggles {
  nlp: boolean;
  keyboardShortcuts: boolean;
  pomodoro: boolean;
  commandBar: boolean;
  analytics: boolean;
  sounds: boolean;
}

interface TodoStore {
  tasks: Task[];
  filter: FilterType;
  searchQuery: string;
  theme: Theme;
  accentColor: AccentColor;
  features: FeatureToggles;
  
  // Timer State
  activeTaskId: string | null;
  timerSeconds: number;
  timerActive: boolean;
  timerMode: 'pomodoro' | 'shortBreak' | 'longBreak';
  
  // Actions
  addTask: (text: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  clearCompleted: () => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  toggleFeature: (feature: keyof FeatureToggles) => void;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  
  // Timer Actions
  setActiveTaskId: (id: string | null) => void;
  tickTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  setTimerActive: (active: boolean) => void;
  
  // Sound Player
  playSound: (type: 'click' | 'complete' | 'timer') => void;
}

// Helper to parse natural language elements from task input
export function parseNaturalLanguage(text: string) {
  let priority: 'high' | 'medium' | 'low' | 'none' = 'none';
  const tags: string[] = [];
  let dueDate = '';
  let duration = 0;
  let cleanText = text;

  // 1. Priority parsing (!high, !medium, !low or !h, !m, !l)
  const priorityRegex = /!(high|medium|low|h|m|l)\b/i;
  const priorityMatch = cleanText.match(priorityRegex);
  if (priorityMatch) {
    const val = priorityMatch[1].toLowerCase();
    if (val === 'high' || val === 'h') priority = 'high';
    else if (val === 'medium' || val === 'm') priority = 'medium';
    else if (val === 'low' || val === 'l') priority = 'low';
    cleanText = cleanText.replace(priorityRegex, '');
  }

  // 2. Duration parsing e.g. (30m) or (1h)
  const durationRegex = /\((\d+)(m|h)\)/i;
  const durationMatch = cleanText.match(durationRegex);
  if (durationMatch) {
    const num = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    duration = unit === 'h' ? num * 60 : num;
    cleanText = cleanText.replace(durationRegex, '');
  }

  // 3. Tag parsing (#work, #personal)
  const tagRegex = /#([a-zA-Z0-9_-]+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(cleanText)) !== null) {
    const tag = tagMatch[1].toLowerCase();
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  cleanText = cleanText.replace(tagRegex, '');

  // 4. Date parsing (today, tomorrow, monday/tuesday/.../sunday)
  const today = new Date();
  const dateRegex = /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const dateMatch = cleanText.match(dateRegex);
  if (dateMatch) {
    const keyword = dateMatch[1].toLowerCase();
    const targetDate = new Date();
    if (keyword === 'today') {
      // Keep today
    } else if (keyword === 'tomorrow') {
      targetDate.setDate(today.getDate() + 1);
    } else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(keyword);
      const currentDay = today.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) {
        diff += 7; // Next week's day
      }
      targetDate.setDate(today.getDate() + diff);
    }
    
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    dueDate = `${yyyy}-${mm}-${dd}`;
    cleanText = cleanText.replace(dateRegex, '');
  }

  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  return {
    text: cleanText || text.trim(),
    priority,
    tags,
    dueDate,
    duration
  };
}

const defaultTasks: Task[] = [
  {
    id: '1',
    text: 'Press "/" to focus search and check out keyboard shortcuts',
    completed: false,
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['guide', 'shortcuts'],
    duration: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    text: 'Enable Natural Language parsing and type "Buy groceries !high tomorrow #personal (20m)"',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: ['guide', 'nlp'],
    duration: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    text: 'Click on a task timer icon to activate Pomodoro focus session',
    completed: false,
    priority: 'none',
    dueDate: '',
    tags: ['guide', 'pomodoro'],
    duration: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    text: 'Complete this task to see visual confetti celebration',
    completed: true,
    priority: 'low',
    dueDate: '',
    tags: ['fun'],
    duration: 1,
    createdAt: new Date().toISOString()
  }
];

export const useTodoStore = create<TodoStore>((set, get) => ({
  // Load tasks from localStorage if available, else use defaults
  tasks: (() => {
    try {
      const stored = localStorage.getItem('todo_lab_tasks');
      return stored ? JSON.parse(stored) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  })(),
  filter: 'all',
  searchQuery: '',
  theme: (() => {
    try {
      const stored = localStorage.getItem('todo_lab_theme') as Theme;
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  })(),
  accentColor: (() => {
    try {
      const stored = localStorage.getItem('todo_lab_accent') as AccentColor;
      return ['rose', 'cobalt', 'emerald', 'violet'].includes(stored) ? stored : 'rose';
    } catch {
      return 'rose';
    }
  })(),
  features: (() => {
    try {
      const stored = localStorage.getItem('todo_lab_features');
      return stored ? JSON.parse(stored) : {
        nlp: true,
        keyboardShortcuts: true,
        pomodoro: true,
        commandBar: true,
        analytics: true,
        sounds: true
      };
    } catch {
      return {
        nlp: true,
        keyboardShortcuts: true,
        pomodoro: true,
        commandBar: true,
        analytics: true,
        sounds: true
      };
    }
  })(),

  // Timer State
  activeTaskId: null,
  timerSeconds: 25 * 60,
  timerActive: false,
  timerMode: 'pomodoro',

  // Actions
  addTask: (text) => {
    if (!text.trim()) return;

    let taskData: {
      text: string;
      priority: 'high' | 'medium' | 'low' | 'none';
      dueDate: string;
      tags: string[];
      duration: number;
    } = {
      text: text.trim(),
      priority: 'none',
      dueDate: '',
      tags: [],
      duration: 0
    };

    if (get().features.nlp) {
      taskData = parseNaturalLanguage(text);
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: taskData.text,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      tags: taskData.tags,
      duration: taskData.duration || (get().timerMode === 'pomodoro' ? 25 : 0),
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const updatedTasks = [newTask, ...state.tasks];
      localStorage.setItem('todo_lab_tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });

    if (get().features.sounds) get().playSound('click');
  },

  deleteTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((t) => t.id !== id);
      localStorage.setItem('todo_lab_tasks', JSON.stringify(updatedTasks));
      
      const isTimerForThisTask = state.activeTaskId === id;
      return {
        tasks: updatedTasks,
        activeTaskId: isTimerForThisTask ? null : state.activeTaskId,
        timerActive: isTimerForThisTask ? false : state.timerActive
      };
    });
    
    if (get().features.sounds) get().playSound('click');
  },

  toggleTask: (id) => {
    let playedSound = false;
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted && state.features.sounds) {
            get().playSound('complete');
            playedSound = true;
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      });
      localStorage.setItem('todo_lab_tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
    
    if (!playedSound && get().features.sounds) {
      get().playSound('click');
    }
  },

  updateTask: (id, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      localStorage.setItem('todo_lab_tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
  },

  clearCompleted: () => {
    set((state) => {
      const updatedTasks = state.tasks.filter((t) => !t.completed);
      localStorage.setItem('todo_lab_tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
    if (get().features.sounds) get().playSound('click');
  },

  setFilter: (filter) => {
    set({ filter });
    if (get().features.sounds) get().playSound('click');
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  toggleFeature: (feature) => {
    set((state) => {
      const updatedFeatures = { ...state.features, [feature]: !state.features[feature] };
      localStorage.setItem('todo_lab_features', JSON.stringify(updatedFeatures));
      
      // Clean up timer states if disabling Pomodoro
      if (feature === 'pomodoro' && !updatedFeatures.pomodoro) {
        return {
          features: updatedFeatures,
          activeTaskId: null,
          timerActive: false,
          timerSeconds: 25 * 60
        };
      }
      
      return { features: updatedFeatures };
    });
    if (get().features.sounds) get().playSound('click');
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('todo_lab_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (get().features.sounds) get().playSound('click');
  },

  setAccentColor: (accentColor) => {
    set({ accentColor });
    localStorage.setItem('todo_lab_accent', accentColor);
    if (get().features.sounds) get().playSound('click');
  },

  // Timer Actions
  setActiveTaskId: (id) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      const initialSeconds = task?.duration ? task.duration * 60 : 25 * 60;
      return {
        activeTaskId: id,
        timerMode: 'pomodoro',
        timerSeconds: id ? initialSeconds : 25 * 60,
        timerActive: false
      };
    });
    if (get().features.sounds) get().playSound('click');
  },

  tickTimer: () => {
    const { timerSeconds, timerActive, timerMode, features, playSound } = get();
    if (!timerActive) return;

    if (timerSeconds <= 1) {
      // Timer finished!
      if (features.sounds) playSound('timer');
      
      let nextMode: 'pomodoro' | 'shortBreak' | 'longBreak';
      let nextSeconds: number;

      if (timerMode === 'pomodoro') {
        nextMode = 'shortBreak';
        nextSeconds = 5 * 60;
        // Optionally complete current task if focusing
        const { activeTaskId } = get();
        if (activeTaskId) {
          get().toggleTask(activeTaskId);
          // Trigger confetti externally or just keep active task completed
        }
      } else {
        nextMode = 'pomodoro';
        const activeTask = get().tasks.find(t => t.id === get().activeTaskId);
        nextSeconds = activeTask?.duration ? activeTask.duration * 60 : 25 * 60;
      }

      set({
        timerMode: nextMode,
        timerSeconds: nextSeconds,
        timerActive: false
      });
    } else {
      set({ timerSeconds: timerSeconds - 1 });
    }
  },

  resetTimer: () => {
    const { timerMode, activeTaskId, tasks } = get();
    let seconds: number;
    if (timerMode === 'pomodoro') {
      const activeTask = tasks.find(t => t.id === activeTaskId);
      seconds = activeTask?.duration ? activeTask.duration * 60 : 25 * 60;
    } else if (timerMode === 'shortBreak') {
      seconds = 5 * 60;
    } else {
      seconds = 15 * 60;
    }
    set({ timerSeconds: seconds, timerActive: false });
    if (get().features.sounds) get().playSound('click');
  },

  setTimerMode: (timerMode) => {
    let seconds: number;
    if (timerMode === 'pomodoro') {
      const activeTask = get().tasks.find(t => t.id === get().activeTaskId);
      seconds = activeTask?.duration ? activeTask.duration * 60 : 25 * 60;
    } else if (timerMode === 'shortBreak') {
      seconds = 5 * 60;
    } else {
      seconds = 15 * 60;
    }
    set({
      timerMode,
      timerSeconds: seconds,
      timerActive: false
    });
    if (get().features.sounds) get().playSound('click');
  },

  setTimerActive: (timerActive) => {
    set({ timerActive });
    if (get().features.sounds) get().playSound('click');
  },

  // Audio Synthesizer (No external asset files needed, works offline instantly)
  playSound: (type) => {
    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'complete') {
        // High-end double chime: E5 then A5
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
        gain2.gain.setValueAtTime(0.05, ctx.currentTime + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'timer') {
        // Soft focus complete bell sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  }
}));
