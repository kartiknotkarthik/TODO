'use client';

import React from 'react';
import { useTaskStore } from '@/lib/store';
import { getMonthWeeks, isToday } from '@/lib/dateUtils';
import { getTasksForDate, getDelayDays, getDelayColor } from '@/lib/taskUtils';
import { format } from 'date-fns';

export default function MonthView() {
  const currentDate = useTaskStore((state) => state.currentDate);
  const tasks = useTaskStore((state) => state.tasks);
  const setCurrentDate = useTaskStore((state) => state.setCurrentDate);
  const setViewMode = useTaskStore((state) => state.setViewMode);

  const weeks = getMonthWeeks(currentDate);
  const headers = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleCellClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  return (
    <div className="month-grid">
      {/* Week Headers */}
      {headers.map((h) => (
        <div key={h} className="month-day-header">
          {h}
        </div>
      ))}

      {/* Calendar Cells */}
      {weeks.flat().map((date) => {
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const dayTasks = getTasksForDate(tasks, date);
        
        // Show up to 2 tasks, overflow to "+ X more"
        const maxTasksToShow = 2;
        const visibleTasks = dayTasks.slice(0, maxTasksToShow);
        const remainingTasks = dayTasks.length - maxTasksToShow;

        return (
          <div
            key={date.toISOString()}
            className={`month-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${
              isToday(date) ? 'is-today' : ''
            }`}
            onClick={() => handleCellClick(date)}
          >
            <div className="month-day-number">{format(date, 'd')}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
              {visibleTasks.map((task) => {
                const delayDays = getDelayDays(task, date);
                const color = task.completed ? 'var(--slate-300)' : getDelayColor(delayDays);
                return (
                  <div
                    key={task.id}
                    className={`month-task-dot ${task.completed ? 'completed' : ''}`}
                    title={task.title}
                  >
                    <span
                      className="month-task-dot-icon"
                      style={{ backgroundColor: color }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
              {remainingTasks > 0 && (
                <div className="month-tasks-more">
                  +{remainingTasks} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
