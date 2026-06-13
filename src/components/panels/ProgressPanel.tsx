'use client';

import React from 'react';
import { useTaskStore } from '@/lib/store';
import { getWeeklyProgress } from '@/lib/taskUtils';
import { startOfWeek, endOfWeek } from '@/lib/dateUtils';
import { Check, Compass, AlertCircle } from 'lucide-react';

export default function ProgressPanel() {
  const tasks = useTaskStore((state) => state.tasks);
  const currentDate = useTaskStore((state) => state.currentDate);

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const progress = getWeeklyProgress(tasks, weekStart, weekEnd);

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  
  // Circumference for r=50 circle: 2 * PI * 50 = 314.16
  const circumference = 314.16;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="progress-panel">
      <h3>Weekly Progress</h3>
      
      <div className="progress-content">
        <div className="progress-chart">
          <svg viewBox="0 0 140 140">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r="50"
              stroke="var(--slate-100)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="70"
              cy="70"
              r="50"
              stroke="var(--blue-600)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <div className="progress-center">
            <div className="progress-percent">{percent}%</div>
            <div className="progress-label">COMPLETED</div>
          </div>
        </div>

        <div className="progress-stats">
          <div className="progress-stat">
            <div 
              className="progress-stat-icon" 
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: 'var(--green-500)' }}
            >
              <Check size={14} />
            </div>
            <span className="progress-stat-count">{progress.completed}</span>
            <span className="progress-stat-label">Completed</span>
          </div>

          <div className="progress-stat">
            <div 
              className="progress-stat-icon" 
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--blue-500)' }}
            >
              <Compass size={14} />
            </div>
            <span className="progress-stat-count">{progress.inProgress}</span>
            <span className="progress-stat-label">On Track</span>
          </div>

          <div className="progress-stat">
            <div 
              className="progress-stat-icon" 
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--red-500)' }}
            >
              <AlertCircle size={14} />
            </div>
            <span className="progress-stat-count">{progress.delayed}</span>
            <span className="progress-stat-label">Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
