'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { format } from 'date-fns';

export default function AddTaskModal() {
  const isModalOpen = useTaskStore((state) => state.isModalOpen);
  const closeModal = useTaskStore((state) => state.closeModal);
  const addTask = useTaskStore((state) => state.addTask);
  const currentDate = useTaskStore((state) => state.currentDate);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Sync state with current view date when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTitle('');
      setDueDate(format(currentDate, 'yyyy-MM-dd'));
    }
  }, [isModalOpen, currentDate]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    addTask(title.trim(), dueDate);
    closeModal();
  };

  const handleOverlayClick = () => {
    closeModal();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Create New Task</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="e.g. Write project specifications"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label htmlFor="task-date">Due Date</label>
            <input
              id="task-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-cancel-btn" 
              onClick={closeModal}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-submit-btn"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
