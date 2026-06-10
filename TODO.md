# Todo.Lab — Future Features & Enhancements

This document outlines upcoming features and potential directions for the Todo.Lab task manager.

## 🚀 Priority Backlog

- [ ] **Cloud Sync & CRDTs**
  - Integrate a lightweight database (e.g., Supabase or Firebase) for persistent cross-device synchronization.
  - Implement CRDTs (like Yjs) to enable collaborative multiplayer workspace lists.
- [ ] **Web Audio Ambient Generator**
  - Use the native browser `AudioContext` to synthesize ambient focus sounds (e.g., white noise, brown noise, soft rain, or metronome ticks) to accompany the Pomodoro Focus timer.
- [ ] **Task Time-blocking & Calendar Grid**
  - Build a calendar view that allows dragging tasks from the list directly into a hourly calendar grid for daily planner schedules.
- [ ] **Subtasks & Nested Checklists**
  - Add support for breaking major tasks into a tree of subtasks, displaying inline completion progress bars.
- [ ] **Advanced NLP Recurrence & Assignees**
  - Enhance the NLP token parser to identify recurring patterns (e.g., `every Friday`, `every morning`) and team assignments (e.g., `@maria`).
- [ ] **Local Notifications & PWA**
  - Set up Service Workers and Push Notification APIs to send push alerts when Pomodoro timers expire or tasks reach their deadline, even if the tab is inactive.
- [ ] **Command Bar Integrations**
  - Expose more advanced shortcuts through the ⌘K command bar: export tasks as markdown, import task sets from JSON, or invoke search commands.
