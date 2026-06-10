import React, { useState, useEffect } from 'react';
import { useTodoStore, parseNaturalLanguage } from '../store/useTodoStore';
import { Plus, Tag, CalendarBlank, Flag, Clock, Sparkle } from '@phosphor-icons/react';

export default function TaskInput() {
  const addTask = useTodoStore((state) => state.addTask);
  const nlpEnabled = useTodoStore((state) => state.features.nlp);
  const accentColor = useTodoStore((state) => state.accentColor);
  
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseNaturalLanguage> | null>(null);

  useEffect(() => {
    if (nlpEnabled && value.trim()) {
      setPreview(parseNaturalLanguage(value));
    } else {
      setPreview(null);
    }
  }, [value, nlpEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    addTask(value);
    setValue('');
    setPreview(null);
  };

  // Accent styles map
  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 focus:ring-rose-500',
    cobalt: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-500',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:ring-emerald-500',
    violet: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 focus:ring-violet-500',
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700 transition-all duration-200 shadow-sm">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            nlpEnabled
              ? "Add a task... (e.g. Call John !high tomorrow #work (15m))"
              : "Add a task..."
          }
          className="flex-1 px-3 py-2 bg-transparent border-0 outline-none text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm"
        />
        
        <button
          type="submit"
          className={`flex items-center justify-center p-2 rounded-lg text-white transition-all duration-150 active:scale-[0.97] cursor-pointer ${accentBgMap[accentColor]}`}
          title="Add task"
        >
          <Plus size={16} weight="bold" />
        </button>
      </div>

      {/* Live NLP Preview Area */}
      {preview && (
        <div className="flex flex-wrap gap-2 mt-2 px-3 text-xs text-zinc-500 animate-fadeIn">
          <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <Sparkle size={12} className={accentTextMap[accentColor]} />
            Parsed preview:
          </span>

          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            "{preview.text}"
          </span>

          {preview.priority !== 'none' && (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
              preview.priority === 'high'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : preview.priority === 'medium'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
            }`}>
              <Flag size={10} weight="fill" />
              {preview.priority}
            </span>
          )}

          {preview.dueDate && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <CalendarBlank size={10} />
              {preview.dueDate}
            </span>
          )}

          {preview.duration > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <Clock size={10} />
              {preview.duration}m
            </span>
          )}

          {preview.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <Tag size={10} />
              #{tag}
            </span>
          ))}
        </div>
      )}
    </form>
  );
}
