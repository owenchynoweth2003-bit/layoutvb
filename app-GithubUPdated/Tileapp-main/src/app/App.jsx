import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';

// Domain
import { CATALOG } from '../domain/tiles.js';
import { PATTERNS } from '../domain/patterns.js';
import { GROUT_COLORS } from '../domain/grout.js';
import { WALLPRESETS } from '../domain/walls.js';
import { FEAT_TYPES, SNAPS } from '../domain/features.js';

// Solver
import { nOr, posOr, clamp, sqft, wallArea, formatInches, toFraction, transformPts, snapXY } from '../solver/utils.js';
import { solvePro } from '../solver/solvePro.js';

// Hooks
import { useSpaceConfig } from '../hooks/useSpaceConfig.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';

// Components
import TileCanvas from '../components/TileCanvas/TileCanvas.jsx';
import Room3D from '../components/Room3D/Room3D.jsx';
import { SafeView } from '../components/ui/SafeView.jsx';
<<<<<<< HEAD
=======
import { Stat } from '../components/ui/Stat.jsx';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

// Steps
import SpaceStep from './steps/SpaceStep.jsx';
import TileStep from './steps/TileStep.jsx';
import LayoutStep from './steps/LayoutStep.jsx';
import ExportStep from './steps/ExportStep.jsx';

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GLOBAL_CSS = `
<<<<<<< HEAD
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, 'SF Pro Display', system-ui, sans-serif; }
=======
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif; }
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
  input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
  input[type=number]{-moz-appearance:textfield}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:4px}
  ::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.18)}
  input:focus{border-color:#93c5fd!important;box-shadow:0 0 0 3px rgba(59,130,246,.1)!important}
  button{transition:all .2s ease} button:hover{filter:brightness(.97)} button:active{transform:scale(.98)}
  button:disabled{opacity:0.35; cursor:not-allowed; transform:none; filter:none}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .ps{animation:fadeIn .3s ease}
  .hud-home {
    position: absolute; top: 4px; left: 4px;
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255, 0.92); color: #64748b;
    border: 1px solid rgba(0,0,0,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s ease; z-index: 20;
    backdrop-filter: blur(8px); box-shadow: 0 1px 3px rgba(0,0,0,.08);
  }
  .hud-home:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
  input[type="range"] { -webkit-appearance: none; background: #e2e8f0; height: 3px; border-radius: 2px; outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #1e293b; border: 2px solid #fff; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.15); }
<<<<<<< HEAD
@media print {
    header, footer, button { display: none !important; }
    canvas { max-width: 100% !important; height: auto !important; }
    body { background: white !important; }
  }
    `;
=======
`;
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

// ─── SHARED STYLE OBJECTS ────────────────────────────────────────────────────
const S = {
  l:  { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 500, display: 'block' },
  i:  { width: '100%', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: 12, fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s, box-shadow .2s' },
  b:  { width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 0.3, fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)', transition: 'all .2s ease' },
  s:  { marginBottom: 16 },
};

const Sp = (on) => ({
  padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
  background: on ? '#f0f4ff' : '#fff',
  border: `1px solid ${on ? '#bfdbfe' : '#e5e7eb'}`,
  color: on ? '#1e40af' : '#64748b', transition: 'all .2s ease',
  boxShadow: on ? '0 0 0 1px rgba(59,130,246,.08)' : '0 1px 2px rgba(0,0,0,.04)',
});

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step,         setStep]         = useState(0);
<<<<<<< HEAD
  const {
    wallType, setWallType, walls, setWalls, aw, setAw, feats, setFeats,
    wallPatterns, setWallPatterns, setWallPattern,
    wallVisible, setWallVisible, toggleWallVisible, isWallVisible,
    usePerWallPat, setUsePerWallPat, getWallPattern,
    wallConnection, setWallConnection,
  } = useSpaceConfig();
=======
  const { wallType, setWallType, walls, setWalls, aw, setAw, feats, setFeats } = useSpaceConfig();
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
  const [tile,         setTile]         = useState(CATALOG[0]);
  const [grout,        setGrout]        = useState(0.125);
  const [groutColorId, setGroutColorId] = useState('charcoal');
  const [mcw,          setMcw]          = useState(2);
  const [mch,          setMch]          = useState(2);
  const [pat,          setPat]          = useState('offset_h');
  const [wrap,         setWrap]         = useState(false);
  const [zoom,         setZoom]         = useState(1);
  const [showMeas,     setShowMeas]     = useState(true);
  const [autoSolve,    setAutoSolve]    = useState(true);
  const [manXOff,      setManXOff]      = useState(null);
  const [manYOff,      setManYOff]      = useState(null);
  const [viewMode,     setViewMode]     = useState('inside');
  const [rankSnapshot, setRankSnapshot] = useState(null);

  const [isPending, startTransition]    = useTransition();
  const [solverInputs, setSolverInputs] = useState({ walls, tile, pat, grout, mcw, mch, autoSolve, manXOff, manYOff, feats });

  useEffect(() => {
    startTransition(() => {
      setSolverInputs({ walls, tile, pat, grout, mcw, mch, autoSolve, manXOff, manYOff, feats });
    });
<<<<<<< HEAD
  }, [walls, tile, pat, grout, mcw, mch, autoSolve, manXOff, manYOff, feats, wallConnection]);
=======
  }, [walls, tile, pat, grout, mcw, mch, autoSolve, manXOff, manYOff, feats]);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

  const groutColor = useMemo(() => GROUT_COLORS.find(g => g.id === groutColorId)?.color || '#3a3a3a', [groutColorId]);

  const pro = useMemo(() => solvePro(
    solverInputs.walls, solverInputs.tile, solverInputs.pat, solverInputs.grout,
    solverInputs.mcw, solverInputs.mch,
    solverInputs.autoSolve ? null : solverInputs.manXOff,
    solverInputs.autoSolve ? null : solverInputs.manYOff,
<<<<<<< HEAD
    solverInputs.feats,
    wallConnection
  ), [solverInputs, wallConnection]);
=======
    solverInputs.feats
  ), [solverInputs]);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

  const ranked = useMemo(() => {
    if (!rankSnapshot) return [];
    return PATTERNS.map(p => {
<<<<<<< HEAD
      const s = solvePro(rankSnapshot.walls, rankSnapshot.tile, p.id, rankSnapshot.grout, rankSnapshot.mcw, rankSnapshot.mch, null, null, rankSnapshot.feats, wallConnection);
=======
      const s = solvePro(rankSnapshot.walls, rankSnapshot.tile, p.id, rankSnapshot.grout, rankSnapshot.mcw, rankSnapshot.mch, null, null, rankSnapshot.feats);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      return { ...s.layouts[rankSnapshot.aw] || s.layouts[0], pat: p.id, avgScore: s.avgScore, allMeet: s.allMeet };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [rankSnapshot]);

  useEffect(() => {
    const wallPreset = WALLPRESETS.find(w => w.id === wallType);
    if (!wallPreset) return;
    setWalls(wallPreset.p.map(x => ({ ...x })));
    setAw(0); setFeats([]); setWrap(wallPreset.p.length > 1);
    setManXOff(null); setManYOff(null);
  }, [wallType]);

  useKeyboardShortcuts({ setZoom, setShowMeas });

  useEffect(() => {
    const h = e => setAw(e.detail);
    window.addEventListener('tilevision-select-wall', h);
    window._tvSetViewMode = setViewMode;
    return () => { window.removeEventListener('tilevision-select-wall', h); delete window._tvSetViewMode; };
  }, []);

  const cw = walls[aw] || walls[0] || { name: 'Wall', w: 60, h: 96 };
  const sp = { width: Math.max(0, nOr(cw.w, 0)), height: Math.max(0, nOr(cw.h, 0)) };
  const cur = pro.layouts[aw] || pro.layouts[0];
  const wf = useMemo(() => feats.filter(f => f.wi === aw), [feats, aw]);
  const totalArea = useMemo(() => walls.reduce((s, w) => s + wallArea(w), 0), [walls]);
<<<<<<< HEAD
    const totT = pro.layouts.reduce((s, l) => s + l.tiles, 0);
=======
  const tileCost = useMemo(() => (pro.layouts.reduce((s, l) => s + l.tiles, 0) * (tile.price || 5)).toFixed(0), [pro, tile]);
  const totT = pro.layouts.reduce((s, l) => s + l.tiles, 0);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

  const clearOffsets = useCallback(() => { setManXOff(null); setManYOff(null); }, []);

  const addFeat = useCallback(tid => {
    const ft = FEAT_TYPES.find(t => t.id === tid); if (!ft) return;
    const cnt = feats.filter(f => f.type === tid && f.wi === aw).length + 1;
    const dw = ft.hasR ? ft.dr * 2 : ft.dw, dh = ft.hasR ? ft.dr * 2 : ft.dh;
    const w = clamp(dw, 1, Math.max(1, sp.width)), h = clamp(dh, 1, Math.max(1, sp.height));
    setFeats(p => [...p, { type: tid, name: ft.name, w, h, x: clamp((sp.width - w) / 2, 0, Math.max(0, sp.width - w)), y: clamp((sp.height - h) / 2, 0, Math.max(0, sp.height - h)), wi: aw, iNum: cnt, ...(ft.hasR ? { radius: posOr(ft.dr, 2) } : {}) }]);
  }, [aw, feats, sp]);

  const remFeat = useCallback(li => { const t = wf[li]; if (!t) return; setFeats(p => p.filter(f => f !== t)); }, [wf]);
  const updFeat = useCallback((li, k, v) => {
    const t = wf[li]; if (!t) return;
    setFeats(p => p.map(f => { if (f !== t) return f; const n = { ...f, [k]: v }; if (k === 'radius') { n.w = v * 2; n.h = v * 2; } return n; }));
  }, [wf]);

  const onDragCb = useCallback((fi, x, y) => setFeats(p => p.map((f, i) => i !== fi ? f : { ...f, x, y })), []);
  const snapF = useCallback((li, sn) => {
    const f = wf[li]; if (!f) return;
    const [x, y] = snapXY(sn, sp.width, sp.height, f.w, f.h);
    setFeats(p => p.map(ff => ff !== f ? ff : { ...ff, x: clamp(x, 0, Math.max(0, sp.width - f.w)), y: clamp(y, 0, Math.max(0, sp.height - f.h)) }));
  }, [wf, sp]);

  const updWall = useCallback((i, k, v) => { setWalls(p => p.map((w, j) => j !== i ? w : { ...w, [k]: v })); clearOffsets(); }, [clearOffsets]);

  const toggleCustom = useCallback(wi => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi) return w;
      if (w.isCustom) { const { isCustom, points, ...rest } = w; return rest; }
      return { ...w, isCustom: true, points: [[0, w.h], [w.w, w.h], [w.w, 0], [0, 0]] };
    })); clearOffsets();
  }, [clearOffsets]);

  const rotateWall = useCallback((wi, action) => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi || !w.isCustom || !w.points) return w;
      const pts = transformPts(w.points, action);
      const maxX = Math.max(...pts.map(pt => pt[0])), maxY = Math.max(...pts.map(pt => pt[1]));
      return { ...w, points: pts, w: Math.max(1, maxX), h: Math.max(1, maxY) };
    })); clearOffsets();
  }, [clearOffsets]);

  const applyShape = useCallback((wi, shape) => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi) return w;
      const ww = w.w || 60, wh = w.h || 96;
      let pts;
      if (shape === 'triangle') pts = [[0, wh], [ww, wh], [ww / 2, 0]];
      else if (shape === 'trapezoid') pts = [[0, wh], [ww, wh], [ww * 0.8, 0], [ww * 0.2, 0]];
      else if (shape === 'lshape') pts = [[0, wh], [ww, wh], [ww, wh * 0.5], [ww * 0.5, wh * 0.5], [ww * 0.5, 0], [0, 0]];
      else if (shape === 'arch') { pts = [[0, wh]]; const nSeg = 12; for (let i = 0; i <= nSeg; i++) { const a = Math.PI + (Math.PI * i) / nSeg; pts.push([ww / 2 + (ww / 2) * Math.cos(a), -(ww / 2) * Math.sin(a)]); } pts.push([ww, wh]); }
      else if (shape === 'hexagon') { pts = []; const r = Math.min(ww, wh) / 2; for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 2; pts.push([ww / 2 + r * Math.cos(a), wh / 2 + r * Math.sin(a)]); } }
      else if (shape === 'diamond') pts = [[ww / 2, 0], [ww, wh / 2], [ww / 2, wh], [0, wh / 2]];
      else return w;
      const xs = pts.map(pt => pt[0]), ys = pts.map(pt => pt[1]);
      const offX = Math.min(...xs), offY = Math.min(...ys);
      const normPts = pts.map(pt => [+(pt[0] - offX).toFixed(2), +(pt[1] - offY).toFixed(2)]);
      const maxX = Math.max(...normPts.map(pt => pt[0])), maxY = Math.max(...normPts.map(pt => pt[1]));
      return { ...w, isCustom: true, points: normPts, w: Math.max(1, maxX), h: Math.max(1, maxY) };
    })); clearOffsets();
  }, [clearOffsets]);

  const duplicateWall = useCallback(() => {
    const src = walls[aw]; if (!src) return;
    const copy = { ...src, name: `${src.name} Copy`, points: src.points?.map(p => [...p]) };
    setWalls(p => [...p.slice(0, aw + 1), copy, ...p.slice(aw + 1)]);
    setFeats(p => p.map(f => f.wi > aw ? { ...f, wi: f.wi + 1 } : f));
    setAw(aw + 1);
    if (walls.length === 1) setWrap(true);
    clearOffsets();
  }, [aw, walls, clearOffsets]);

  const addWall = useCallback(() => {
    setWalls(p => [...p, { name: `Wall ${p.length + 1}`, w: 60, h: 96 }]);
    setAw(walls.length);
    if (walls.length === 1) setWrap(true);
    clearOffsets();
  }, [walls.length, clearOffsets]);

  const deleteWall = useCallback(() => {
    if (walls.length <= 1) return;
    setWalls(p => p.filter((_, i) => i !== aw));
    setFeats(p => p.filter(f => f.wi !== aw).map(f => f.wi > aw ? { ...f, wi: f.wi - 1 } : f));
    setAw(a => Math.min(a, walls.length - 2));
    clearOffsets();
  }, [aw, walls.length, clearOffsets]);

  const moveWall = useCallback((dir) => {
    const targetIdx = aw + dir;
    if (targetIdx < 0 || targetIdx >= walls.length) return;
    setWalls(prev => { const arr = [...prev]; [arr[aw], arr[targetIdx]] = [arr[targetIdx], arr[aw]]; return arr; });
    setFeats(prev => prev.map(f => { if (f.wi === aw) return { ...f, wi: targetIdx }; if (f.wi === targetIdx) return { ...f, wi: aw }; return f; }));
    setAw(targetIdx); clearOffsets();
  }, [aw, walls.length, clearOffsets]);

  const updWallPt = useCallback((wi, pi, axis, val) => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi || !w.points) return w;
      const pts = w.points.map(pt => [...pt]); pts[pi][axis] = val;
      const maxX = Math.max(...pts.map(pt => parseFloat(pt[0]) || 0)), maxY = Math.max(...pts.map(pt => parseFloat(pt[1]) || 0));
      return { ...w, points: pts, w: Math.max(1, maxX), h: Math.max(1, maxY) };
    })); clearOffsets();
  }, [clearOffsets]);

  const addWallPt = useCallback(wi => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi || !w.points) return w;
      const pts = [...w.points.map(pt => [...pt]), [w.points[w.points.length - 1][0] + 12, w.points[w.points.length - 1][1]]];
      const maxX = Math.max(...pts.map(pt => parseFloat(pt[0]) || 0)), maxY = Math.max(...pts.map(pt => parseFloat(pt[1]) || 0));
      return { ...w, points: pts, w: Math.max(1, maxX), h: Math.max(1, maxY) };
    }));
  }, []);

  const remWallPt = useCallback((wi, pi) => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi || !w.points || w.points.length <= 3) return w;
      const pts = w.points.filter((_, i) => i !== pi);
      const maxX = Math.max(...pts.map(pt => parseFloat(pt[0]) || 0)), maxY = Math.max(...pts.map(pt => parseFloat(pt[1]) || 0));
      return { ...w, points: pts, w: Math.max(1, maxX), h: Math.max(1, maxY) };
    }));
  }, []);

  const onDragPt = useCallback((wi, pi, x, y) => {
    setWalls(p => p.map((w, j) => {
      if (j !== wi || !w.points) return w;
      const pts = w.points.map(pt => [...pt]); pts[pi] = [x, y];
      const maxX = Math.max(...pts.map(pt => parseFloat(pt[0]) || 0)), maxY = Math.max(...pts.map(pt => parseFloat(pt[1]) || 0));
      return { ...w, points: pts, w: Math.max(1, maxX), h: Math.max(1, maxY) };
    }));
  }, []);

  const goToStep2 = useCallback(() => {
    setStep(2);
    setRankSnapshot({ walls, tile, grout, mcw, mch, feats, aw });
  }, [walls, tile, grout, mcw, mch, feats, aw]);
<<<<<<< HEAD
const exportPNG = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = `tilevision-layout-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }, []);

  const export3D = useCallback(() => {
    const canvas3d = document.querySelector('[style*="cursor: grab"] canvas');
    if (!canvas3d) return;
    const link = document.createElement('a');
    link.download = `tilevision-3d-${Date.now()}.png`;
    link.href = canvas3d.toDataURL('image/png');
    link.click();
  }, []);
=======

>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
  return (
    <div style={{ height: '100vh', background: '#f8f9fb', color: '#1e293b', fontFamily: "'Inter', -apple-system, 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #e5e7eb', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', zIndex: 50, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(30,41,59,.2)' }}>◈</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3, color: '#0f172a' }}>TileVision</div>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 0.2, marginTop: -1, fontWeight: 500 }}>Pro Installer</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 1, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
          {['Space','Tile','Layout','Export'].map((l, i) => (
            <button key={l} onClick={() => { if (i === 2) goToStep2(); else setStep(i); }}
              style={{ background: step === i ? '#fff' : 'transparent', border: 'none', color: step === i ? '#0f172a' : '#94a3b8', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: 0.1, fontFamily: 'inherit', position: 'relative', boxShadow: step === i ? '0 1px 3px rgba(0,0,0,.06)' : 'none' }}>
              {step === i && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 14, height: 2, background: '#1e293b', borderRadius: 1 }} />}
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowMeas(m => !m)} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', background: showMeas ? '#eff6ff' : '#f8fafc', border: `1px solid ${showMeas ? '#bfdbfe' : '#e5e7eb'}`, color: showMeas ? '#2563eb' : '#94a3b8', fontWeight: 500, transition: 'all .2s' }}>Cuts</button>
          {isPending && <span style={{ fontSize: 10, color: '#d97706', animation: 'pulse 1s ease infinite' }}>⟳</span>}
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
<<<<<<< HEAD
        {/* ═══ LEFT PANEL ═══ */}
        <div style={{ width: 272, flexShrink: 0, borderRight: '1px solid #f1f5f9', padding: '14px 14px 32px', overflowY: 'auto', background: '#fff' }}>
          <div className="ps">
            {step === 0 && <SpaceStep walls={walls} aw={aw} setAw={setAw} cw={cw} sp={sp} wf={wf} totalArea={totalArea} wallType={wallType} setWallType={setWallType} viewMode={viewMode} setViewMode={setViewMode} pro={pro} updWall={updWall} toggleCustom={toggleCustom} rotateWall={rotateWall} applyShape={applyShape} duplicateWall={duplicateWall} addWall={addWall} deleteWall={deleteWall} moveWall={moveWall} updWallPt={updWallPt} addWallPt={addWallPt} remWallPt={remWallPt} feats={feats} addFeat={addFeat} remFeat={remFeat} updFeat={updFeat} snapF={snapF} setStep={setStep} wallVisible={wallVisible} toggleWallVisible={toggleWallVisible} isWallVisible={isWallVisible} wallConnection={wallConnection} setWallConnection={setWallConnection} wrap={wrap} setWrap={setWrap} S={S} Sp={Sp} />}
            {step === 1 && <TileStep tile={tile} setTile={setTile} grout={grout} setGrout={setGrout} groutColorId={groutColorId} setGroutColorId={setGroutColorId} mcw={mcw} setMcw={setMcw} mch={mch} setMch={setMch} autoSolve={autoSolve} setAutoSolve={setAutoSolve} manXOff={manXOff} setManXOff={setManXOff} manYOff={manYOff} setManYOff={setManYOff} pro={pro} clearOffsets={clearOffsets} setStep={setStep} goToStep2={goToStep2} S={S} Sp={Sp} />}
            {step === 2 && <LayoutStep walls={walls} aw={aw} setAw={setAw} pat={pat} setPat={setPat} wrap={wrap} setWrap={setWrap} mcw={mcw} setMcw={setMcw} mch={mch} setMch={setMch} autoSolve={autoSolve} setAutoSolve={setAutoSolve} manXOff={manXOff} setManXOff={setManXOff} manYOff={manYOff} setManYOff={setManYOff} zoom={zoom} setZoom={setZoom} pro={pro} ranked={ranked} rankSnapshot={rankSnapshot} clearOffsets={clearOffsets} setStep={setStep} usePerWallPat={usePerWallPat} setUsePerWallPat={setUsePerWallPat} wallPatterns={wallPatterns} setWallPattern={setWallPattern} S={S} Sp={Sp} />}
            {step === 3 && <ExportStep walls={walls} feats={feats} tile={tile} pat={pat} grout={grout} groutColorId={groutColorId} mcw={mcw} mch={mch} wrap={wrap} viewMode={viewMode} autoSolve={autoSolve} zoom={zoom} totalArea={totalArea} pro={pro} setWalls={setWalls} setFeats={setFeats} setTile={setTile} setPat={setPat} setGrout={setGrout} setGroutColorId={setGroutColorId} setMcw={setMcw} setMch={setMch} setWrap={setWrap} setViewMode={setViewMode} setAutoSolve={setAutoSolve} setZoom={setZoom} setAw={setAw} setStep={setStep} setManXOff={setManXOff} setManYOff={setManYOff} exportPNG={exportPNG} export3D={export3D} wallConnection={wallConnection} S={S} />}
          </div>
        </div>

        {/* ═══ CENTER ═══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#f8f9fb' }}>
          <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'center' }}>
            <TileCanvas walls={walls} aw={aw} tile={tile} grout={grout} groutColor={groutColor} pat={pat} feats={feats} CW={720} CH={420} onDrag={onDragCb} onDragPt={onDragPt} wrap={wrap && walls.length > 1} zoom={zoom} showMeas={showMeas} pro={pro} isWallVisible={isWallVisible} />
          </div>
          <div style={{ padding: '0 16px 12px', flex: 1, minHeight: 260 }}>
=======
        {/* ═══ SIDEBAR ═══ */}
        <div style={{ width: 296, flexShrink: 0, borderRight: '1px solid #e5e7eb', padding: '16px 16px 32px', overflowY: 'auto', background: '#fff' }}>
          <div className="ps">
            {step === 0 && <SpaceStep walls={walls} aw={aw} setAw={setAw} cw={cw} sp={sp} wf={wf} totalArea={totalArea} wallType={wallType} setWallType={setWallType} viewMode={viewMode} setViewMode={setViewMode} pro={pro} updWall={updWall} toggleCustom={toggleCustom} rotateWall={rotateWall} applyShape={applyShape} duplicateWall={duplicateWall} addWall={addWall} deleteWall={deleteWall} moveWall={moveWall} updWallPt={updWallPt} addWallPt={addWallPt} remWallPt={remWallPt} feats={feats} addFeat={addFeat} remFeat={remFeat} updFeat={updFeat} snapF={snapF} setStep={setStep} S={S} Sp={Sp} />}
            {step === 1 && <TileStep tile={tile} setTile={setTile} grout={grout} setGrout={setGrout} groutColorId={groutColorId} setGroutColorId={setGroutColorId} mcw={mcw} setMcw={setMcw} mch={mch} setMch={setMch} autoSolve={autoSolve} setAutoSolve={setAutoSolve} manXOff={manXOff} setManXOff={setManXOff} manYOff={manYOff} setManYOff={setManYOff} pro={pro} clearOffsets={clearOffsets} setStep={setStep} goToStep2={goToStep2} S={S} Sp={Sp} />}
            {step === 2 && <LayoutStep walls={walls} aw={aw} setAw={setAw} pat={pat} setPat={setPat} wrap={wrap} setWrap={setWrap} mcw={mcw} setMcw={setMcw} mch={mch} setMch={setMch} autoSolve={autoSolve} setAutoSolve={setAutoSolve} manXOff={manXOff} setManXOff={setManXOff} manYOff={manYOff} setManYOff={setManYOff} zoom={zoom} setZoom={setZoom} pro={pro} ranked={ranked} rankSnapshot={rankSnapshot} clearOffsets={clearOffsets} setStep={setStep} S={S} Sp={Sp} />}
            {step === 3 && <ExportStep walls={walls} feats={feats} tile={tile} pat={pat} grout={grout} groutColorId={groutColorId} mcw={mcw} mch={mch} wrap={wrap} viewMode={viewMode} autoSolve={autoSolve} zoom={zoom} totalArea={totalArea} pro={pro} setWalls={setWalls} setFeats={setFeats} setTile={setTile} setPat={setPat} setGrout={setGrout} setGroutColorId={setGroutColorId} setMcw={setMcw} setMch={setMch} setWrap={setWrap} setViewMode={setViewMode} setAutoSolve={setAutoSolve} setZoom={setZoom} setAw={setAw} setStep={setStep} setManXOff={setManXOff} setManYOff={setManYOff} S={S} />}
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#f1f5f9' }}>
          <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'center' }}>
            <TileCanvas walls={walls} aw={aw} tile={tile} grout={grout} groutColor={groutColor} pat={pat} feats={feats} CW={660} CH={380} onDrag={onDragCb} onDragPt={onDragPt} wrap={wrap && walls.length > 1} zoom={zoom} showMeas={showMeas} pro={pro} />
          </div>
          <div style={{ padding: '0 16px 12px', flex: 1, minHeight: 220 }}>
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
            <SafeView>
              <Room3D walls={walls} feats={feats} wrap={wrap && walls.length > 1} activeWallIdx={aw} tile={tile} pat={pat} grout={grout} groutColor={groutColor} pro={pro} viewMode={viewMode} />
            </SafeView>
          </div>
        </div>
<<<<<<< HEAD

        {/* ═══ RIGHT PANEL ═══ */}
        <div style={{ width: 200, flexShrink: 0, borderLeft: '1px solid #f1f5f9', padding: '14px 12px', overflowY: 'auto', background: '#fff' }}>
          <div style={{ fontSize: 9, color: '#94a3b8', letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>Surfaces</div>
          {walls.map((w, i) => {
            const lo = pro.layouts[i];
            const visible = isWallVisible(i);
            return (
              <div key={i} onClick={() => setAw(i)} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', background: aw === i ? '#f0f4ff' : visible ? '#fff' : '#f8fafc', border: `1px solid ${aw === i ? '#c7d2fe' : '#f1f5f9'}`, opacity: visible ? 1 : 0.5, transition: 'all .15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: aw === i ? '#3730a3' : '#475569' }}>{w.name}{i === pro.mi ? ' ★' : ''}</span>
                  <button onClick={e => { e.stopPropagation(); toggleWallVisible(i); }} style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #e5e7eb', background: visible ? '#ecfdf5' : '#f1f5f9', color: visible ? '#059669' : '#94a3b8', fontSize: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {visible ? '◉' : '◯'}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 6 }}>
                  <span>{lo?.tiles || 0}t</span>
                  <span>{lo?.waste || 0}%</span>
                  <span style={{ color: lo?.score >= 80 ? '#059669' : lo?.score >= 60 ? '#d97706' : '#dc2626' }}>{lo?.score || 0}</span>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
            <div>Area: {sqft(totalArea)} sf</div>
            <div>Total: {pro.layouts.reduce((s, l) => s + l.tiles, 0)} tiles</div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '6px 20px', display: 'flex', gap: 6, background: '#fff', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, padding: '4px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Pattern</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{PATTERNS.find(p => p.id === pat)?.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, padding: '4px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Score</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: pro.avgScore >= 80 ? '#059669' : '#d97706' }}>{pro.avgScore}<span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 1 }}>/100</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, padding: '4px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Tiles</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{cur?.tiles}<span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 1 }}>pcs</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, padding: '4px 10px', background: '#fff', borderRadius: 6, border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Waste</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: +(cur?.waste || 0) > 10 ? '#dc2626' : '#059669' }}>{cur?.waste}<span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 1 }}>%</span></span>
        </div>
        {pro.allMeet
          ? <div style={{ fontSize: 10, color: '#059669', fontWeight: 600, padding: '4px 10px', background: '#ecfdf5', borderRadius: 6, border: '1px solid #bbf7d0' }}>✓ No Slivers</div>
          : <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600, padding: '4px 10px', background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }}>⚠ Slivers</div>}
        {!autoSolve && <div style={{ fontSize: 10, color: '#d97706', fontWeight: 500, padding: '4px 10px', background: '#fffbeb', borderRadius: 6 }}>Manual</div>}
        <div style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8', display: 'flex', gap: 10, alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}>
          <span>{Math.round(zoom * 100)}%</span>
          <span>{sqft(totalArea)} sf</span>
=======
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px 20px', display: 'flex', gap: 8, background: 'rgba(255,255,255,.9)', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0, backdropFilter: 'blur(12px)' }}>
        <Stat l="Pattern" v={PATTERNS.find(p => p.id === pat)?.name} sm />
        <Stat l="Score" v={pro.avgScore} u="/100" c={pro.avgScore >= 80 ? '#059669' : '#d97706'} sm />
        <Stat l="Tiles" v={cur?.tiles} u="pcs" sm />
        <Stat l="Waste" v={cur?.waste} u="%" c={+(cur?.waste || 0) > 10 ? '#dc2626' : '#059669'} sm />
        <Stat l="Cost" v={`$${tileCost}`} c="#2563eb" sm />
        {pro.allMeet
          ? <div style={{ fontSize: 10, color: '#059669', fontWeight: 600, padding: '5px 12px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0', letterSpacing: 0.3 }}>✓ No Slivers</div>
          : <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600, padding: '5px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', letterSpacing: 0.3 }}>⚠ Slivers</div>}
        {!autoSolve && <div style={{ fontSize: 10, color: '#d97706', fontWeight: 500, padding: '5px 12px', background: '#fffbeb', borderRadius: 8 }}>Manual</div>}
        {isPending && <div style={{ fontSize: 10, color: '#94a3b8', padding: '5px 12px' }}>solving…</div>}
        {walls.length > 1 && <Stat l="All" v={totT} u="t" c="#2563eb" sm />}
        <div style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{Math.round(zoom * 100)}%</span>
          <span>{sqft(totalArea)}sf</span>
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          <span>X:{formatInches(pro.globalXOff)} Y:{formatInches(pro.globalYOff)}</span>
        </div>
      </div>
    </div>
  );
}
