import {
  differenceInCalendarDays,
  parseISO,
  isBefore,
  isWithinInterval,
  startOfDay,
  format,
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
 * Returns tasks that should be visible on a given date:
 * - Tasks whose dueDate matches the date
 * - Uncompleted tasks (as of targetDay) whose dueDate is before the date (carried forward)
 * - Completed tasks (as of targetDay) that were completed during the current week (shown as translucent)
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const targetDay = startOfDay(date);
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  return tasks.filter((task) => {
    const taskDueDate = startOfDay(parseISO(task.dueDate));

    // Case 1: Original due date matches targetDay
    if (isSameDay(taskDueDate, targetDay)) {
      return true;
    }

    // Helper: Determine if task was completed on or before targetDay
    let isCompletedAsOfDate = false;
    let completedDate: Date | null = null;
    if (task.completed && task.completedAt) {
      completedDate = startOfDay(parseISO(task.completedAt));
      if (!isBefore(targetDay, completedDate)) {
        isCompletedAsOfDate = true;
      }
    }

    // Case 2: Uncompleted as of targetDay, and due date is before targetDay (uncompleted carry-forward)
    if (!isCompletedAsOfDate && isBefore(taskDueDate, targetDay)) {
      return true;
    }

    // Case 3: Completed as of targetDay, due date is before targetDay,
    // and completion date is in the same week as targetDay (completed carry-forward till end of week)
    if (isCompletedAsOfDate && completedDate && isBefore(taskDueDate, targetDay)) {
      return isWithinInterval(completedDate, {
        start: startOfDay(weekStart),
        end: startOfDay(weekEnd),
      });
    }

    return false;
  });
}

/**
 * Returns tasks that have been carried forward past their original due date,
 * along with delay information.
 */
export function getCarriedForwardTasks(
  tasks: Task[],
  currentDate: Date
): { task: Task; delayDays: number; carriedTo: string }[] {
  const today = startOfDay(currentDate);

  return tasks
    .filter((task) => {
      // Determine if task was completed on or before today
      let isCompletedAsOfDate = false;
      if (task.completed && task.completedAt) {
        const completedDate = startOfDay(parseISO(task.completedAt));
        if (!isBefore(today, completedDate)) {
          isCompletedAsOfDate = true;
        }
      }
      if (isCompletedAsOfDate) return false;

      const dueDate = parseISO(task.dueDate);
      return isBefore(startOfDay(dueDate), today);
    })
    .map((task) => {
      const delayDays = getDelayDays(task, currentDate);
      const carriedTo = format(today, 'yyyy-MM-dd');
      return { task, delayDays, carriedTo };
    });
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

  // Is it carried forward?
  if (isBefore(taskDueDate, targetDay)) {
    const delayDays = differenceInCalendarDays(targetDay, taskDueDate);
    let highlightClass = '';
    if (delayDays === 0) {
      highlightClass = 'delay-highlight-green';
    } else if (delayDays === 1) {
      highlightClass = 'delay-highlight-lime';
    } else if (delayDays === 2) {
      highlightClass = 'delay-highlight-amber';
    } else if (delayDays === 3) {
      highlightClass = 'delay-highlight-orange';
    } else {
      highlightClass = 'delay-highlight-red';
    }

    return {
      isCompleted: false,
      highlightClass,
      isTranslucent: false,
    };
  }

  return {
    isCompleted: false,
    highlightClass: '',
    isTranslucent: false,
  };
}


