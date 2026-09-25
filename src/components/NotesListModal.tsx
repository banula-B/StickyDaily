import React, { useState } from 'react';
import { 
  Check, 
  ExternalLink, 
  Flame, 
  ListTodo, 
  Plus, 
  Search, 
  Trash2, 
  X,
  RotateCcw
} from 'lucide-react';
import { StickyNote, WINDOWS_STICKY_COLORS, WindowsColorId } from '../types/sticky';
import { formatDisplayDate } from '../utils/storage';

interface NotesListModalProps {
  isOpen: boolean;
  notes: StickyNote[];
  onClose: () => void;
  onOpenNote: (id: string) => void;
  onNewNote: (color?: WindowsColorId) => void;
  onDeleteNote: (id: string) => void;
  onRenewAll: () => void;
}

export const NotesListModal: React.FC<NotesListModalProps> = ({
  isOpen,
  notes,
  onClose,
  onOpenNote,
  onNewNote,
  onDeleteNote,
  onRenewAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'checklists'>('all');

  if (!isOpen) return null;

  const filteredNotes = notes.filter((note) => {
    const textMatch = 
      (note.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tasks || []).some((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!textMatch) return false;
    if (activeTab === 'checklists') return note.showChecklist;
    return true;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#282828] text-neutral-100 rounded-2xl border border-neutral-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="h-11 px-4 bg-[#202020] border-b border-neutral-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#E5B800] border border-black/30" />
            <h2 className="font-semibold text-sm">Sticky Notes List</h2>
            <span className="text-xs text-neutral-400">({notes.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNewNote()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E5B800] hover:bg-amber-500 text-black font-semibold text-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Note</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-[#242424] border-b border-neutral-700/80 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes and checklist tasks..."
              className="w-full pl-9 pr-3 py-1.5 rounded bg-[#1f1f1f] border border-neutral-700 text-neutral-200 placeholder:text-neutral-500 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1f1f1f] p-0.5 rounded border border-neutral-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-neutral-700 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Notes ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklists')}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                activeTab === 'checklists'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Checklists ({notes.filter((n) => n.showChecklist).length})</span>
            </button>
          </div>
        </div>

        {/* Notes Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sticky-scroll space-y-2.5">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              <p>No notes found matching your search.</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const theme = WINDOWS_STICKY_COLORS[note.color] || WINDOWS_STICKY_COLORS.yellow;
              const completedCount = note.tasks?.filter((t) => t.completed).length || 0;
              const totalCount = note.tasks?.length || 0;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    onOpenNote(note.id);
                    onClose();
                  }}
                  className="group relative flex items-start gap-3 p-3 rounded-xl bg-[#202020] hover:bg-[#2e2e2e] border border-neutral-700/80 hover:border-neutral-600 transition-all cursor-pointer shadow-sm"
                >
                  {/* Left color bar indicator */}
                  <div
                    className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme.headerBg }}
                  />

                  {/* Note info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-200 truncate">
                        {note.title || (note.content ? note.content.split('\n')[0] : 'Untitled Note')}
                      </span>
                      <span className="text-[11px] text-neutral-500 flex-shrink-0 font-mono">
                        {formatDisplayDate(note.updatedAt?.split('T')[0] || '')}
                      </span>
                    </div>

                    {/* Preview of note body */}
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {note.content || (note.showChecklist ? `${totalCount} checklist tasks` : 'Empty note')}
                    </p>

                    {/* Checklist summary bar */}
                    {note.showChecklist && totalCount > 0 && (
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 font-mono text-amber-400">
                          <ListTodo className="w-3.5 h-3.5" />
                          {completedCount}/{totalCount} completed
                        </span>
                        {note.streakCount > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-mono">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {note.streakCount}d streak
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500">
                          (Daily Auto-Renew: {note.resetMode === 'uncheck_all' ? 'Uncheck all' : 'Rollover'})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      title="Delete note"
                      className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Renew All for tomorrow */}
        <div className="h-10 px-4 bg-[#202020] border-t border-neutral-700 flex items-center justify-between text-xs text-neutral-400">
          <span>{notes.length} total note{notes.length === 1 ? '' : 's'}</span>
          <button
            type="button"
            onClick={onRenewAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-amber-600 hover:text-black text-neutral-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Renew All Daily Checklists</span>
          </button>
        </div>
      </div>
    </div>
  );
};
