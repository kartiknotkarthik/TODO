export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  completedAt: string | null; // ISO date when completed
  originalDueDate: string; // the original date task was created for
  createdAt: string; // ISO timestamp
}

export type ViewMode = 'day' | 'week' | 'month';

export interface TaskStore {
  tasks: Task[];
  viewMode: ViewMode;
  currentDate: Date;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  addTask: (title: string, dueDate: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  navigateForward: () => void;
  navigateBackward: () => void;
  goToToday: () => void;
}

