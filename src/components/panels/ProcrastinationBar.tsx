'use client';

import React from 'react';
import { useTaskStore } from '@/lib/store';
import { getProcrastinationTasks, getDelayColor } from '@/lib/taskUtils';
import { parseISO } from 'date-fns';
import { getMonthDayLabel } from '@/lib/dateUtils';
import { Timer } from 'lucide-react';

const MAX_BAR_DAYS = 7;

export default function ProcrastinationBar() {
  const tasks = useTaskStore((state) => state.tasks);
  const currentDate = useTaskStore((state) => state.currentDate);

  const procrastinated = getProcrastinationTasks(tasks, currentDate);

  return (
    <div className="procrastination-bar">
      <h3>Procrastination Bar</h3>

      {procrastinated.length === 0 ? (
        <div className="empty-state" style={{ padding: '16px' }}>
          <Timer />
          <span>No procrastinated tasks — great discipline!</span>
        </div>
      ) : (
        <div className="procrastination-list">
          {procrastinated.map(({ task, daysTaken, isPending }) => {
            const color = getDelayColor(daysTaken);
            const barWidth = Math.min(100, (daysTaken / MAX_BAR_DAYS) * 100);
            const originalDateLabel = getMonthDayLabel(parseISO(task.originalDueDate));

            return (
              <div key={task.id} className="procrastination-item">
                <div className="procrastination-item-header">
                  <span className="procrastination-title">{task.title}</span>
                  <span className="procrastination-days" style={{ color }}>
                    {isPending
                      ? `${daysTaken} day${daysTaken === 1 ? '' : 's'} pending`
                      : `Took ${daysTaken} day${daysTaken === 1 ? '' : 's'}`}
                  </span>
                </div>
                <div className="procrastination-bar-track">
                  <div
                    className="procrastination-bar-fill"
                    style={{ width: `${barWidth}%`, backgroundColor: color }}
                  />
                </div>
                <span className="procrastination-date">Originally: {originalDateLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
