'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task, ViewMode, TaskStore } from '@/types';
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  formatISO,
} from 'date-fns';

// ---------------------------------------------------------------------------
// Seed data – realistic productivity tasks spread across the current week
// ---------------------------------------------------------------------------
function createSeedTasks(): Task[] {
  const today = startOfDay(new Date());
  const iso = (d: Date) => formatISO(d, { representation: 'date' }); // YYYY-MM-DD
  const now = new Date().toISOString();

  return [
    {
      id: crypto.randomUUID(),
      title: 'Complete market research',
      dueDate: iso(subDays(today, 2)),
      completed: true,
      completedAt: subDays(today, 2).toISOString(),
      originalDueDate: iso(subDays(today, 2)),
      createdAt: subDays(today, 4).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Write product requirements',
      dueDate: iso(subDays(today, 1)),
      completed: true,
      completedAt: subDays(today, 1).toISOString(),
      originalDueDate: iso(subDays(today, 1)),
      createdAt: subDays(today, 3).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Study user personas',
      dueDate: iso(subDays(today, 1)),
      completed: false,
      completedAt: null,
      originalDueDate: iso(subDays(today, 1)),
      createdAt: subDays(today, 3).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: '30 min exercise',
      dueDate: iso(today),
      completed: false,
      completedAt: null,
      originalDueDate: iso(today),
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Call with product mentor',
      dueDate: iso(today),
      completed: false,
      completedAt: null,
      originalDueDate: iso(today),
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Read Product Strategy book',
      dueDate: iso(addDays(today, 1)),
      completed: false,
      completedAt: null,
      originalDueDate: iso(addDays(today, 1)),
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Prepare for stakeholder call',
      dueDate: iso(addDays(today, 2)),
      completed: false,
      completedAt: null,
      originalDueDate: iso(addDays(today, 2)),
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Weekly review & planning',
      dueDate: iso(addDays(today, 3)),
      completed: false,
      completedAt: null,
      originalDueDate: iso(addDays(today, 3)),
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Draft competitive analysis',
      dueDate: iso(subDays(today, 3)),
      completed: true,
      completedAt: subDays(today, 3).toISOString(),
      originalDueDate: iso(subDays(today, 3)),
      createdAt: subDays(today, 5).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Update project roadmap',
      dueDate: iso(addDays(today, 1)),
      completed: false,
      completedAt: null,
      originalDueDate: iso(addDays(today, 1)),
      createdAt: now,
    },
  ];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // ---- State ----------------------------------------------------------
      tasks: createSeedTasks(),
      viewMode: 'week' as ViewMode,
      currentDate: new Date(),
      isModalOpen: false,

      // ---- Actions --------------------------------------------------------
      addTask: (title: string, dueDate: string) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              title,
              dueDate,
              completed: false,
              completedAt: null,
              originalDueDate: dueDate,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      toggleTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed
                    ? new Date().toISOString()
                    : null,
                }
              : task,
          ),
        })),

      deleteTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

      setCurrentDate: (date: Date) => set({ currentDate: date }),

      navigateForward: () => {
        const { currentDate, viewMode } = get();
        const next =
          viewMode === 'day'
            ? addDays(currentDate, 1)
            : viewMode === 'week'
              ? addWeeks(currentDate, 1)
              : addMonths(currentDate, 1);
        set({ currentDate: next });
      },

      navigateBackward: () => {
        const { currentDate, viewMode } = get();
        const prev =
          viewMode === 'day'
            ? subDays(currentDate, 1)
            : viewMode === 'week'
              ? subWeeks(currentDate, 1)
              : subMonths(currentDate, 1);
        set({ currentDate: prev });
      },

      goToToday: () => set({ currentDate: new Date() }),

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
    }),
    {
      name: 'todo-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      // Convert currentDate back to a Date when rehydrating from JSON
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as Partial<TaskStore>),
        };
        // Ensure currentDate is always a proper Date object after rehydration
        if (typeof merged.currentDate === 'string') {
          merged.currentDate = new Date(merged.currentDate);
        }
        return merged;
      },
    },
  ),
);
