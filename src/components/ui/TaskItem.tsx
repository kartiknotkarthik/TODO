'use client';

import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { useTaskStore } from '@/lib/store';
import { isTaskEditable, getTaskVisualState } from '@/lib/taskUtils';

interface TaskItemProps {
  task: Task;
  viewingDate: Date;
}

export default function TaskItem({ task, viewingDate }: TaskItemProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [justChecked, setJustChecked] = useState(false);

  const isEditable = isTaskEditable(viewingDate);
  const { isCompleted, highlightClass, isTranslucent } = getTaskVisualState(task, viewingDate);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditable) return;

    if (!isCompleted) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 300);
    }
    toggleTask(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  let itemClass = '';
  if (isCompleted) {
    itemClass = isTranslucent ? 'carried-forward' : 'completed';
  }

  return (
    <div 
      className={`task-item ${itemClass} ${highlightClass} ${!isEditable ? 'readonly' : ''}`}
      onClick={isEditable ? handleToggle : undefined}
      style={{ opacity: isTranslucent ? 0.55 : 1 }}
    >
      <div 
        className={`task-checkbox ${isCompleted ? 'checked' : ''} ${justChecked ? 'just-checked' : ''} ${!isEditable ? 'disabled' : ''}`}
        title={!isEditable ? "Toggling task is only allowed for yesterday, today, or tomorrow" : undefined}
      >
        {isCompleted && <Check />}
      </div>
      <span className="task-title">{task.title}</span>

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
