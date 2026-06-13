'use client';

import React from 'react';
import { useTaskStore } from '@/lib/store';
import { getCarriedForwardTasks, getDelayColor, getDelayLabel } from '@/lib/taskUtils';
import { parseISO } from 'date-fns';
import { getMonthDayLabel } from '@/lib/dateUtils';
import { CalendarRange } from 'lucide-react';

export default function CarryForwardPanel() {
  const tasks = useTaskStore((state) => state.tasks);
  const currentDate = useTaskStore((state) => state.currentDate);

  const carriedForward = getCarriedForwardTasks(tasks, currentDate);

  return (
    <div className="carry-forward-panel">
      <h3>Carried Forward Tasks</h3>
      
      {carriedForward.length === 0 ? (
        <div className="empty-state" style={{ padding: '16px' }}>
          <CalendarRange />
          <span>All caught up! No tasks carried forward.</span>
        </div>
      ) : (
        <div className="carry-forward-list">
          {carriedForward.map(({ task, delayDays }) => {
            const color = getDelayColor(delayDays);
            const originalDateLabel = getMonthDayLabel(parseISO(task.originalDueDate));
            
            return (
              <div key={task.id} className="carry-forward-item">
                <span 
                  className="carry-forward-dot" 
                  style={{ backgroundColor: color }} 
                />
                <span className="carry-forward-title">{task.title}</span>
                <span 
                  className="carry-forward-delay" 
                  style={{ color }}
                >
                  {getDelayLabel(delayDays)}
                </span>
                <span className="carry-forward-date">
                  Originally: {originalDateLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
