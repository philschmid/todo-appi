import { create } from 'zustand';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low' | 'none';
  category: 'work' | 'personal' | 'urgent' | 'ideas';
  createdAt: string;
}

export type FilterType = 'all' | 'active' | 'completed';

interface TodoStore {
  tasks: Task[];
  filter: FilterType;
  selectedCategory: 'all' | Task['category'];
  focusTaskId: string | null; // Focus mode: displays only this task for zero distraction
  
  // Actions
  addTask: (text: string, category: Task['category'], priority: Task['priority']) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSelectedCategory: (category: 'all' | Task['category']) => void;
  setFocusTaskId: (id: string | null) => void;
  clearCompleted: () => void;
}

const defaultTasks: Task[] = [
  {
    id: '1',
    text: 'Review the minimalist design specification sheet',
    completed: false,
    priority: 'high',
    category: 'work',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    text: 'Draft the project proposal outline',
    completed: false,
    priority: 'medium',
    category: 'ideas',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    text: 'Complete weekly workspace clean up',
    completed: true,
    priority: 'low',
    category: 'personal',
    createdAt: new Date().toISOString()
  }
];

export const useTodoStore = create<TodoStore>((set) => ({
  tasks: (() => {
    try {
      const stored = localStorage.getItem('minimal_todo_tasks');
      return stored ? JSON.parse(stored) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  })(),
  filter: 'all',
  selectedCategory: 'all',
  focusTaskId: null,

  addTask: (text, category, priority) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      priority,
      category,
      createdAt: new Date().toISOString()
    };
    set((state) => {
      const updated = [newTask, ...state.tasks];
      localStorage.setItem('minimal_todo_tasks', JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const updated = state.tasks.filter((t) => t.id !== id);
      localStorage.setItem('minimal_todo_tasks', JSON.stringify(updated));
      return {
        tasks: updated,
        focusTaskId: state.focusTaskId === id ? null : state.focusTaskId
      };
    });
  },

  toggleTask: (id) => {
    set((state) => {
      const updated = state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      localStorage.setItem('minimal_todo_tasks', JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  setFilter: (filter) => set({ filter }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setFocusTaskId: (focusTaskId) => set({ focusTaskId }),

  clearCompleted: () => {
    set((state) => {
      const updated = state.tasks.filter((t) => !t.completed);
      localStorage.setItem('minimal_todo_tasks', JSON.stringify(updated));
      return { tasks: updated };
    });
  }
}));
