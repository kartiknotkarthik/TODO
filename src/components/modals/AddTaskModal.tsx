'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { format, parseISO, eachDayOfInterval, formatISO, getDay } from 'date-fns';

export default function AddTaskModal() {
  const isModalOpen = useTaskStore((state) => state.isModalOpen);
  const closeModal = useTaskStore((state) => state.closeModal);
  const addTask = useTaskStore((state) => state.addTask);
  const currentDate = useTaskStore((state) => state.currentDate);

  const [title, setTitle] = useState('');
  const [dateType, setDateType] = useState<'once' | 'multiple'>('once');
  const [dueDate, setDueDate] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly'>('daily');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]); // Mon=1, ..., Sun=7

  const weekdays = [
    { id: 1, label: 'M', name: 'Monday' },
    { id: 2, label: 'T', name: 'Tuesday' },
    { id: 3, label: 'W', name: 'Wednesday' },
    { id: 4, label: 'T', name: 'Thursday' },
    { id: 5, label: 'F', name: 'Friday' },
    { id: 6, label: 'S', name: 'Saturday' },
    { id: 7, label: 'S', name: 'Sunday' },
  ];

  // Sync state with current view date when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTitle('');
      setDateType('once');
      const formatted = format(currentDate, 'yyyy-MM-dd');
      setDueDate(formatted);
      setStartDate(formatted);
      setEndDate(formatted);
      setRepeatType('daily');
      setSelectedWeekdays([]);
    }
  }, [isModalOpen, currentDate]);

  if (!isModalOpen) return null;

  const toggleWeekday = (id: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (dateType === 'once') {
      if (!dueDate) return;
      addTask(title.trim(), dueDate);
    } else {
      if (!startDate || !endDate) return;

      const start = parseISO(startDate);
      const end = parseISO(endDate);

      if (start > end) {
        alert('End date must be on or after start date.');
        return;
      }

      if (repeatType === 'weekly' && selectedWeekdays.length === 0) {
        alert('Please select at least one weekday.');
        return;
      }

      const days = eachDayOfInterval({ start, end });
      days.forEach((day) => {
        const isoDate = formatISO(day, { representation: 'date' });
        if (repeatType === 'daily') {
          addTask(title.trim(), isoDate);
        } else if (repeatType === 'weekly') {
          const dayOfWeek = getDay(day); // 0 = Sunday, 1 = Monday, ...
          const mappedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Map Sunday to 7
          if (selectedWeekdays.includes(mappedDay)) {
            addTask(title.trim(), isoDate);
          }
        }
      });
    }

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
          {/* Task Title */}
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

          {/* Occurrence selection */}
          <div className="modal-field">
            <label>Occurrence</label>
            <div className="modal-radio-group">
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="dateType"
                  value="once"
                  checked={dateType === 'once'}
                  onChange={() => setDateType('once')}
                />
                Once
              </label>
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="dateType"
                  value="multiple"
                  checked={dateType === 'multiple'}
                  onChange={() => setDateType('multiple')}
                />
                Multiple Days
              </label>
            </div>
          </div>

          {/* Conditional Date Fields */}
          {dateType === 'once' ? (
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
          ) : (
            <>
              <div className="modal-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="start-date" style={{ display: 'block', marginBottom: '6px' }}>Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor="end-date" style={{ display: 'block', marginBottom: '6px' }}>End Date</label>
                  <input
                    id="end-date"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label htmlFor="repeat-type">Repetition Type</label>
                <select
                  id="repeat-type"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as 'daily' | 'weekly')}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    color: 'var(--slate-800)',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="daily">Every Day</option>
                  <option value="weekly">Weekly on specific days</option>
                </select>
              </div>

              {repeatType === 'weekly' && (
                <div className="modal-field">
                  <label>Repeat on</label>
                  <div className="weekday-selector">
                    {weekdays.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        className={`weekday-pill ${selectedWeekdays.includes(day.id) ? 'active' : ''}`}
                        onClick={() => toggleWeekday(day.id)}
                        title={day.name}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

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
