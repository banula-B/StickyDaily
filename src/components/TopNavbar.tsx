import React from 'react';
import { 
  Calendar, 
  ExternalLink, 
  Flame, 
  History, 
  Layers, 
  Maximize2, 
  Plus, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { AppSettings, StickyNote, WindowsColorId } from '../types/sticky';
import { formatDisplayDate, getLocalDateString } from '../utils/storage';

interface TopNavbarProps {
  notes: StickyNote[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onNewNote: (color?: WindowsColorId) => void;
  onOpenNotesList: () => void;
  onRenewAll: () => void;
  onOpenHistory: () => void;
  onOpenScreenStickHelp: () => void;
  onToggleFullscreen: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  notes,
  settings,
  onUpdateSettings,
  onNewNote,
  onOpenNotesList,
  onRenewAll,
  onOpenHistory,
  onOpenScreenStickHelp,
  onToggleFullscreen,
}) => {
  const todayStr = getLocalDateString();
  const displayDate = formatDisplayDate(todayStr);

  const checklistNotes = notes.filter((n) => n.showChecklist);
  const allTasks = checklistNotes.flatMap((n) => n.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;

  const maxStreak = Math.max(0, ...notes.map((n) => n.streakCount || 0));

  return (
    <header className="h-12 px-4 bg-[#1f1f1f] border-b border-neutral-800 flex items-center justify-between z-40 select-none shadow-md">
      {/* Brand & Windows Sticky Notes Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Windows Sticky Notes App Icon */}
          <div className="w-5 h-5 rounded-xs bg-[#E5B800] flex items-center justify-center shadow-xs">
            <div className="w-3 h-3 bg-neutral-900/80 rounded-xs" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-100">
            Sticky Notes
          </span>
        </div>

        <span className="text-neutral-600 hidden sm:inline">|</span>

        {/* Today's Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>{displayDate}</span>
        </div>
      </div>

      {/* Middle: Daily Checklist Status (Clean and subtle) */}
      {totalTasks > 0 && (
        <div className="hidden md:flex items-center gap-3 text-xs bg-neutral-900/90 px-3 py-1 rounded border border-neutral-800">
          <span className="text-neutral-400">Daily Checklist:</span>
          <span className="font-mono text-neutral-200 font-semibold">
            {completedTasks}/{totalTasks} done
          </span>
          {maxStreak > 0 && (
            <span className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              {maxStreak}d streak
            </span>
          )}
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Notes List Modal */}
        <button
          type="button"
          onClick={onOpenNotesList}
          title="Open Notes List (View and search all notes)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span>Notes list</span>
          <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-1 rounded">
            {notes.length}
          </span>
        </button>

        {/* Stick to Screen Helper */}
        <button
          type="button"
          onClick={onOpenScreenStickHelp}
          title="Stick to Laptop Screen (Always-on-Top PiP Mode)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/60 rounded transition-colors"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Stick to Screen</span>
        </button>

        {/* Renew All button */}
        <button
          type="button"
          onClick={onRenewAll}
          title="Renew all daily checklists (unchecks tasks ready for tomorrow)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Renew Day</span>
        </button>

        {/* History Modal button */}
        <button
          type="button"
          onClick={onOpenHistory}
          title="Checklist history and streaks"
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={() =>
            onUpdateSettings({
              ...settings,
              soundEnabled: !settings.soundEnabled,
            })
          }
          title={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Fullscreen canvas */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title="Fullscreen desktop"
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors hidden sm:block"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* + New Note Primary Action Button */}
        <button
          type="button"
          onClick={() => onNewNote('yellow')}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-black bg-[#E5B800] hover:bg-amber-400 rounded transition-colors shadow-xs ml-1"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
};
