import React, { useState, useRef } from 'react';
import { 
  Check, 
  ExternalLink, 
  Flame, 
  Image as ImageIcon, 
  List, 
  ListTodo, 
  Plus, 
  RotateCcw, 
  X 
} from 'lucide-react';
import { 
  StickyNote, 
  TaskItem, 
  WINDOWS_STICKY_COLORS, 
  WindowsColorId 
} from '../types/sticky';
import { soundManager } from '../utils/sounds';

interface MiniStickyViewProps {
  note: StickyNote;
  onUpdateNote: (updatedNote: StickyNote) => void;
  onClosePiP?: () => void;
}

export const MiniStickyView: React.FC<MiniStickyViewProps> = ({
  note,
  onUpdateNote,
  onClosePiP,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorTheme = WINDOWS_STICKY_COLORS[note.color] || WINDOWS_STICKY_COLORS.yellow;
  const isDark = note.themeMode !== 'light';

  const completedCount = note.tasks?.filter((t) => t.completed).length || 0;
  const totalCount = note.tasks?.length || 0;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNote({
      ...note,
      content: e.target.value,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleFormatting = (type: 'bold' | 'italic' | 'underline' | 'strike') => {
    const current = note.formatting || {};
    onUpdateNote({
      ...note,
      formatting: {
        ...current,
        [type]: !current[type],
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleChecklist = () => {
    soundManager.playPeel();
    onUpdateNote({
      ...note,
      showChecklist: !note.showChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: newTaskText.trim(),
      completed: false,
      isRecurring: true,
    };

    onUpdateNote({
      ...note,
      tasks: [...(note.tasks || []), newTask],
      updatedAt: new Date().toISOString(),
    });

    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    const tasks = note.tasks || [];
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const next = !t.completed;
        if (next) soundManager.playCheck();
        else soundManager.playUncheck();
        return {
          ...t,
          completed: next,
          completedAt: next ? new Date().toISOString() : null,
        };
      }
      return t;
    });

    onUpdateNote({
      ...note,
      tasks: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateNote({
      ...note,
      tasks: (note.tasks || []).filter((t) => t.id !== taskId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRenewDaily = () => {
    soundManager.playReset();
    const tasks = note.tasks || [];
    const nextTasks = tasks.map((t) => ({ ...t, completed: false, completedAt: null }));
    onUpdateNote({
      ...note,
      tasks: nextTasks,
      streakCount: (note.streakCount || 0) + 1,
      lastResetDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateNote({
          ...note,
          images: [...(note.images || []), dataUrl],
          updatedAt: new Date().toISOString(),
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? colorTheme.bodyBgDark : colorTheme.bodyBgLight,
        color: isDark ? '#F0F0F0' : '#1A1A1A',
      }}
      className="h-screen w-screen flex flex-col select-none overflow-hidden font-sans"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div
        style={{
          backgroundColor: colorTheme.headerBg,
          color: colorTheme.headerText,
        }}
        className="h-9 px-2 flex items-center justify-between flex-shrink-0"
      >
        <span className="font-semibold text-xs truncate">
          {note.title || 'Sticky Note'}
        </span>

        <div className="flex items-center gap-1">
          {note.showChecklist && note.streakCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/15 font-mono">
              <Flame className="w-3.5 h-3.5 fill-current" />
              {note.streakCount}d
            </span>
          )}
          {onClosePiP && (
            <button
              type="button"
              onClick={onClosePiP}
              title="Close floating note"
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/15 transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Note Body */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col min-h-0">
        {/* Images */}
        {note.images && note.images.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {note.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Attachment"
                className="w-full h-auto max-h-36 object-cover rounded border border-neutral-700"
              />
            ))}
          </div>
        )}

        {/* Note textarea */}
        <textarea
          value={note.content || ''}
          onChange={handleContentChange}
          placeholder="Take a note..."
          style={{
            fontWeight: note.formatting?.bold ? '700' : '400',
            fontStyle: note.formatting?.italic ? 'italic' : 'normal',
            textDecoration: [
              note.formatting?.underline ? 'underline' : '',
              note.formatting?.strike ? 'line-through' : '',
            ].filter(Boolean).join(' ') || 'none',
            color: isDark ? '#F0F0F0' : '#1A1A1A',
          }}
          className="w-full flex-1 bg-transparent border-0 resize-none outline-none text-[13px] leading-relaxed placeholder:text-neutral-500 font-sans min-h-[90px]"
        />

        {/* Checklist if enabled */}
        {note.showChecklist && (
          <div className="mt-2 pt-2 border-t border-neutral-700/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300">
                Tasks ({completedCount}/{totalCount})
              </span>
              <button
                type="button"
                onClick={handleRenewDaily}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-700 hover:bg-amber-600 text-white text-[10px]"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Renew
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {(note.tasks || []).map((task) => (
                <div key={task.id} className="flex items-center gap-2 group py-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      task.completed ? 'bg-amber-500 border-amber-500 text-black' : 'border-neutral-500'
                    }`}
                  >
                    {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <span
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex-1 text-xs truncate ${task.completed ? 'line-through text-neutral-500' : ''}`}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} className="flex items-center gap-1 mt-1">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="+ Add task..."
                className="flex-1 text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-white outline-none"
              />
              <button type="submit" disabled={!newTaskText.trim()} className="px-2 py-1 rounded bg-amber-500 text-black text-xs font-semibold">
                Add
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        className={`h-9 px-2 flex items-center justify-between border-t select-none flex-shrink-0 ${
          isDark ? 'bg-[#202020] border-neutral-800 text-neutral-300' : 'bg-[#F2F2F2] border-neutral-200 text-neutral-700'
        }`}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFormatting('bold')}
            className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${note.formatting?.bold ? 'bg-white/20 text-white' : ''}`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => toggleFormatting('italic')}
            className={`w-6 h-6 flex items-center justify-center rounded italic text-xs ${note.formatting?.italic ? 'bg-white/20 text-white' : ''}`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => toggleFormatting('underline')}
            className={`w-6 h-6 flex items-center justify-center rounded underline text-xs ${note.formatting?.underline ? 'bg-white/20 text-white' : ''}`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => toggleFormatting('strike')}
            className={`w-6 h-6 flex items-center justify-center rounded line-through text-xs ${note.formatting?.strike ? 'bg-white/20 text-white' : ''}`}
          >
            ab
          </button>
          <button
            type="button"
            onClick={handleToggleChecklist}
            className={`w-6 h-6 flex items-center justify-center rounded ${note.showChecklist ? 'bg-amber-500/30 text-amber-400' : ''}`}
          >
            <ListTodo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-6 h-6 flex items-center justify-center rounded"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
