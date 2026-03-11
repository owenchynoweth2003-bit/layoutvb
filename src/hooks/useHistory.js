import { useState, useCallback, useRef } from 'react';

const MAX = 60;

export function useHistory() {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const skipRef = useRef(false);
  const labelsRef = useRef([]);

  const pushState = useCallback((walls, feats, label) => {
    if (skipRef.current) { skipRef.current = false; return; }
    setPast(p => {
      const snap = JSON.stringify({ walls, feats });
      if (p.length > 0 && p[p.length - 1].snap === snap) return p;
      const next = [...p, { snap, label: label || 'edit', ts: Date.now() }];
      if (next.length > MAX) next.shift();
      return next;
    });
    setFuture([]);
  }, []);

  const undo = useCallback((curWalls, curFeats, setWalls, setFeats) => {
    if (past.length === 0) return;
    const curSnap = JSON.stringify({ walls: curWalls, feats: curFeats });
    setFuture(f => [...f, { snap: curSnap, label: 'undo', ts: Date.now() }]);
    const prev = past[past.length - 1];
    setPast(p => p.slice(0, -1));
    skipRef.current = true;
    try { const { walls, feats } = JSON.parse(prev.snap); setWalls(walls); setFeats(feats); } catch(e) {}
  }, [past]);

  const redo = useCallback((curWalls, curFeats, setWalls, setFeats) => {
    if (future.length === 0) return;
    const curSnap = JSON.stringify({ walls: curWalls, feats: curFeats });
    setPast(p => [...p, { snap: curSnap, label: 'redo', ts: Date.now() }]);
    const next = future[future.length - 1];
    setFuture(f => f.slice(0, -1));
    skipRef.current = true;
    try { const { walls, feats } = JSON.parse(next.snap); setWalls(walls); setFeats(feats); } catch(e) {}
  }, [future]);

  return {
    pushState, undo, redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoLabel: past.length > 0 ? past[past.length - 1].label : '',
    redoLabel: future.length > 0 ? future[future.length - 1].label : '',
    historyCount: past.length,
  };
}
