import React, { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { TaskItem, WINDOWS_STICKY_COLORS, WindowsColorId } from '../types/sticky';
import { soundManager } from '../utils/sounds';

interface TaskItemRowProps {
  task: TaskItem;
  colorId: WindowsColorId;
  onToggle: (id: string) => void;
  onUpdateText: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  colorId,
  onToggle,
  onUpdateText,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleCheckboxClick = () => {
    if (task.completed) {
      soundManager.playUncheck();
    } else {
      soundManager.playCheck();
    }
    onToggle(task.id);
  };

  const handleSaveText = () => {
    setIsEditing(false);
    if (editText.trim() && editText.trim() !== task.text) {
      onUpdateText(task.id, editText.trim());
    } else {
      setEditText(task.text);
    }
  };

  return (
    <div className="group flex items-start gap-2 py-1 px-1 rounded hover:bg-white/5 transition-colors">
      <button
        type="button"
        onClick={handleCheckboxClick}
        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
          task.completed
            ? 'bg-amber-500 border-amber-500 text-black'
            : 'border-neutral-500 hover:border-neutral-300 bg-neutral-800'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSaveText}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveText();
            if (e.key === 'Escape') {
              setIsEditing(false);
              setEditText(task.text);
            }
          }}
          autoFocus
          className="flex-1 text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-white border border-neutral-600 outline-none"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          onClick={handleCheckboxClick}
          className={`flex-1 text-xs leading-snug cursor-pointer select-text ${
            task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
          }`}
        >
          {task.text}
        </span>
      )}

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-0.5 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
