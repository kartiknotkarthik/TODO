'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import WeekView from '@/components/views/WeekView';
import MonthView from '@/components/views/MonthView';
import DayView from '@/components/views/DayView';
import ProcrastinationBar from '@/components/panels/ProcrastinationBar';
import ProgressPanel from '@/components/panels/ProgressPanel';
import AddTaskModal from '@/components/modals/AddTaskModal';
import { useTaskStore } from '@/lib/store';

export default function Home() {
  const viewMode = useTaskStore((state) => state.viewMode);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch when using localStorage persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--slate-50)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--blue-100)',
            borderTopColor: 'var(--blue-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            Loading PlanFlow...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Structural Sidebar */}
      <Sidebar />

      <div className="main-content">
        {/* Navigation & Controls Header */}
        <Header />

        {/* Core Content View Area */}
        <main className="content-area">
          {viewMode === 'week' ? (
            <WeekView />
          ) : viewMode === 'month' ? (
            <MonthView />
          ) : (
            <DayView />
          )}

          {/* Bottom panels are displayed only in Week view to prevent overlap/clutter in Month view */}
          {viewMode === 'week' && (
            <div className="bottom-panels">
              <ProcrastinationBar />
              <ProgressPanel />
            </div>
          )}
        </main>
      </div>

      {/* Task Creation Modal */}
      <AddTaskModal />
    </div>
  );
}
