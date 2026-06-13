import {
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  getISOWeek,
  isSameDay as dateFnsIsSameDay,
  isToday as dateFnsIsToday,
} from 'date-fns';

import type { ViewMode } from '@/types';

/**
 * Returns an array of 7 dates for the week containing the given date (Mon-Sun).
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Returns an array of week arrays for the calendar month grid.
 * Each inner array contains 7 dates (Mon-Sun), including overflow days
 * from adjacent months to fill complete weeks.
 */
export function getMonthWeeks(date: Date): Date[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get the Monday of the first week and Sunday of the last week
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Formats a date header string based on the current view mode.
 * - day: 'Thursday, June 5, 2025'
 * - week: 'June 2 - June 8, 2025' (or 'May 26 - June 1, 2025' for cross-month)
 * - month: 'June 2025'
 */
export function formatDateHeader(date: Date, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'day':
      return format(date, 'EEEE, MMMM d, yyyy');

    case 'week': {
      const weekStart = startOfWeek(date);
      const weekEnd = endOfWeek(date);
      const startYear = weekStart.getFullYear();
      const endYear = weekEnd.getFullYear();

      if (startYear !== endYear) {
        // Cross-year: 'December 29, 2025 - January 4, 2026'
        return `${format(weekStart, 'MMMM d, yyyy')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
      }

      const startMonth = weekStart.getMonth();
      const endMonth = weekEnd.getMonth();

      if (startMonth !== endMonth) {
        // Cross-month: 'May 26 - June 1, 2025'
        return `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
      }

      // Same month: 'June 2 - June 8, 2025'
      return `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
    }

    case 'month':
      return format(date, 'MMMM yyyy');
  }
}

/**
 * Returns the ISO week number for a given date.
 */
export function getWeekNumber(date: Date): number {
  return getISOWeek(date);
}

/**
 * Returns true if both dates fall on the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return dateFnsIsSameDay(a, b);
}

/**
 * Returns true if the given date is today.
 */
export function isToday(date: Date): boolean {
  return dateFnsIsToday(date);
}

/**
 * Returns the short day name, e.g. 'Mon', 'Tue'.
 */
export function getDayName(date: Date): string {
  return format(date, 'EEE');
}

/**
 * Returns a short month-day label, e.g. 'Jun 5'.
 */
export function getMonthDayLabel(date: Date): string {
  return format(date, 'MMM d');
}

/**
 * Returns the Monday (start) of the week containing the given date.
 * Uses ISO week convention where Monday is the first day.
 */
export function startOfWeek(date: Date): Date {
  return dateFnsStartOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Returns the Sunday (end) of the week containing the given date.
 * Uses ISO week convention where Sunday is the last day.
 */
export function endOfWeek(date: Date): Date {
  return dateFnsEndOfWeek(date, { weekStartsOn: 1 });
}
