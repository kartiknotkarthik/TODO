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
 * - Uncompleted tasks whose dueDate is before the date (carried forward)
 * - Completed tasks that were completed during the current week (shown as translucent)
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const targetDay = startOfDay(date);
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  return tasks.filter((task) => {
    const taskDueDate = parseISO(task.dueDate);

    // Tasks whose dueDate matches the given date
    if (isSameDay(taskDueDate, targetDay)) {
      return true;
    }

    // Uncompleted tasks whose dueDate is before the date (carried forward)
    if (!task.completed && isBefore(startOfDay(taskDueDate), targetDay)) {
      return true;
    }

    // Completed tasks that were completed during the current week
    if (task.completed && task.completedAt) {
      const completedDate = parseISO(task.completedAt);
      if (
        isBefore(startOfDay(taskDueDate), targetDay) &&
        isWithinInterval(startOfDay(completedDate), {
          start: startOfDay(weekStart),
          end: startOfDay(weekEnd),
        })
      ) {
        return true;
      }
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
      if (task.completed) return false;
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
    if (!task.completed && isBefore(dueDayStart, start)) {
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
 * Returns true if the task is completed but being shown on a carry-forward
 * day within the same week. Used to render the task as translucent.
 */
export function shouldShowAsCompleted(task: Task, date: Date): boolean {
  if (!task.completed || !task.completedAt) return false;

  const taskDueDate = parseISO(task.dueDate);

  // Only applies to carried-forward tasks (due before the given date)
  if (!isBefore(startOfDay(taskDueDate), startOfDay(date))) return false;

  const completedDate = parseISO(task.completedAt);
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  // Completed within the same week as the viewing date
  return isWithinInterval(startOfDay(completedDate), {
    start: startOfDay(weekStart),
    end: startOfDay(weekEnd),
  });
}
