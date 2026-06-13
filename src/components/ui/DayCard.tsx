'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Clock, AlertCircle, Calendar } from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { useTaskStore } from '@/lib/store';
import { getTasksForDate, getDelayDays } from '@/lib/taskUtils';
import { getDayName, getMonthDayLabel, isToday } from '@/lib/dateUtils';
import TaskItem from './TaskItem';

interface DayCardProps {
  date: Date;
}

export default function DayCard({ date }: DayCardProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const setCurrentDate = useTaskStore((state) => state.setCurrentDate);
  const setViewMode = useTaskStore((state) => state.setViewMode);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Get tasks relevant to this date
  const dayTasks = getTasksForDate(tasks, date);

  // Focus input when inline form opens
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Determine status color/icon
  const getStatusDetails = () => {
    const activeTasks = dayTasks.filter(t => !t.completed);
    if (activeTasks.length === 0) {
      return { className: 'status-green', icon: <Check /> };
    }

    let maxDelay = 0;
    activeTasks.forEach(task => {
      const delay = getDelayDays(task, date);
      if (delay > maxDelay) {
        maxDelay = delay;
      }
    });

    if (maxDelay === 0) {
      return { className: 'status-green', icon: <Check /> };
    } else if (maxDelay >= 4) {
      return { className: 'status-red', icon: <AlertCircle /> };
    } else {
      return { className: 'status-amber', icon: <Clock /> };
    }
  };

  const status = getStatusDetails();

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const formattedDate = formatISO(date, { representation: 'date' }); // YYYY-MM-DD
    addTask(newTitle.trim(), formattedDate);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTitle('');
    }
  };

  // Navigating to Day View on header click
  const handleHeaderClick = () => {
    setCurrentDate(date);
    setViewMode('day');
  };

  return (
    <div className={`day-card ${isToday(date) ? 'is-today' : ''}`}>
      <div 
        className="day-card-header" 
        onClick={handleHeaderClick}
        style={{ cursor: 'pointer' }}
        title="View details for this day"
      >
        <div className="day-card-header-left">
          <span className="day-card-name">{getDayName(date)}</span>
          <span className="day-card-date">{getMonthDayLabel(date)}</span>
        </div>
        <div className={`day-card-status ${status.className}`}>
          {status.icon}
        </div>
      </div>

      <div className="day-card-body">
        {dayTasks.length === 0 ? (
          <div className="empty-state">
            <Calendar />
            <span>No tasks</span>
          </div>
        ) : (
          dayTasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              viewingDate={date} 
            />
          ))
        )}
      </div>

      <div className="day-card-footer">
        {isAdding ? (
          <form className="inline-add-form" onSubmit={handleInlineSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="inline-add-input"
              placeholder="Press Enter to add..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                // Delay blur slightly so submit click registers
                setTimeout(() => {
                  setIsAdding(false);
                  setNewTitle('');
                }, 200);
              }}
            />
            <button type="submit" className="inline-add-submit">
              <Plus />
            </button>
          </form>
        ) : (
          <button 
            className="add-task-inline" 
            onClick={() => setIsAdding(true)}
          >
            <Plus />
            <span>Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
