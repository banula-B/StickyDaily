import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  ExternalLink, 
  Flame, 
  Image as ImageIcon, 
  List, 
  ListTodo, 
  MoreHorizontal, 
  Plus, 
  RotateCcw, 
  Trash2, 
  X,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResetMode, 
  StickyNote, 
  TaskItem, 
  WINDOWS_STICKY_COLORS, 
  WindowsColorId 
} from '../types/sticky';
import { soundManager } from '../utils/sounds';

interface StickyNoteProps {
  note: StickyNote;
  isActive: boolean;
  onSelect: (id: string) => void;
  onUpdate: (updatedNote: StickyNote) => void;
  onDelete: (id: string) => void;
  onAddNewNote: (color?: WindowsColorId, offset?: { x: number; y: number }) => void;
  onOpenNotesList?: () => void;
  onPopOutPiP: (note: StickyNote) => void;
  isPipActive?: boolean;
}

export const StickyNoteComponent: React.FC<StickyNoteProps> = ({
  note,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
  onAddNewNote,
  onOpenNotesList,
  onPopOutPiP,
  isPipActive = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [newTaskText, setNewTaskText] = useState('');
  const [showResetMenu, setShowResetMenu] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const colorTheme = WINDOWS_STICKY_COLORS[note.color] || WINDOWS_STICKY_COLORS.yellow;
  const isDark = note.themeMode !== 'light';

  const completedCount = note.tasks?.filter((t) => t.completed).length || 0;
  const totalCount = note.tasks?.length || 0;

  // Handle Dragging via Top Header Bar
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    onSelect(note.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    });
  };

  // Handle Resizing via Bottom-Right Grip
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(note.id);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: note.size.width,
      h: note.size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(10, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
        const newY = Math.max(48, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
        onUpdate({
          ...note,
          position: { x: newX, y: newY },
          updatedAt: new Date().toISOString(),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(260, Math.min(800, resizeStart.w + deltaX));
        const newHeight = Math.max(220, Math.min(900, resizeStart.h + deltaY));
        onUpdate({
          ...note,
          size: { width: newWidth, height: newHeight },
          updatedAt: new Date().toISOString(),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
      if (isResizing) setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, note, onUpdate]);

  // Text Content Change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...note,
      content: e.target.value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Formatting toggles (Bold, Italic, Underline, Strikethrough)
  const toggleFormatting = (type: 'bold' | 'italic' | 'underline' | 'strike') => {
    const current = note.formatting || {};
    onUpdate({
      ...note,
      formatting: {
        ...current,
        [type]: !current[type],
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Bullet list quick insert
  const handleInsertBullet = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = note.content || '';
    
    // Find beginning of current line
    const prevNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
    
    const newText = text.slice(0, lineStart) + '• ' + text.slice(lineStart);
    onUpdate({
      ...note,
      content: newText,
      updatedAt: new Date().toISOString(),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, end + 2);
    }, 0);
  };

  // Toggle Checklist Mode
  const handleToggleChecklist = () => {
    soundManager.playPeel();
    onUpdate({
      ...note,
      showChecklist: !note.showChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Task to Checklist
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: newTaskText.trim(),
      completed: false,
      isRecurring: true,
    };

    onUpdate({
      ...note,
      tasks: [...(note.tasks || []), newTask],
      updatedAt: new Date().toISOString(),
    });

    setNewTaskText('');
  };

  // Toggle Task Completion
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

    const isAllDone = updated.length > 0 && updated.every((t) => t.completed);
    if (isAllDone && completedCount < totalCount) {
      soundManager.playComplete();
    }

    onUpdate({
      ...note,
      tasks: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    onUpdate({
      ...note,
      tasks: (note.tasks || []).filter((t) => t.id !== taskId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Daily Checklist Renewal (Uncheck tasks ready for the new day!)
  const handleRenewDailyChecklist = () => {
    soundManager.playReset();
    const tasks = note.tasks || [];
    let nextTasks: TaskItem[] = [];

    if (note.resetMode === 'uncheck_all') {
      nextTasks = tasks.map((t) => ({ ...t, completed: false, completedAt: null }));
    } else if (note.resetMode === 'keep_uncompleted') {
      nextTasks = tasks
        .filter((t) => !t.completed || t.isRecurring)
        .map((t) => (t.isRecurring ? { ...t, completed: false, completedAt: null } : t));
    } else {
      nextTasks = [];
    }

    onUpdate({
      ...note,
      tasks: nextTasks,
      streakCount: (note.streakCount || 0) + 1,
      lastResetDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });

    setShowResetMenu(false);
  };

  // Color Change
  const handleSelectColor = (cid: WindowsColorId) => {
    soundManager.playPeel();
    onUpdate({
      ...note,
      color: cid,
      updatedAt: new Date().toISOString(),
    });
  };

  // Attach Image from local device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdate({
          ...note,
          images: [...(note.images || []), dataUrl],
          updatedAt: new Date().toISOString(),
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const images = [...(note.images || [])];
    images.splice(index, 1);
    onUpdate({
      ...note,
      images,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      ref={noteRef}
      onClick={() => onSelect(note.id)}
      style={{
        transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0)`,
        width: `${note.size.width}px`,
        height: note.isCollapsed ? 'auto' : `${note.size.height}px`,
        zIndex: isActive ? 50 : note.zIndex,
        backgroundColor: isDark ? colorTheme.bodyBgDark : colorTheme.bodyBgLight,
        borderColor: isDark ? colorTheme.borderDark : colorTheme.borderLight,
      }}
      className={`absolute top-0 left-0 flex flex-col rounded-2xl border shadow-2xl transition-[box-shadow,transform] duration-75 select-none overflow-hidden ${
        isActive ? 'ring-1 ring-white/30 shadow-[0_12px_36px_rgba(0,0,0,0.6)]' : 'shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
      }`}
    >
      {/* Hidden File Input for Image Attachments */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* TOP HEADER ACCENT BAR (Matches Windows Sticky Notes with curvy rounded top corners) */}
      <div
        onMouseDown={handleHeaderMouseDown}
        style={{
          backgroundColor: colorTheme.headerBg,
          color: colorTheme.headerText,
        }}
        className="h-9 px-2.5 flex items-center justify-between cursor-move flex-shrink-0 select-none relative rounded-t-2xl"
      >
        {/* Left: New Note '+' button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddNewNote(note.color, { x: note.position.x + 24, y: note.position.y + 24 });
          }}
          title="New note (Ctrl+N)"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/15 active:bg-black/25 transition-colors"
          style={{ color: colorTheme.headerText }}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center: Draggable area (or subtle streak badge if active) */}
        <div className="flex-1 h-full flex items-center justify-center px-2 cursor-move">
          {note.showChecklist && note.streakCount > 0 && (
            <span
              title={`Daily streak: ${note.streakCount} days completed!`}
              className="flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/15 font-mono"
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-900" />
              {note.streakCount}d
            </span>
          )}
        </div>

        {/* Right: '...' Menu and 'X' Close button */}
        <div className="flex items-center gap-0.5">
          {/* Pop-out to Desktop Screen (Picture-in-Picture) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPopOutPiP(note);
            }}
            title="Stick Note to Screen (Always on Top over all Windows)"
            className={`w-7 h-7 flex items-center justify-center rounded hover:bg-black/15 active:bg-black/25 transition-colors ${
              isPipActive ? 'bg-black/20' : ''
            }`}
            style={{ color: colorTheme.headerText }}
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Three dots '...' menu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Menu"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/15 active:bg-black/25 transition-colors"
            style={{ color: colorTheme.headerText }}
          >
            <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Close 'X' button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            title="Close note (Delete)"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-600 hover:text-white active:bg-red-700 transition-colors"
            style={{ color: colorTheme.headerText }}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Windows Sticky Notes Popup Menu */}
        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-9 right-1 z-50 w-56 rounded-md bg-[#2d2d2d] text-neutral-100 shadow-2xl border border-neutral-700 p-2.5 text-xs animate-in fade-in duration-100"
          >
            {/* Row of Color Swatches */}
            <div className="text-[11px] font-semibold text-neutral-400 mb-2 px-1">Note Color</div>
            <div className="flex items-center justify-between gap-1 mb-3 px-1">
              {(Object.keys(WINDOWS_STICKY_COLORS) as WindowsColorId[]).map((cid) => {
                const c = WINDOWS_STICKY_COLORS[cid];
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => handleSelectColor(cid)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border border-black/30 transition-transform hover:scale-115 ${
                      note.color === cid ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.headerBg }}
                  />
                );
              })}
            </div>

            <div className="h-px bg-neutral-700 my-2" />

            {/* Daily Checklist Toggle */}
            <button
              type="button"
              onClick={() => {
                handleToggleChecklist();
                setShowMenu(false);
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-neutral-700/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ListTodo className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Checklist</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${note.showChecklist ? 'bg-amber-500/20 text-amber-300' : 'bg-neutral-800 text-neutral-400'}`}>
                {note.showChecklist ? 'On' : 'Off'}
              </span>
            </button>

            {/* Daily Renewal Mode */}
            {note.showChecklist && (
              <div className="mt-1 px-2 py-1 bg-neutral-800/80 rounded border border-neutral-700">
                <div className="text-[10px] text-neutral-400 font-medium mb-1">Reset for tomorrow:</div>
                <div className="flex flex-col gap-1 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <input
                      type="radio"
                      name={`reset-${note.id}`}
                      checked={note.resetMode === 'uncheck_all'}
                      onChange={() => onUpdate({ ...note, resetMode: 'uncheck_all' })}
                      className="accent-amber-500"
                    />
                    <span>Uncheck daily tasks</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <input
                      type="radio"
                      name={`reset-${note.id}`}
                      checked={note.resetMode === 'keep_uncompleted'}
                      onChange={() => onUpdate({ ...note, resetMode: 'keep_uncompleted' })}
                      className="accent-amber-500"
                    />
                    <span>Keep incomplete tasks</span>
                  </label>
                </div>
              </div>
            )}

            {/* Stick Note to Screen */}
            <button
              type="button"
              onClick={() => {
                onPopOutPiP(note);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-700/80 transition-colors mt-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Stick to Screen (Always on Top)</span>
            </button>

            {/* Notes List Window */}
            {onOpenNotesList && (
              <button
                type="button"
                onClick={() => {
                  onOpenNotesList();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-700/80 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-neutral-300" />
                <span>All Notes List</span>
              </button>
            )}

            <div className="h-px bg-neutral-700 my-2" />

            {/* Delete Note */}
            <button
              type="button"
              onClick={() => {
                onDelete(note.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete note</span>
            </button>
          </div>
        )}
      </div>

      {/* NOTE BODY AREA (Dark charcoal #282828 background, matching Capture.PNG) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 sticky-scroll flex flex-col min-h-0">
        {/* Attached Images */}
        {note.images && note.images.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {note.images.map((img, idx) => (
              <div key={idx} className="relative group rounded overflow-hidden border border-neutral-700 bg-black/40">
                <img src={img} alt="Sticky note attachment" className="w-full h-auto max-h-48 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  title="Remove image"
                  className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PRIMARY NOTE TEXT EDITOR: Real multi-line note taking ("Take a note...") */}
        <textarea
          ref={textareaRef}
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
          className={`w-full flex-1 bg-transparent border-0 resize-none outline-none text-[14px] leading-relaxed placeholder:text-neutral-500 font-sans ${
            note.showChecklist ? 'min-h-[80px] mb-2' : 'min-h-[140px]'
          }`}
        />

        {/* OPTIONAL DAILY CHECKLIST SECTION (If toggled on) */}
        {note.showChecklist && (
          <div className="mt-2 pt-2 border-t border-neutral-700/60 flex flex-col gap-2">
            {/* Checklist header with Daily Renew Controls */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-amber-400" />
                Daily Checklist ({completedCount}/{totalCount})
              </span>
              <button
                type="button"
                onClick={handleRenewDailyChecklist}
                title="Renew checklist for the next day (unchecks routine tasks)"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-700/70 hover:bg-amber-600 hover:text-white text-neutral-300 transition-colors text-[10px] font-medium"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Renew for Next Day
              </button>
            </div>

            {/* Checklist items */}
            <div className="flex flex-col gap-1.5">
              {(note.tasks || []).map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-2 py-0.5 px-1 rounded hover:bg-white/5 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                      task.completed
                        ? 'bg-amber-500 border-amber-500 text-black'
                        : isDark
                        ? 'border-neutral-500 hover:border-neutral-300 bg-neutral-800'
                        : 'border-neutral-400 hover:border-neutral-600 bg-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex-1 text-[13px] leading-snug cursor-pointer select-text transition-colors ${
                      task.completed
                        ? 'line-through text-neutral-500'
                        : isDark
                        ? 'text-neutral-200'
                        : 'text-neutral-800'
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-0.5 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Task input row */}
            <form onSubmit={handleAddTask} className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="+ Add a task for today..."
                className={`flex-1 text-xs px-2 py-1.5 rounded outline-none border transition-colors ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-amber-500'
                    : 'bg-white border-neutral-300 text-neutral-800 placeholder:text-neutral-400 focus:border-amber-500'
                }`}
              />
              <button
                type="submit"
                disabled={!newTaskText.trim()}
                className="px-2 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        )}
      </div>

      {/* BOTTOM FORMATTING TOOLBAR (EXACT official Windows Sticky Notes toolbar from Capture.PNG with curvy bottom corners) */}
      <div
        className={`h-9 px-2 flex items-center justify-between border-t select-none flex-shrink-0 rounded-b-2xl ${
          isDark
            ? 'bg-[#202020] border-neutral-800 text-neutral-300'
            : 'bg-[#F2F2F2] border-neutral-200 text-neutral-700'
        }`}
      >
        <div className="flex items-center gap-1">
          {/* Bold */}
          <button
            type="button"
            onClick={() => toggleFormatting('bold')}
            title="Bold (Ctrl+B)"
            className={`w-7 h-7 flex items-center justify-center rounded font-bold text-sm transition-colors ${
              note.formatting?.bold
                ? 'bg-white/20 text-white font-black'
                : 'hover:bg-white/10 active:bg-white/15'
            }`}
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => toggleFormatting('italic')}
            title="Italic (Ctrl+I)"
            className={`w-7 h-7 flex items-center justify-center rounded italic font-serif text-sm transition-colors ${
              note.formatting?.italic
                ? 'bg-white/20 text-white'
                : 'hover:bg-white/10 active:bg-white/15'
            }`}
          >
            I
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => toggleFormatting('underline')}
            title="Underline (Ctrl+U)"
            className={`w-7 h-7 flex items-center justify-center rounded underline text-sm transition-colors ${
              note.formatting?.underline
                ? 'bg-white/20 text-white font-medium'
                : 'hover:bg-white/10 active:bg-white/15'
            }`}
          >
            U
          </button>

          {/* Strikethrough (ab with strike through) */}
          <button
            type="button"
            onClick={() => toggleFormatting('strike')}
            title="Strikethrough (Ctrl+T)"
            className={`w-7 h-7 flex items-center justify-center rounded text-sm line-through transition-colors ${
              note.formatting?.strike
                ? 'bg-white/20 text-white'
                : 'hover:bg-white/10 active:bg-white/15'
            }`}
          >
            ab
          </button>

          {/* Bulleted list */}
          <button
            type="button"
            onClick={handleInsertBullet}
            title="Toggle bullet list (Ctrl+Shift+L)"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <List className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Checklist Toggle (Daily renewing checklist) */}
          <button
            type="button"
            onClick={handleToggleChecklist}
            title={note.showChecklist ? 'Hide Daily Checklist' : 'Add Daily Checklist to this note'}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              note.showChecklist
                ? 'bg-amber-500/25 text-amber-400 font-bold'
                : 'hover:bg-white/10 active:bg-white/15'
            }`}
          >
            <ListTodo className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Image Attachment Icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add image (Ctrl+Shift+I)"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <ImageIcon className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Right side helper info / quick stick & resize grip */}
        <div className="flex items-center gap-1.5 pr-0.5">
          {note.showChecklist && (
            <span
              title="Daily auto-renewal is active. Tasks reset each morning."
              className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              Daily
            </span>
          )}
          {/* Subtle Curvy Corner Resize Grip */}
          <div
            onMouseDown={handleResizeMouseDown}
            title="Drag corner to resize note"
            className="w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="1" fill="currentColor" />
              <circle cx="7" cy="3.5" r="1" fill="currentColor" />
              <circle cx="3.5" cy="7" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
