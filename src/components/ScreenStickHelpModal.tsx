import React from 'react';
import { ExternalLink, Laptop, Layers, Monitor, Pin, RotateCcw, X, Check } from 'lucide-react';
import { isDocumentPipSupported } from '../utils/pip';

interface ScreenStickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryPiPFirstNote: () => void;
}

export const ScreenStickHelpModal: React.FC<ScreenStickHelpModalProps> = ({
  isOpen,
  onClose,
  onTryPiPFirstNote,
}) => {
  if (!isOpen) return null;

  const pipSupported = isDocumentPipSupported();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">How to Stick Notes to Your Screen</h2>
              <p className="text-xs text-slate-400">Just like Windows Sticky Notes, with daily renewed checklists</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Method 1: Picture-in-Picture Always on Top */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>1. Floating &quot;Always on Top&quot; Window (Best)</span>
              </div>
              {pipSupported ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Ready in your browser
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60">
                  Requires Chrome / Edge
                </span>
              )}
            </div>

            <p className="text-slate-400 leading-relaxed">
              Click the <strong className="text-sky-300">↗ (Pop Out)</strong> icon on any sticky note header. In Chrome or Microsoft Edge on Windows, this creates a real native floating window that stays <strong className="text-white">pinned on top of all your laptop apps</strong> (code editor, Word, browser, Slack) while you work!
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTryPiPFirstNote();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Floating Note Now</span>
              </button>
            </div>
          </div>

          {/* Method 2: Install as Windows App */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Monitor className="w-4 h-4 text-amber-400" />
              <span>2. Install as Windows Desktop App</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              In your browser toolbar or address bar, look for the <strong className="text-slate-200">Install App</strong> icon (or click browser menu <strong>⋯ &gt; Save and share &gt; Install StickyDaily</strong>). You can pin it to your Windows Taskbar and open it directly from the Windows Start menu!
            </p>
          </div>

          {/* Method 3: Daily Auto-Renewal Explained */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>3. How Daily Checklist Renewal Works</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 pt-1">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-slate-200">Daily Routines:</strong> Mark tasks as &quot;Daily&quot; or keep the default routine. When a new day arrives, checkmarks automatically reset so your tasks are fresh.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-slate-200">Manual Renew:</strong> Want to reset early or prepare tomorrow? Just click the &quot;Renew&quot; button at any time.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-slate-200">Streaks & History:</strong> Each day you check off your tasks, your daily streak increments and is safely saved.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors text-xs"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
