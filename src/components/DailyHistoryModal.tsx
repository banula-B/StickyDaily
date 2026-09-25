import React from 'react';
import { Calendar, CheckCircle2, Download, Flame, History, Trash2, X } from 'lucide-react';
import { DailyHistoryEntry } from '../types/sticky';
import { formatDisplayDate } from '../utils/storage';

interface DailyHistoryModalProps {
  history: DailyHistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export const DailyHistoryModal: React.FC<DailyHistoryModalProps> = ({
  history,
  isOpen,
  onClose,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  // Aggregate stats
  const totalDays = history.length;
  const totalCompleted = history.reduce((acc, h) => acc + h.completedTasks, 0);
  const totalTasks = history.reduce((acc, h) => acc + h.totalTasks, 0);
  const avgCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stickydaily-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Daily History & Consistency</h2>
              <p className="text-xs text-slate-400">Track your past completions and routine streaks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/40 border-b border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-400">Recorded Days</span>
            <div className="text-lg font-bold text-white font-mono-numbers mt-0.5">{totalDays}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-400">Tasks Completed</span>
            <div className="text-lg font-bold text-emerald-400 font-mono-numbers mt-0.5">{totalCompleted}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-400">Avg Completion</span>
            <div className="text-lg font-bold text-blue-400 font-mono-numbers mt-0.5">{avgCompletion}%</div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 sticky-scroll-dark">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs space-y-2">
              <Calendar className="w-8 h-8 mx-auto opacity-30" />
              <p>No past days recorded yet.</p>
              <p className="text-[11px] text-slate-600">
                When a new day begins or when you click &quot;Renew All&quot;, your daily checklists will be archived here.
              </p>
            </div>
          ) : (
            history.map((entry) => {
              const percent = entry.totalTasks > 0 ? Math.round((entry.completedTasks / entry.totalTasks) * 100) : 0;
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{entry.noteTitle}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400 font-mono-numbers">{formatDisplayDate(entry.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers font-medium text-slate-300">
                        {entry.completedTasks}/{entry.totalTasks} ({percent}%)
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          percent === 100
                            ? 'bg-emerald-400'
                            : percent >= 50
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Task list preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.taskTitles?.slice(0, 5).map((t, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2 py-0.5 rounded-md ${
                          t.completed
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 line-through opacity-80'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {t.text}
                      </span>
                    ))}
                    {(entry.taskTitles?.length || 0) > 5 && (
                      <span className="text-[11px] px-1.5 py-0.5 text-slate-500">
                        +{(entry.taskTitles?.length || 0) - 5} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <button
            onClick={handleExportJson}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
