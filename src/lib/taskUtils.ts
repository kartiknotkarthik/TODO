import {
  addDays,
  differenceInCalendarDays,
  parseISO,
  isBefore,
  isAfter,
  isWithinInterval,
  startOfDay,
} from 'date-fns';

import type { Task } from '@/types';
import { isSameDay, startOfWeek, endOfWeek } from '@/lib/dateUtils';

/**
 * Returns how many days overdue a task is relative to the current date.
 * Returns 0 if the task is not overdue (dueDate is today or in the future).
 */
export function getDelayDays(task: Task, currentDate: Date): number {
  const dueDate = parseISO(task.dueDate);
  const diff = differenceInCalendarDays(startOfDay(currentDate), startOfDay(dueDate));
  return Math.max(0, diff);
}

/**
 * Returns an HSL/hex color string based on how many days a task is delayed.
 * - 0 days: green (on track)
 * - 1 day: lime
 * - 2 days: amber
 * - 3 days: orange
 * - 4+ days: red
 */
export function getDelayColor(delayDays: number): string {
  switch (delayDays) {
    case 0:
      return '#22C55E'; // green
    case 1:
      return '#84CC16'; // lime
    case 2:
      return '#F59E0B'; // amber
    case 3:
      return '#F97316'; // orange
    default:
      return '#EF4444'; // red
  }
}

/**
 * Returns a human-readable label describing how delayed a task is.
 */
export function getDelayLabel(delayDays: number): string {
  if (delayDays === 0) return 'On track';
  if (delayDays === 1) return 'Delayed by 1 day';
  return `Delayed by ${delayDays} days`;
}

/**
 * Returns the calendar day a task currently occupies.
 * Incomplete overdue tasks advance one day at a time (never skipping ahead of `asOfDay`).
 */
export function getCarrySlot(task: Task, asOfDay: Date): Date {
  const dueDate = startOfDay(parseISO(task.dueDate));
  const asOf = startOfDay(asOfDay);

  if (isBefore(asOf, dueDate)) {
    return dueDate;
  }

  if (task.completed && task.completedAt) {
    return startOfDay(parseISO(task.completedAt));
  }

  let slot = dueDate;
  let day = dueDate;
  while (isBefore(day, asOf)) {
    slot = addDays(slot, 1);
    day = addDays(day, 1);
  }
  return slot;
}

/**
 * Returns tasks that should be visible on a given date:
 * - Scheduled tasks appear only on their due date
 * - Incomplete overdue tasks appear on a single carry slot (today), not on every future day
 * - Completed tasks appear on their completion day and original due date
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const targetDay = startOfDay(date);
  const today = startOfDay(new Date());

  return tasks.filter((task) => {
    const dueDate = startOfDay(parseISO(task.dueDate));

    if (task.completed && task.completedAt) {
      const completedDate = startOfDay(parseISO(task.completedAt));
      if (isSameDay(completedDate, targetDay)) return true;
      if (isSameDay(dueDate, targetDay) && !isSameDay(dueDate, completedDate)) return true;
      return false;
    }

    // Future scheduled tasks: visible on their due date only
    if (isAfter(dueDate, today)) {
      return isSameDay(dueDate, targetDay);
    }

    // Overdue carry-forward must not appear on days that have not arrived yet
    if (isBefore(today, targetDay)) {
      return false;
    }

    const slot = getCarrySlot(task, today);
    return isSameDay(slot, targetDay);
  });
}

export interface ProcrastinationEntry {
  task: Task;
  daysTaken: number;
  isPending: boolean;
}

/**
 * Returns tasks with procrastination metrics: days pending (incomplete) or days taken to complete.
 */
export function getProcrastinationTasks(
  tasks: Task[],
  currentDate: Date
): ProcrastinationEntry[] {
  const today = startOfDay(currentDate);

  return tasks
    .map((task): ProcrastinationEntry | null => {
      const dueDate = startOfDay(parseISO(task.originalDueDate));

      if (task.completed && task.completedAt) {
        const completedDate = startOfDay(parseISO(task.completedAt));
        const daysTaken = differenceInCalendarDays(completedDate, dueDate);
        if (daysTaken <= 0) return null;
        return { task, daysTaken, isPending: false };
      }

      if (isBefore(dueDate, today)) {
        const daysTaken = differenceInCalendarDays(today, dueDate);
        return { task, daysTaken, isPending: true };
      }

      return null;
    })
    .filter((entry): entry is ProcrastinationEntry => entry !== null)
    .sort((a, b) => b.daysTaken - a.daysTaken);
}

/**
 * Returns aggregate stats for tasks within a given week range,
 * used by the progress panel.
 */
export function getWeeklyProgress(
  tasks: Task[],
  weekStart: Date,
  weekEnd: Date
): { completed: number; inProgress: number; delayed: number; total: number } {
  const start = startOfDay(weekStart);
  const end = startOfDay(weekEnd);

  // Filter tasks relevant to this week
  const weekTasks = tasks.filter((task) => {
    const dueDate = parseISO(task.dueDate);
    const dueDayStart = startOfDay(dueDate);

    // Task is due within the week
    if (isWithinInterval(dueDayStart, { start, end })) {
      return true;
    }

    // Uncompleted task carried into this week (due before week start)
    let isCompletedBeforeWeekStart = false;
    if (task.completed && task.completedAt) {
      const completedDate = startOfDay(parseISO(task.completedAt));
      if (isBefore(completedDate, start)) {
        isCompletedBeforeWeekStart = true;
      }
    }

    if (!isCompletedBeforeWeekStart && isBefore(dueDayStart, start)) {
      return true;
    }

    return false;
  });

  const today = startOfDay(new Date());

  let completed = 0;
  let inProgress = 0;
  let delayed = 0;

  for (const task of weekTasks) {
    if (task.completed) {
      completed++;
    } else {
      const dueDate = startOfDay(parseISO(task.dueDate));
      if (isBefore(dueDate, today)) {
        delayed++;
      } else {
        inProgress++;
      }
    }
  }

  return {
    completed,
    inProgress,
    delayed,
    total: weekTasks.length,
  };
}

/**
 * Returns true if the task can be checked/unchecked on the viewing date.
 * Toggling is only permitted if the viewingDate is within [-1, 0, 1] days of today.
 */
export function isTaskEditable(viewingDate: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(viewingDate);
  const diff = differenceInCalendarDays(target, today);
  return diff >= -1 && diff <= 1;
}

export interface TaskVisualState {
  isCompleted: boolean;
  highlightClass: string;
  isTranslucent: boolean;
}

/**
 * Computes completion status and CSS class styling for a task relative to the viewing date.
 */
export function getTaskVisualState(task: Task, date: Date): TaskVisualState {
  const targetDay = startOfDay(date);
  const taskDueDate = startOfDay(parseISO(task.dueDate));
  const today = startOfDay(new Date());

  // 1. Determine completion status as of the viewing date
  let isCompletedAsOfDate = false;
  let completedDate: Date | null = null;
  if (task.completed && task.completedAt) {
    completedDate = startOfDay(parseISO(task.completedAt));
    if (!isBefore(targetDay, completedDate)) {
      isCompletedAsOfDate = true;
    }
  }

  // 2. Determine highlighting
  if (isCompletedAsOfDate && completedDate) {
    const isDayOfCompletion = isSameDay(targetDay, completedDate);
    if (isDayOfCompletion) {
      // Completed on this viewing date -> light green highlight, not translucent
      return {
        isCompleted: true,
        highlightClass: 'completed-highlight-green',
        isTranslucent: false,
      };
    } else {
      // Old completed task -> translucent, strikethrough, highlighted based on delay at completion:
      // Red highlight if it was completed delayed; Green highlight if completed on-time.
      const wasDelayed = isBefore(taskDueDate, completedDate);
      return {
        isCompleted: true,
        highlightClass: wasDelayed ? 'old-completed-highlight-red' : 'old-completed-highlight-green',
        isTranslucent: true,
      };
    }
  }

  // 3. Task is uncompleted as of date
  // Is it viewed on its original due date?
  if (isSameDay(taskDueDate, targetDay)) {
    const gap = differenceInCalendarDays(today, taskDueDate);
    if (gap > 0) {
      // Original date overdue -> Orange if gap <= 3 days, Red if gap > 3 days
      return {
        isCompleted: false,
        highlightClass: gap <= 3 ? 'delayed-highlight-orange' : 'delayed-highlight-red',
        isTranslucent: false,
      };
    }
    return {
      isCompleted: false,
      highlightClass: '',
      isTranslucent: false,
    };
  }

  // Carried forward to today (single slot)
  if (isBefore(taskDueDate, targetDay)) {
    const gap = differenceInCalendarDays(targetDay, taskDueDate);
    return {
      isCompleted: false,
      highlightClass: gap <= 3 ? 'delayed-highlight-orange' : 'delayed-highlight-red',
      isTranslucent: false,
    };
  }

  return {
    isCompleted: false,
    highlightClass: '',
    isTranslucent: false,
  };
}


