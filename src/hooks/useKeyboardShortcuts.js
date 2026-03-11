import { useEffect } from 'react';

export function useKeyboardShortcuts({ setZoom, setShowMeas, onUndo, onRedo }) {
  useEffect(() => {
    const h = e => {
      // Don't fire shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z => Math.min(3, z + 0.1)); }
      if (e.key === '-') { e.preventDefault(); setZoom(z => Math.max(0.3, z - 0.1)); }
      if (e.key === '0') setZoom(1);
      if (e.key === 'm') setShowMeas(m => !m);
      // Ctrl/Cmd + Z = Undo, Ctrl/Cmd + Shift + Z or Ctrl + Y = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); onUndo?.(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); onRedo?.(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [setZoom, setShowMeas, onUndo, onRedo]);
}
