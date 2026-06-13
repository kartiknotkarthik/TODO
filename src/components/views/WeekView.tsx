'use client';

import React from 'react';
import { useTaskStore } from '@/lib/store';
import { getWeekDays } from '@/lib/dateUtils';
import DayCard from '@/components/ui/DayCard';

export default function WeekView() {
  const currentDate = useTaskStore((state) => state.currentDate);
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="week-grid">
      {weekDays.map((day) => (
        <DayCard key={day.toISOString()} date={day} />
      ))}
    </div>
  );
}
