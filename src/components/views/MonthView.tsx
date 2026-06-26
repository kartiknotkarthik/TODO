'use client';

import React from 'react';
import { useTaskStore } from '@/lib/store';
import { getMonthWeeks, isToday } from '@/lib/dateUtils';
import { getTasksForDate, isTaskEditable, getTaskVisualState } from '@/lib/taskUtils';
import { format } from 'date-fns';

export default function MonthView() {
  const currentDate = useTaskStore((state) => state.currentDate);
  const tasks = useTaskStore((state) => state.tasks);
  const setCurrentDate = useTaskStore((state) => state.setCurrentDate);
  const setViewMode = useTaskStore((state) => state.setViewMode);
  const toggleTask = useTaskStore((state) => state.toggleTask);

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
        const visibleTasks = dayTasks;
        const isEditable = isTaskEditable(date);

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
                const { isCompleted, highlightClass, isTranslucent } = getTaskVisualState(task, date);
                return (
                  <div
                    key={task.id}
                    className={`month-task-dot ${isCompleted ? 'completed' : ''} ${highlightClass}`}
                    title={
                      isEditable 
                        ? `${task.title} (Click to toggle completion)`
                        : `${task.title} (Read-only: outside edit window)`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEditable) {
                        toggleTask(task.id);
                      }
                    }}
                    style={{ 
                      cursor: isEditable ? 'pointer' : 'default',
                      opacity: isTranslucent ? 0.55 : 1
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
