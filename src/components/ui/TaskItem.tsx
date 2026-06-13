'use client';

import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { useTaskStore } from '@/lib/store';
import { getDelayDays, getDelayColor, shouldShowAsCompleted } from '@/lib/taskUtils';
import { parseISO } from 'date-fns';
import { isSameDay } from '@/lib/dateUtils';

interface TaskItemProps {
  task: Task;
  viewingDate: Date;
}

export default function TaskItem({ task, viewingDate }: TaskItemProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [justChecked, setJustChecked] = useState(false);

  const isCompletedOnOriginalDate = task.completed && isSameDay(parseISO(task.dueDate), viewingDate);
  const isCompletedCarriedForward = shouldShowAsCompleted(task, viewingDate);
  
  let itemClass = '';
  if (isCompletedOnOriginalDate) {
    itemClass = 'completed';
  } else if (isCompletedCarriedForward) {
    itemClass = 'carried-forward';
  }

  const delayDays = getDelayDays(task, viewingDate);
  const showDelayDot = !task.completed && delayDays > 0;
  const delayColor = getDelayColor(delayDays);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 300);
    }
    toggleTask(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  return (
    <div 
      className={`task-item ${itemClass}`}
      onClick={handleToggle}
    >
      <div 
        className={`task-checkbox ${task.completed ? 'checked' : ''} ${justChecked ? 'just-checked' : ''}`}
      >
        {task.completed && <Check />}
      </div>
      <span className="task-title">{task.title}</span>
      
      {showDelayDot && (
        <div 
          className="task-delay-dot" 
          style={{ backgroundColor: delayColor }}
          title={`Delayed by ${delayDays} day${delayDays > 1 ? 's' : ''}`}
        />
      )}

      <button 
        className="task-delete-btn"
        onClick={handleDelete}
        title="Delete task"
      >
        <Trash2 />
      </button>
    </div>
  );
}
