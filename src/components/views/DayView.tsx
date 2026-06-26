'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { getTasksForDate } from '@/lib/taskUtils';
import { format, formatISO } from 'date-fns';
import TaskItem from '@/components/ui/TaskItem';
import ProcrastinationBar from '@/components/panels/ProcrastinationBar';
import ProgressPanel from '@/components/panels/ProgressPanel';
import { Plus, Calendar } from 'lucide-react';

export default function DayView() {
  const currentDate = useTaskStore((state) => state.currentDate);
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const dayTasks = getTasksForDate(tasks, currentDate);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const formattedDate = formatISO(currentDate, { representation: 'date' });
    addTask(newTitle.trim(), formattedDate);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="day-view">
      <div className="day-view-main">
        <div className="day-view-header">
          <h2 className="day-view-title">Tasks for Today</h2>
          <span className="day-view-date">{format(currentDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        
        <div className="day-view-tasks" style={{ marginBottom: '20px' }}>
          {dayTasks.length === 0 ? (
            <div className="empty-state">
              <Calendar />
              <span>No tasks for this day. Enjoy your day off!</span>
            </div>
          ) : (
            dayTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                viewingDate={currentDate} 
              />
            ))
          )}
        </div>

        <div style={{ padding: '0 4px' }}>
          {isAdding ? (
            <form className="inline-add-form" onSubmit={handleInlineSubmit} style={{ maxWidth: '400px' }}>
              <input
                ref={inputRef}
                type="text"
                className="inline-add-input"
                placeholder="Press Enter to add task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewTitle('');
                  }
                }}
                onBlur={() => {
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

      <div className="day-view-sidebar">
        <ProcrastinationBar />
        <ProgressPanel />
      </div>
    </div>
  );
}
