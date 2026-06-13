'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTaskStore } from '@/lib/store';
import { formatDateHeader } from '@/lib/dateUtils';

export default function Header() {
  const viewMode = useTaskStore((state) => state.viewMode);
  const currentDate = useTaskStore((state) => state.currentDate);
  const setViewMode = useTaskStore((state) => state.setViewMode);
  const navigateForward = useTaskStore((state) => state.navigateForward);
  const navigateBackward = useTaskStore((state) => state.navigateBackward);
  const goToToday = useTaskStore((state) => state.goToToday);
  const openModal = useTaskStore((state) => state.openModal);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">My Workspace</h1>
        <span className="header-subtitle">{formatDateHeader(currentDate, viewMode)}</span>
      </div>

      <div className="header-center">
        <div className="view-toggle">
          <button 
            className={`view-toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="header-right">
        <button className="today-btn" onClick={goToToday}>
          Today
        </button>
        <button className="nav-btn" onClick={navigateBackward} title="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className="nav-btn" onClick={navigateForward} title="Next">
          <ChevronRight size={16} />
        </button>
        <button className="add-task-btn" onClick={openModal}>
          <Plus />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}
