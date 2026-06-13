'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Settings, 
  CheckSquare 
} from 'lucide-react';
import { getDelayColor } from '@/lib/taskUtils';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CheckSquare size={18} />
        </div>
        <span className="sidebar-logo-text">PlanFlow</span>
      </div>

      <nav className="sidebar-nav">
        <a href="#" className="sidebar-item active">
          <LayoutDashboard />
          <span>Dashboard</span>
        </a>
        <a href="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <Calendar />
          <span>Calendar</span>
        </a>
        <a href="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <BarChart3 />
          <span>Analytics</span>
        </a>
        <a href="#" className="sidebar-item" onClick={(e) => e.preventDefault()}>
          <Settings />
          <span>Settings</span>
        </a>
      </nav>

      <div className="sidebar-legend">
        <h4>Delay Status</h4>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getDelayColor(0) }} />
          <span>On track</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getDelayColor(1) }} />
          <span>Delayed 1 day</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getDelayColor(2) }} />
          <span>Delayed 2 days</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getDelayColor(3) }} />
          <span>Delayed 3 days</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: getDelayColor(4) }} />
          <span>Delayed 4+ days</span>
        </div>
      </div>
    </aside>
  );
}
