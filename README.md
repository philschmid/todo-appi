# Todo.Lab — Experimental Task Laboratory

Todo.Lab is a premium, developer-focused React + TypeScript + Tailwind CSS v4 todo application designed to showcase advanced interactive features. It functions as a product feature showcase, housing a set of toggleable "Experimental Feature Flags" inside the user interface.

## 🧪 Showcase of Experimental Features

Todo.Lab includes six toggleable feature laboratory extensions:

1. **Natural Language Parser (NLP)**
   - Type tasks like: `Buy groceries !high tomorrow #personal (25m)`
   - The app dynamically parses input tokens in real-time, displaying tag chips (`#personal`), priority indicators (`!high`), due dates (`tomorrow`), and focused durations (`(25m)`) before you submit.
2. **Keyboard Hotkeys**
   - Gmail/Vim-style quick hotkeys for navigation.
   - Press `/` to search, `n` to create a task, `a/o/d/t/u` to filter, `p` to pause/play Pomodoro sessions, and `?` to toggle a beautiful, interactive cheat sheet overlay.
3. **Pomodoro Focus Timer**
   - Click a task's play icon to launch a focused session on it.
   - Features a big, clean countdown clock with a smooth SVG-animated radial progress indicator and custom session mode selectors.
4. **Command Bar (⌘K)**
   - Press `Cmd+K` (or `Ctrl+K`) to toggle a command menu.
   - Autocomplete instructions let you change light/dark themes, switch accent colors, clear completed tasks, filter, or quick-add new tasks.
5. **Analytics Panel**
   - Real-time productivity reporting including completion rate progress bars and active priority distribution bar charts.
6. **Audio Synthesizer**
   - Uses the browser's native `AudioContext` API to play synthesized chime tones for tactile click feedback, task completions, and timer endpoints—no external MP3/audio files needed.

## 🎨 Design System & Aesthetics

Todo.Lab implements the strict visual rules defined in the [taste-skill](./SKILL.md) specification:
- **Clean B2B/Linear-style:** A premium grid-based interface using standard system sans-serif font typography.
- **Dials Set:** `DESIGN_VARIANCE: 5` (clean alignment), `MOTION_INTENSITY: 5` (organic Motion spring animations), `VISUAL_DENSITY: 4` (airy, generous breathing room).
- **No AI-slop colors:** Neutrals (Zinc/Slate bases) paired with exactly *one* accent color selected dynamically by the user (Rose, Cobalt, Emerald, or Violet).
- **Responsive viewport stability:** Uses `min-h-[100dvh]` to prevent layout jumping on iOS Safari, and wraps inputs with custom rounded-xl elements.
- **Dark Mode first:** Cohesive color schemas automatically synced with system preferences, with manual override.

## 🚀 Getting Started

To run the project locally, install Node.js and run the following terminal commands:

```bash
# 1. Clone repository (or navigate inside the project folder)
cd todo-appi

# 2. Install dependencies
npm install

# 3. Spin up local development server
npm run dev

# 4. Compile static assets for production deployment
npm run build
```

## 📄 License

Licensed under the [Apache License, Version 2.0](./LICENSE) (the "License"). You may not use this file except in compliance with the License.
