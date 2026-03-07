import { useEffect } from 'react';

export function useKeyboardShortcuts({ setZoom, setShowMeas }) {
  useEffect(() => {
    const h = e => {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z => Math.min(3, z + 0.1)); }
      if (e.key === '-') { e.preventDefault(); setZoom(z => Math.max(0.3, z - 0.1)); }
      if (e.key === '0') setZoom(1);
      if (e.key === 'm') setShowMeas(m => !m);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [setZoom, setShowMeas]);
}
