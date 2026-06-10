import { useTodoStore, type AccentColor } from '../store/useTodoStore';
import { Sun, Moon } from '@phosphor-icons/react';

export default function ThemeSelector() {
  const { theme, setTheme, accentColor, setAccentColor } = useTodoStore();

  const colors: { name: AccentColor; class: string }[] = [
    { name: 'rose', class: 'bg-rose-500' },
    { name: 'cobalt', class: 'bg-blue-500' },
    { name: 'emerald', class: 'bg-emerald-500' },
    { name: 'violet', class: 'bg-violet-500' },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Accent Colors Palette */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800 rounded-xl shadow-xs">
        {colors.map((color) => {
          const isSelected = accentColor === color.name;
          return (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.name)}
              className={`w-4 h-4 rounded-full transition-all duration-150 relative cursor-pointer hover:scale-110 active:scale-90 ${color.class}`}
              title={`Switch accent to ${color.name}`}
            >
              {isSelected && (
                <span className="absolute inset-0 rounded-full border border-white dark:border-zinc-950 scale-50 bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Light / Dark Mode toggle button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95 cursor-pointer shadow-xs"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? (
          <Sun size={15} className="animate-spin-slow" />
        ) : (
          <Moon size={15} />
        )}
      </button>
    </div>
  );
}
