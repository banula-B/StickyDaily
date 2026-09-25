export type WindowsColorId = 
  | 'yellow' 
  | 'green' 
  | 'pink' 
  | 'purple' 
  | 'blue' 
  | 'charcoal' 
  | 'white';

export interface WindowsColorTheme {
  id: WindowsColorId;
  name: string;
  headerBg: string;      // Top accent bar color (e.g. #E5B800 for Yellow)
  headerText: string;    // Text/icon color on header
  headerHover: string;   // Hover bg on header buttons
  bodyBgDark: string;    // Dark theme body background (#282828)
  bodyBgLight: string;   // Light theme body background (#FFFBEA, etc.)
  borderDark: string;    // Border color in dark mode
  borderLight: string;   // Border color in light mode
  accent: string;
}

export const WINDOWS_STICKY_COLORS: Record<WindowsColorId, WindowsColorTheme> = {
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    headerBg: '#E5B800',
    headerText: '#1F1F1F',
    headerHover: 'rgba(0,0,0,0.12)',
    bodyBgDark: '#282828',
    bodyBgLight: '#FFFDE7',
    borderDark: '#3A3A3A',
    borderLight: '#F3E57B',
    accent: '#E5B800',
  },
  green: {
    id: 'green',
    name: 'Green',
    headerBg: '#47AF44',
    headerText: '#FFFFFF',
    headerHover: 'rgba(0,0,0,0.15)',
    bodyBgDark: '#282828',
    bodyBgLight: '#E8F5E9',
    borderDark: '#3A3A3A',
    borderLight: '#A5D6A7',
    accent: '#47AF44',
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    headerBg: '#E45695',
    headerText: '#FFFFFF',
    headerHover: 'rgba(0,0,0,0.15)',
    bodyBgDark: '#282828',
    bodyBgLight: '#FCE4EC',
    borderDark: '#3A3A3A',
    borderLight: '#F48FB1',
    accent: '#E45695',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    headerBg: '#8A56CE',
    headerText: '#FFFFFF',
    headerHover: 'rgba(0,0,0,0.15)',
    bodyBgDark: '#282828',
    bodyBgLight: '#F3E5F5',
    borderDark: '#3A3A3A',
    borderLight: '#CE93D8',
    accent: '#8A56CE',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    headerBg: '#3498DB',
    headerText: '#FFFFFF',
    headerHover: 'rgba(0,0,0,0.15)',
    bodyBgDark: '#282828',
    bodyBgLight: '#E1F5FE',
    borderDark: '#3A3A3A',
    borderLight: '#81D4FA',
    accent: '#3498DB',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal',
    headerBg: '#4B4B4B',
    headerText: '#FFFFFF',
    headerHover: 'rgba(255,255,255,0.15)',
    bodyBgDark: '#282828',
    bodyBgLight: '#EEEEEE',
    borderDark: '#3A3A3A',
    borderLight: '#BDBDBD',
    accent: '#757575',
  },
  white: {
    id: 'white',
    name: 'Light / White',
    headerBg: '#D6D6D6',
    headerText: '#1F1F1F',
    headerHover: 'rgba(0,0,0,0.10)',
    bodyBgDark: '#282828',
    bodyBgLight: '#FFFFFF',
    borderDark: '#3A3A3A',
    borderLight: '#E0E0E0',
    accent: '#9E9E9E',
  },
};

export type Priority = 'low' | 'medium' | 'high';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string | null;
  priority?: Priority;
  isRecurring?: boolean;
}

export type ResetMode = 
  | 'uncheck_all'         // Standard daily routine: keep all tasks, uncheck them for the new day
  | 'keep_uncompleted'    // Rollover: uncompleted tasks stay, completed tasks removed
  | 'archive_and_clear';  // Clear tasks daily

export interface NoteFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

export interface StickyNote {
  id: string;
  title: string;
  content: string; // The normal free-form note text (typed freely)
  color: WindowsColorId;
  themeMode?: 'dark' | 'light'; // Default dark to match Capture.PNG
  formatting?: NoteFormatting;
  showChecklist: boolean; // Optional feature toggle for daily renewing checklist!
  tasks: TaskItem[];
  images?: string[]; // Attached images
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isPinned: boolean;
  isCollapsed: boolean;
  isClosed?: boolean; // If closed from screen, still in Notes List
  resetMode: ResetMode;
  lastResetDate: string; // "YYYY-MM-DD"
  streakCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyHistoryEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  noteId: string;
  noteTitle: string;
  totalTasks: number;
  completedTasks: number;
  taskTitles: { text: string; completed: boolean }[];
  timestamp: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  autoResetAtMidnight: boolean;
}
