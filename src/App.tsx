import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AppSettings, DailyHistoryEntry, StickyNote, WindowsColorId } from './types/sticky';
import { 
  checkAndRunDailyReset, 
  createNewWindowsNote, 
  DEFAULT_NOTES, 
  DEFAULT_SETTINGS, 
  getLocalDateString, 
  loadStoredHistory, 
  loadStoredNotes, 
  loadStoredSettings, 
  saveStoredHistory, 
  saveStoredNotes, 
  saveStoredSettings 
} from './utils/storage';
import { copyStylesToWindow, isDocumentPipSupported } from './utils/pip';
import { soundManager } from './utils/sounds';
import { TopNavbar } from './components/TopNavbar';
import { DesktopCanvas } from './components/DesktopCanvas';
import { MiniStickyView } from './components/MiniStickyView';
import { NotesListModal } from './components/NotesListModal';
import { DailyHistoryModal } from './components/DailyHistoryModal';
import { ScreenStickHelpModal } from './components/ScreenStickHelpModal';

export default function App() {
  const [notes, setNotes] = useState<StickyNote[]>(() => loadStoredNotes());
  const [history, setHistory] = useState<DailyHistoryEntry[]>(() => loadStoredHistory());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [pipActiveNoteId, setPipActiveNoteId] = useState<string | null>(null);
  const [isNotesListOpen, setIsNotesListOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [dailyRenewToast, setDailyRenewToast] = useState<string | null>(null);

  // References for Document Picture-in-Picture window & root
  const pipWindowRef = useRef<Window | null>(null);
  const pipRootRef = useRef<Root | null>(null);

  // Sync sound manager enabled state
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Persist notes
  useEffect(() => {
    saveStoredNotes(notes);
  }, [notes]);

  // Persist history
  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  // Persist settings
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Daily Renewal Engine: Checks on load and periodically for midnight date transition
  useEffect(() => {
    const runDailyCheck = () => {
      setNotes((currentNotes) => {
        setHistory((currentHistory) => {
          const { notesUpdated, renewedCount, newHistoryEntries, updatedNotes } = checkAndRunDailyReset(
            currentNotes,
            currentHistory
          );
          if (notesUpdated && renewedCount > 0) {
            setDailyRenewToast(
              `🌅 Daily reset: ${renewedCount} checklist${renewedCount > 1 ? 's' : ''} renewed for today!`
            );
            return [...newHistoryEntries, ...currentHistory];
          }
          return currentHistory;
        });
        return currentNotes;
      });
    };

    runDailyCheck();
    const interval = setInterval(runDailyCheck, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update Picture-in-Picture window if active
  useEffect(() => {
    if (!pipWindowRef.current || !pipRootRef.current || !pipActiveNoteId) return;

    const currentNote = notes.find((n) => n.id === pipActiveNoteId);
    if (!currentNote) {
      pipWindowRef.current.close();
      return;
    }

    pipRootRef.current.render(
      <MiniStickyView
        note={currentNote}
        onUpdateNote={(updated) => handleUpdateNote(updated)}
        onClosePiP={() => {
          if (pipWindowRef.current) {
            pipWindowRef.current.close();
          }
        }}
      />
    );
  }, [notes, pipActiveNoteId]);

  // Update single note
  const handleUpdateNote = (updatedNote: StickyNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    if (pipActiveNoteId === id && pipWindowRef.current) {
      pipWindowRef.current.close();
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Create New Note (Windows style: default clean text note with yellow header)
  const handleNewNote = (
    color: WindowsColorId = 'yellow',
    offset?: { x: number; y: number }
  ) => {
    soundManager.playPeel();

    const spawnOffset = offset || {
      x: 60 + ((notes.length * 30) % 240),
      y: 80 + ((notes.length * 30) % 180),
    };

    const newNote = createNewWindowsNote(color, spawnOffset);
    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
  };

  // Renew All Daily Checklists
  const handleRenewAll = () => {
    soundManager.playReset();
    const today = getLocalDateString();
    const newHistoryEntries: DailyHistoryEntry[] = [...history];

    const updated = notes.map((note) => {
      if (!note.showChecklist || !note.tasks || note.tasks.length === 0) {
        return note;
      }

      const total = note.tasks.length;
      const completed = note.tasks.filter((t) => t.completed).length;

      if (total > 0) {
        newHistoryEntries.unshift({
          id: `hist-${Date.now()}-${note.id}`,
          date: note.lastResetDate || today,
          noteId: note.id,
          noteTitle: note.title || 'Sticky Note',
          totalTasks: total,
          completedTasks: completed,
          taskTitles: note.tasks.map((t) => ({ text: t.text, completed: t.completed })),
          timestamp: new Date().toISOString(),
        });
      }

      let nextTasks = [...note.tasks];
      if (note.resetMode === 'uncheck_all') {
        nextTasks = nextTasks.map((t) => ({ ...t, completed: false, completedAt: null }));
      } else if (note.resetMode === 'keep_uncompleted') {
        nextTasks = nextTasks
          .filter((t) => !t.completed || t.isRecurring)
          .map((t) => (t.isRecurring ? { ...t, completed: false, completedAt: null } : t));
      } else {
        nextTasks = [];
      }

      return {
        ...note,
        tasks: nextTasks,
        streakCount: completed > 0 ? (note.streakCount || 0) + 1 : (note.streakCount || 0),
        lastResetDate: today,
        updatedAt: new Date().toISOString(),
      };
    });

    setNotes(updated);
    setHistory(newHistoryEntries);
    setDailyRenewToast('🔄 All daily checklists renewed! Ready for the new day.');
  };

  // Auto Arrange Notes into a clean desktop grid
  const handleAutoArrange = () => {
    soundManager.playPeel();
    const paddingX = 40;
    const paddingY = 70;
    const noteWidth = 340;
    const noteHeight = 400;
    const cols = Math.max(1, Math.floor((window.innerWidth - 60) / (noteWidth + 24)));

    const arranged = notes.map((note, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        ...note,
        position: {
          x: paddingX + col * (noteWidth + 24),
          y: paddingY + row * (noteHeight + 24),
        },
      };
    });

    setNotes(arranged);
  };

  // Pop Out to OS Screen Window (Document Picture-in-Picture)
  const handlePopOutPiP = async (noteToPop: StickyNote) => {
    if (!isDocumentPipSupported() || !window.documentPictureInPicture) {
      setIsHelpModalOpen(true);
      return;
    }

    try {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }

      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 340,
        height: 480,
      });

      pipWindowRef.current = pipWindow;
      setPipActiveNoteId(noteToPop.id);

      copyStylesToWindow(pipWindow.document);

      const container = pipWindow.document.createElement('div');
      container.id = 'pip-sticky-root';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.overflow = 'hidden';
      pipWindow.document.body.appendChild(container);

      const root = createRoot(container);
      pipRootRef.current = root;

      root.render(
        <MiniStickyView
          note={noteToPop}
          onUpdateNote={(updated) => handleUpdateNote(updated)}
          onClosePiP={() => pipWindow.close()}
        />
      );

      pipWindow.addEventListener('pagehide', () => {
        pipWindowRef.current = null;
        pipRootRef.current = null;
        setPipActiveNoteId(null);
      });
    } catch (err) {
      console.error('Document Picture-in-Picture failed:', err);
      setIsHelpModalOpen(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#181818] font-sans text-neutral-100 select-none">
      {/* Top Windows Command Bar */}
      <TopNavbar
        notes={notes}
        settings={settings}
        onUpdateSettings={setSettings}
        onNewNote={handleNewNote}
        onOpenNotesList={() => setIsNotesListOpen(true)}
        onRenewAll={handleRenewAll}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenScreenStickHelp={() => setIsHelpModalOpen(true)}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Desktop Canvas with Sticky Notes */}
      <DesktopCanvas
        notes={notes}
        activeNoteId={activeNoteId}
        settings={settings}
        pipActiveNoteId={pipActiveNoteId}
        dailyRenewToast={dailyRenewToast}
        onDismissToast={() => setDailyRenewToast(null)}
        onSelectNote={setActiveNoteId}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onPopOutPiP={handlePopOutPiP}
        onNewNote={handleNewNote}
        onOpenNotesList={() => setIsNotesListOpen(true)}
        onAutoArrangeNotes={handleAutoArrange}
        onRenewAll={handleRenewAll}
      />

      {/* Notes List Modal (Windows Sticky Notes Hub) */}
      <NotesListModal
        isOpen={isNotesListOpen}
        notes={notes}
        onClose={() => setIsNotesListOpen(false)}
        onOpenNote={(id) => {
          setActiveNoteId(id);
          // Bring to front
          setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isClosed: false, zIndex: 100 } : n))
          );
        }}
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
        onRenewAll={handleRenewAll}
      />

      {/* Daily History Modal */}
      <DailyHistoryModal
        history={history}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onClearHistory={() => setHistory([])}
      />

      {/* Screen Stick Help Modal */}
      <ScreenStickHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onTryPiPFirstNote={() => {
          if (notes.length > 0) {
            handlePopOutPiP(notes[0]);
          }
        }}
      />
    </div>
  );
}
