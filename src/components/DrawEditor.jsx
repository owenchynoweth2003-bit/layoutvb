import React, { useRef, useEffect, useState, useCallback } from 'react';

const GRID = 6; // 6 inch grid
const SNAP_ANGLE = 5; // degrees threshold for H/V snap
const CLOSE_DIST = 8; // inches to auto-close

function segmentsIntersect(a, b, c, d) {
  const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return false;
}

function validatePolygon(pts) {
  if (pts.length < 3) return false;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    for (let j = i + 2; j < pts.length; j++) {
      if (j === pts.length - 1 && i === 0) continue;
      const c = pts[j], d = pts[(j + 1) % pts.length];
      if (segmentsIntersect(a, b, c, d)) return false;
    }
  }
  return true;
}

export default function DrawEditor({ onFinish, onCancel, initialPoints }) {
  const canvasRef = useRef(null);
  const [pts, setPts] = useState(initialPoints || []);
  const [cursor, setCursor] = useState(null);
  const [editMode, setEditMode] = useState(!initialPoints || initialPoints.length === 0 ? 'draw' : 'edit');
  const [dragIdx, setDragIdx] = useState(-1);
  const [lockedAxes, setLockedAxes] = useState({});
  const [surfaceType, setSurfaceType] = useState('Wall');
  const [dimInput, setDimInput] = useState(''); // for typing dimension during draw mode
  const SC = 4;
  const PAD = 40;
  const W = 800, H = 560;

  const snapToGrid = useCallback((x, y) => [Math.round(x / (GRID / 4)) * (GRID / 4), Math.round(y / (GRID / 4)) * (GRID / 4)], []);

  const snapToHV = useCallback((x, y, prev) => {
    if (!prev) return [x, y];
    const dx = Math.abs(x - prev[0]), dy = Math.abs(y - prev[1]);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < SNAP_ANGLE) return [x, prev[1]];
    if (angle > 90 - SNAP_ANGLE) return [prev[0], y];
    return [x, y];
  }, []);

  const canvasToInch = useCallback((cx, cy) => [(cx - PAD) / SC, (cy - PAD) / SC], []);

  const render = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 0.5;
    for (let x = PAD; x < W - PAD; x += GRID * SC) { ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke(); }
    for (let y = PAD; y < H - PAD; y += GRID * SC) { ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke(); }
    // Major grid
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 0.8;
    for (let x = PAD; x < W - PAD; x += GRID * SC * 2) { ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke(); }
    for (let y = PAD; y < H - PAD; y += GRID * SC * 2) { ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke(); }
    // Grid labels
    ctx.font = '9px sans-serif'; ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
    for (let x = PAD; x < W - PAD; x += GRID * SC * 4) ctx.fillText(Math.round((x - PAD) / SC) + '"', x, PAD - 6);
    ctx.textAlign = 'right';
    for (let y = PAD; y < H - PAD; y += GRID * SC * 4) ctx.fillText(Math.round((y - PAD) / SC) + '"', PAD - 6, y + 3);

    if (pts.length === 0 && !cursor) return;

    // Draw polygon fill preview
    if (pts.length >= 3) {
      ctx.globalAlpha = 0.06; ctx.fillStyle = '#4f46e5';
      ctx.beginPath(); ctx.moveTo(PAD + pts[0][0] * SC, PAD + pts[0][1] * SC);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(PAD + pts[i][0] * SC, PAD + pts[i][1] * SC);
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }

    // Draw edges with dimensions
    ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if (i === pts.length - 1 && editMode === 'draw') continue;
      ctx.beginPath(); ctx.moveTo(PAD + a[0] * SC, PAD + a[1] * SC); ctx.lineTo(PAD + b[0] * SC, PAD + b[1] * SC); ctx.stroke();
      // Dimension label
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const len = Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
      if (len > 2) {
        ctx.font = '600 10px sans-serif'; ctx.fillStyle = '#1e40af'; ctx.textAlign = 'center';
        const isLocked = lockedAxes[i];
        ctx.fillText((isLocked ? '🔒 ' : '') + len.toFixed(1) + '"', PAD + mx * SC, PAD + my * SC - 8);
      }
    }

    // Cursor line from last point
    if (editMode === 'draw' && pts.length > 0 && cursor) {
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1.5;
      const last = pts[pts.length - 1];
      ctx.beginPath(); ctx.moveTo(PAD + last[0] * SC, PAD + last[1] * SC);
      ctx.lineTo(PAD + cursor[0] * SC, PAD + cursor[1] * SC); ctx.stroke();
      ctx.setLineDash([]);
      // Snap guide lines
      if (Math.abs(cursor[0] - last[0]) < 0.5) {
        ctx.strokeStyle = 'rgba(5,150,105,0.3)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(PAD + cursor[0] * SC, PAD); ctx.lineTo(PAD + cursor[0] * SC, H - PAD); ctx.stroke();
      }
      if (Math.abs(cursor[1] - last[1]) < 0.5) {
        ctx.strokeStyle = 'rgba(5,150,105,0.3)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(PAD, PAD + cursor[1] * SC); ctx.lineTo(W - PAD, PAD + cursor[1] * SC); ctx.stroke();
      }
    }

    // Draw points
    pts.forEach((p, i) => {
      const px = PAD + p[0] * SC, py = PAD + p[1] * SC;
      ctx.fillStyle = i === 0 ? '#059669' : dragIdx === i ? '#dc2626' : '#4f46e5';
      ctx.beginPath(); ctx.arc(px, py, i === 0 ? 7 : 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '700 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, px, py); ctx.textBaseline = 'alphabetic';
    });

    // Close zone
    if (editMode === 'draw' && pts.length >= 3) {
      const fp = pts[0];
      ctx.strokeStyle = 'rgba(5,150,105,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(PAD + fp[0] * SC, PAD + fp[1] * SC, CLOSE_DIST * SC, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Validation indicator
    if (pts.length >= 3) {
      const valid = validatePolygon(pts);
      ctx.font = '600 11px sans-serif'; ctx.textAlign = 'right';
      ctx.fillStyle = valid ? '#059669' : '#dc2626';
      ctx.fillText(valid ? '✓ Valid shape' : '✗ Self-intersecting', W - PAD, H - 10);
    }
  }, [pts, cursor, editMode, dragIdx, lockedAxes]);

  useEffect(() => { render(); }, [render]);

  const handleClick = useCallback(e => {
    const rect = canvasRef.current.getBoundingClientRect();
    let [ix, iy] = canvasToInch(e.clientX - rect.left, e.clientY - rect.top);
    [ix, iy] = snapToGrid(ix, iy);
    if (pts.length > 0) [ix, iy] = snapToHV(ix, iy, pts[pts.length - 1]);
    if (ix < 0 || iy < 0) return;

    if (editMode === 'draw') {
      // Close shape?
      if (pts.length >= 3) {
        const dist = Math.sqrt((ix - pts[0][0]) ** 2 + (iy - pts[0][1]) ** 2);
        if (dist < CLOSE_DIST) { setEditMode('edit'); return; }
      }
      // Self-intersection check
      if (pts.length >= 2) {
        const newSeg = [pts[pts.length - 1], [ix, iy]];
        for (let i = 0; i < pts.length - 2; i++) {
          if (segmentsIntersect(pts[i], pts[i + 1], newSeg[0], newSeg[1])) return;
        }
      }
      setPts(p => [...p, [ix, iy]]);
    } else if (editMode === 'edit') {
      // Check if clicking near an edge midpoint to add point
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (Math.sqrt((ix - mx) ** 2 + (iy - my) ** 2) < 6) {
          setPts(p => [...p.slice(0, i + 1), [mx, my], ...p.slice(i + 1)]);
          return;
        }
      }
    }
  }, [pts, editMode, canvasToInch, snapToGrid, snapToHV]);

  const handleMove = useCallback(e => {
    const rect = canvasRef.current.getBoundingClientRect();
    let [ix, iy] = canvasToInch(e.clientX - rect.left, e.clientY - rect.top);
    [ix, iy] = snapToGrid(ix, iy);
    if (pts.length > 0) [ix, iy] = snapToHV(ix, iy, editMode === 'draw' ? pts[pts.length - 1] : null);
    setCursor([ix, iy]);
    if (dragIdx >= 0 && editMode === 'edit') {
      setPts(p => p.map((pt, i) => {
        if (i !== dragIdx) return pt;
        const locked = lockedAxes[i];
        if (locked === 'h') return [ix, pt[1]];
        if (locked === 'v') return [pt[0], iy];
        return [ix, iy];
      }));
    }
  }, [pts, editMode, dragIdx, lockedAxes, canvasToInch, snapToGrid, snapToHV]);

  const handleDown = useCallback(e => {
    if (editMode !== 'edit') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const [ix, iy] = canvasToInch(e.clientX - rect.left, e.clientY - rect.top);
    for (let i = 0; i < pts.length; i++) {
      if (Math.sqrt((ix - pts[i][0]) ** 2 + (iy - pts[i][1]) ** 2) < 5) { setDragIdx(i); return; }
    }
  }, [pts, editMode, canvasToInch]);

  const handleUp = useCallback(() => setDragIdx(-1), []);

  const toggleLock = useCallback(idx => {
    setLockedAxes(prev => {
      const cur = prev[idx];
      if (!cur) return { ...prev, [idx]: 'h' };
      if (cur === 'h') return { ...prev, [idx]: 'v' };
      const { [idx]: _, ...rest } = prev; return rest;
    });
  }, []);

  const deletePoint = useCallback(idx => {
    if (pts.length <= 3) return;
    setPts(p => p.filter((_, i) => i !== idx));
  }, [pts.length]);

  const handleFinish = useCallback(() => {
    if (pts.length < 3 || !validatePolygon(pts)) return;
    onFinish(pts, surfaceType);
  }, [pts, onFinish, surfaceType]);

  const area = pts.length >= 3 ? Math.abs(pts.reduce((a, p, i) => { const j = (i + 1) % pts.length; return a + p[0] * pts[j][1] - pts[j][0] * p[1]; }, 0) / 2) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,.25)', width: W + 40, maxWidth: '95vw', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>✏ Shape Editor</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
              {editMode === 'draw' ? 'Click to place points · Click green dot to close' : 'Drag points to edit · Click edge midpoints to add'}
              {pts.length >= 3 && ` · ${(area / 144).toFixed(1)} sf`}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <label style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>SURFACE:</label>
              <select value={surfaceType} onChange={e => setSurfaceType(e.target.value)}
                style={{ fontSize: 10, padding: '3px 6px', borderRadius: 4, border: '1px solid #e2e8f0', fontFamily: 'inherit', outline: 'none' }}>
                {['Wall', 'Floor', 'Ceiling', 'Wainscot', 'Backsplash', 'Niche', 'Custom'].map(t => <option key={t}>{t}</option>)}
              </select>
              {editMode === 'draw' && pts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 8 }}>
                  <label style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>NEXT LINE:</label>
                  <input type="number" placeholder="inches" value={dimInput} onChange={e => setDimInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && dimInput && pts.length > 0 && cursor) {
                        const len = parseFloat(dimInput);
                        if (len > 0) {
                          const last = pts[pts.length - 1];
                          const dx = cursor[0] - last[0], dy = cursor[1] - last[1];
                          const dist = Math.sqrt(dx * dx + dy * dy);
                          if (dist > 0.1) {
                            const nx = +(last[0] + (dx / dist) * len).toFixed(2);
                            const ny = +(last[1] + (dy / dist) * len).toFixed(2);
                            setPts(p => [...p, [nx, ny]]);
                            setDimInput('');
                          }
                        }
                      }
                    }}
                    style={{ width: 60, fontSize: 10, padding: '3px 6px', borderRadius: 4, border: '1px solid #e2e8f0', fontFamily: 'inherit', outline: 'none', textAlign: 'center' }} />
                  <span style={{ fontSize: 8, color: '#94a3b8' }}>"</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setEditMode('draw'); setPts([]); setLockedAxes({}); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f8fafc', color: '#475569', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
            {editMode === 'draw' && pts.length > 0 && <button onClick={() => setPts(p => p.slice(0, -1))} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fffbeb', color: '#d97706', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>↩ Undo</button>}
            {editMode === 'draw' && pts.length >= 3 && <button onClick={() => setEditMode('edit')} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Close Shape</button>}
          </div>
        </div>
        <div style={{ padding: 20, display: 'flex', gap: 16 }}>
          <canvas ref={canvasRef} width={W} height={H}
            onClick={handleClick} onMouseMove={handleMove} onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleUp}
            style={{ border: '1px solid #e2e8f0', borderRadius: 8, cursor: editMode === 'draw' ? 'crosshair' : dragIdx >= 0 ? 'grabbing' : 'grab', background: '#f8fafc' }} />
        </div>
        {/* Edge dimension inputs */}
        {editMode === 'edit' && pts.length >= 3 && (
          <div style={{ padding: '0 20px 8px' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Edge Dimensions</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {pts.map((p, i) => {
                const b = pts[(i + 1) % pts.length];
                const len = Math.sqrt((b[0] - p[0]) ** 2 + (b[1] - p[1]) ** 2);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px', borderRadius: 4, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>E{i + 1}</span>
                    <input type="number" value={+len.toFixed(2)} step={0.25} min={1}
                      onChange={e => {
                        const newLen = parseFloat(e.target.value);
                        if (!newLen || newLen < 1) return;
                        const ratio = newLen / Math.max(0.01, len);
                        const dx = b[0] - p[0], dy = b[1] - p[1];
                        const nb = [+(p[0] + dx * ratio).toFixed(2), +(p[1] + dy * ratio).toFixed(2)];
                        setPts(prev => prev.map((pt, j) => j === (i + 1) % prev.length ? nb : pt));
                      }}
                      style={{ width: 48, fontSize: 9, padding: '2px 3px', borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', fontFamily: 'inherit', outline: 'none', textAlign: 'center' }} />
                    <span style={{ fontSize: 7, color: '#94a3b8' }}>"</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {editMode === 'edit' && pts.length >= 3 && (
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {pts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '3px 6px', borderRadius: 4, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 9 }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>P{i + 1}</span>
                <span style={{ color: '#94a3b8' }}>{p[0].toFixed(1)}×{p[1].toFixed(1)}</span>
                <button onClick={() => toggleLock(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: lockedAxes[i] ? '#2563eb' : '#94a3b8' }}>{lockedAxes[i] === 'h' ? '↔' : lockedAxes[i] === 'v' ? '↕' : '○'}</button>
                {pts.length > 3 && <button onClick={() => deletePoint(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#dc2626' }}>✕</button>}
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleFinish} disabled={pts.length < 3 || !validatePolygon(pts)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: pts.length >= 3 && validatePolygon(pts) ? '#1e293b' : '#94a3b8', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: pts.length >= 3 && validatePolygon(pts) ? 1 : 0.5 }}>
            Create Surface
          </button>
        </div>
      </div>
    </div>
  );
}
