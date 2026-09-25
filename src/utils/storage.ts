import { AppSettings, DailyHistoryEntry, StickyNote, TaskItem, WindowsColorId } from '../types/sticky';

const STORAGE_KEYS = {
  NOTES: 'windows_stickynotes_v2',
  HISTORY: 'windows_stickynotes_history_v2',
  SETTINGS: 'windows_stickynotes_settings_v2',
  LAST_CHECK_DATE: 'windows_stickynotes_last_date_v2',
};

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  theme: 'dark',
  autoResetAtMidnight: true,
};

export const DEFAULT_NOTES: StickyNote[] = [
  {
    id: 'note-1',
    title: 'Daily Plan & Notes',
    content: 'Client sync scheduled for 2:30 PM.\nCheck Q3 deliverables report before call.\nRemember to send invoice summary to accounting.',
    color: 'yellow',
    themeMode: 'dark',
    formatting: { bold: false, italic: false, underline: false, strike: false },
    showChecklist: true,
    position: { x: 50, y: 70 },
    size: { width: 340, height: 440 },
    zIndex: 10,
    isPinned: false,
    isCollapsed: false,
    isClosed: false,
    resetMode: 'uncheck_all',
    lastResetDate: getLocalDateString(),
    streakCount: 2,
    tasks: [
      {
        id: 't-1',
        text: 'Morning email triage & inbox zero',
        completed: true,
        completedAt: new Date().toISOString(),
        isRecurring: true,
      },
      {
        id: 't-2',
        text: 'Review pull requests and code reviews',
        completed: true,
        completedAt: new Date().toISOString(),
        isRecurring: true,
      },
      {
        id: 't-3',
        text: 'Prepare agenda for afternoon sync',
        completed: false,
        isRecurring: true,
      },
      {
        id: 't-4',
        text: 'Submit weekly milestone update',
        completed: false,
        isRecurring: false,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Quick Scratchpad',
    content: 'Meeting Notes:\n- Database migration planned for Saturday 11 PM\n- Backup snapshots created and tested\n- Prod endpoint: api.internal.corp/v2\n\nCall David regarding API rate limits tomorrow.',
    color: 'blue',
    themeMode: 'dark',
    formatting: { bold: false, italic: false, underline: false, strike: false },
    showChecklist: false,
    position: { x: 420, y: 70 },
    size: { width: 320, height: 380 },
    zIndex: 9,
    isPinned: false,
    isCollapsed: false,
    isClosed: false,
    resetMode: 'uncheck_all',
    lastResetDate: getLocalDateString(),
    streakCount: 0,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const loadStoredNotes = (): StickyNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      saveStoredNotes(DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredNotes(DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading notes from localStorage:', err);
    return DEFAULT_NOTES;
  }
};

export const saveStoredNotes = (notes: StickyNote[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Error saving notes to localStorage:', err);
  }
};

export const loadStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
};

export const loadStoredHistory = (): DailyHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredHistory = (history: DailyHistoryEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving history:', err);
  }
};

export interface DailyResetResult {
  notesUpdated: boolean;
  renewedCount: number;
  newHistoryEntries: DailyHistoryEntry[];
  updatedNotes: StickyNote[];
}

export const checkAndRunDailyReset = (
  currentNotes: StickyNote[],
  existingHistory: DailyHistoryEntry[]
): DailyResetResult => {
  const todayStr = getLocalDateString();
  let notesUpdated = false;
  let renewedCount = 0;
  const newEntries: DailyHistoryEntry[] = [];

  const updatedNotes = currentNotes.map((note) => {
    // Only notes with checklist active need daily checklist renewal
    if (!note.showChecklist || !note.tasks || note.tasks.length === 0) {
      return note;
    }

    if (note.lastResetDate === todayStr) {
      return note;
    }

    notesUpdated = true;
    renewedCount++;

    const completedTasksCount = note.tasks.filter((t) => t.completed).length;
    const totalCount = note.tasks.length;

    newEntries.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      date: note.lastResetDate || todayStr,
      noteId: note.id,
      noteTitle: note.title || 'Untitled Sticky Note',
      totalTasks: totalCount,
      completedTasks: completedTasksCount,
      taskTitles: note.tasks.map((t) => ({ text: t.text, completed: t.completed })),
      timestamp: new Date().toISOString(),
    });

    let nextTasks: TaskItem[] = [];
    if (note.resetMode === 'uncheck_all') {
      nextTasks = note.tasks.map((t) => ({
        ...t,
        completed: false,
        completedAt: null,
      }));
    } else if (note.resetMode === 'keep_uncompleted') {
      nextTasks = note.tasks
        .filter((t) => !t.completed || t.isRecurring)
        .map((t) => (t.isRecurring ? { ...t, completed: false, completedAt: null } : t));
    } else {
      nextTasks = [];
    }

    const wasSuccessfulDay = totalCount > 0 && completedTasksCount >= Math.ceil(totalCount * 0.7);
    const newStreak = wasSuccessfulDay ? (note.streakCount || 0) + 1 : 0;

    return {
      ...note,
      tasks: nextTasks,
      lastResetDate: todayStr,
      streakCount: newStreak,
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    notesUpdated,
    renewedCount,
    newHistoryEntries: newEntries,
    updatedNotes,
  };
};

export const createNewWindowsNote = (
  color: WindowsColorId = 'yellow',
  offset = { x: 60, y: 80 }
): StickyNote => {
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: '',
    content: '',
    color,
    themeMode: 'dark',
    formatting: { bold: false, italic: false, underline: false, strike: false },
    showChecklist: false,
    tasks: [],
    position: {
      x: Math.min(window.innerWidth - 360, Math.max(20, offset.x)),
      y: Math.min(window.innerHeight - 380, Math.max(60, offset.y)),
    },
    size: { width: 330, height: 380 },
    zIndex: Date.now() % 1000,
    isPinned: false,
    isCollapsed: false,
    isClosed: false,
    resetMode: 'uncheck_all',
    lastResetDate: getLocalDateString(),
    streakCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
