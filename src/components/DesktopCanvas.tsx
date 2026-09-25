import React from 'react';
import { 
  Check, 
  LayoutGrid, 
  Plus, 
  RotateCcw, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AppSettings, StickyNote, WindowsColorId } from '../types/sticky';
import { StickyNoteComponent } from './StickyNoteComponent';

interface DesktopCanvasProps {
  notes: StickyNote[];
  activeNoteId: string | null;
  settings: AppSettings;
  pipActiveNoteId: string | null;
  dailyRenewToast: string | null;
  onDismissToast: () => void;
  onSelectNote: (id: string) => void;
  onUpdateNote: (note: StickyNote) => void;
  onDeleteNote: (id: string) => void;
  onPopOutPiP: (note: StickyNote) => void;
  onNewNote: (color?: WindowsColorId, offset?: { x: number; y: number }) => void;
  onOpenNotesList: () => void;
  onAutoArrangeNotes: () => void;
  onRenewAll: () => void;
}

export const DesktopCanvas: React.FC<DesktopCanvasProps> = ({
  notes,
  activeNoteId,
  settings,
  pipActiveNoteId,
  dailyRenewToast,
  onDismissToast,
  onSelectNote,
  onUpdateNote,
  onDeleteNote,
  onPopOutPiP,
  onNewNote,
  onOpenNotesList,
  onAutoArrangeNotes,
  onRenewAll,
}) => {
  // Only show notes that aren't closed
  const visibleNotes = notes.filter((n) => !n.isClosed);

  return (
    <div
      className="relative w-full h-[calc(100vh-3rem)] overflow-hidden select-none bg-[#181818]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.4) 0%, transparent 75%),
          radial-gradient(circle at 100% 100%, rgba(15, 23, 42, 0.6) 0%, transparent 60%)
        `,
      }}
      onClick={(e) => {
        // Deselect if clicking canvas directly
        if (e.target === e.currentTarget) {
          onSelectNote('');
        }
      }}
    >
      {/* Daily Renewal Notification Toast */}
      {dailyRenewToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-700 shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-top-3 duration-200">
          <RotateCcw className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{dailyRenewToast}</span>
          <button
            type="button"
            onClick={onDismissToast}
            className="text-neutral-400 hover:text-white font-semibold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Render Sticky Notes */}
      {visibleNotes.map((note) => (
        <StickyNoteComponent
          key={note.id}
          note={note}
          isActive={activeNoteId === note.id}
          onSelect={onSelectNote}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
          onAddNewNote={onNewNote}
          onOpenNotesList={onOpenNotesList}
          onPopOutPiP={onPopOutPiP}
          isPipActive={pipActiveNoteId === note.id}
        />
      ))}

      {/* When no visible notes are on screen */}
      {visibleNotes.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
          <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200 mb-1">
            No open sticky notes
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mb-4">
            Click New Note to start typing a note or create a daily renewing checklist.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNewNote('yellow')}
              className="px-3 py-1.5 rounded-lg bg-[#E5B800] hover:bg-amber-400 text-black text-xs font-semibold transition-colors"
            >
              + Create Note
            </button>
            <button
              type="button"
              onClick={onOpenNotesList}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              Open Notes List
            </button>
          </div>
        </div>
      )}

      {/* Windows Quick Action Dock (Floating bottom bar) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-[#202020]/92 backdrop-blur-md border border-neutral-700/80 shadow-2xl text-xs text-neutral-300">
        <button
          type="button"
          onClick={() => onNewNote('yellow')}
          title="New Sticky Note"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5B800] hover:bg-amber-400 text-black font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Note</span>
        </button>

        <div className="h-4 w-px bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={onOpenNotesList}
          title="Show all notes in list"
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-700 text-neutral-300 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Notes List</span>
        </button>

        <button
          type="button"
          onClick={onAutoArrangeNotes}
          title="Auto arrange sticky notes side by side"
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-700 text-neutral-300 transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Tile Notes</span>
        </button>

        <button
          type="button"
          onClick={onRenewAll}
          title="Renew all daily checklists for tomorrow"
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-700 text-neutral-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Renew Checklists</span>
        </button>
      </div>
    </div>
  );
};
