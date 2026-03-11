import React, { useState, useRef, useEffect } from 'react';
import { Sc } from '../../components/ui/Sc.jsx';
import { FracInp } from '../../components/ui/FracInp.jsx';
import { CATALOG, TEXTURE_MODES } from '../../domain/tiles.js';
import { GROUT_COLORS } from '../../domain/grout.js';
import { toFraction, formatInches, nOr } from '../../solver/utils.js';

export default function TileStep({
  tile, setTile, grout, setGrout, groutColorId, setGroutColorId,
  mcw, setMcw, mch, setMch, autoSolve, setAutoSolve,
  manXOff, setManXOff, manYOff, setManYOff,
  pro, clearOffsets, setStep, goToStep2,
  walls, aw, usePerWallTile, setUsePerWallTile, setWallTile, wallTiles, getWallTile,
  customTiles, addCustomTile, removeCustomTile, S, Sp
}) {
  const [cropMode, setCropMode] = useState(false);
  const [cropImg, setCropImg] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [forLibrary, setForLibrary] = useState(false);
  const cropCanvasRef = useRef(null);
  const isDragging = useRef(false);
  const dragCorner = useRef(null); // 'tl','tr','bl','br' or 'move'
  const dragStart = useRef(null);

  const allTiles = [...CATALOG, ...(customTiles || [])];

  const handleUpload = (e, lib) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const mx = 1024, s = Math.min(mx / img.width, mx / img.height, 1);
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        const ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        const opt = new Image();
        opt.onload = () => {
          setCropImg(opt);
          setCropRect({ x: 0, y: 0, w: opt.width, h: opt.height });
          setCropMode(true);
          setForLibrary(lib);
          setUploadName(lib ? `Custom ${(customTiles?.length || 0) + 1}` : '');
        };
        opt.src = cv.toDataURL('image/png');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file); e.target.value = '';
  };

  const applyCrop = () => {
    if (!cropImg || !cropRect) return;
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, cropRect.w); cv.height = Math.max(1, cropRect.h);
    cv.getContext('2d').drawImage(cropImg, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cv.width, cv.height);
    const ci = new Image();
    ci.onload = () => {
      if (forLibrary && uploadName) {
        addCustomTile?.({ name: uploadName, w: tile.w, h: tile.h, color: '#d4cfc5', accent: '#b8b0a3', type: 'custom', img: ci, textureMode: 'single' });
      } else {
        setTile(t => ({ ...t, img: ci, id: -1, name: 'Custom Upload', type: 'custom', textureMode: 'single' }));
        clearOffsets();
      }
      setCropMode(false); setCropImg(null);
    };
    ci.src = cv.toDataURL('image/png');
  };

  // Crop canvas rendering
  const cropScale = useRef(1);
  const drawCrop = () => {
    const cv = cropCanvasRef.current; if (!cv || !cropImg) return;
    const ctx = cv.getContext('2d');
    const maxW = 280, maxH = 220;
    const sc = Math.min(maxW / cropImg.width, maxH / cropImg.height, 1);
    cropScale.current = sc;
    cv.width = Math.round(cropImg.width * sc); cv.height = Math.round(cropImg.height * sc);
    ctx.drawImage(cropImg, 0, 0, cv.width, cv.height);
    if (cropRect) {
      const r = { x: cropRect.x * sc, y: cropRect.y * sc, w: cropRect.w * sc, h: cropRect.h * sc };
      // Dim outside
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, cv.width, r.y);
      ctx.fillRect(0, r.y, r.x, r.h);
      ctx.fillRect(r.x + r.w, r.y, cv.width - r.x - r.w, r.h);
      ctx.fillRect(0, r.y + r.h, cv.width, cv.height - r.y - r.h);
      // Border
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.strokeRect(r.x, r.y, r.w, r.h);
      // Corner handles
      const hs = 6;
      [['tl', r.x, r.y], ['tr', r.x + r.w, r.y], ['bl', r.x, r.y + r.h], ['br', r.x + r.w, r.y + r.h]].forEach(([, hx, hy]) => {
        ctx.fillStyle = '#fff'; ctx.fillRect(hx - hs, hy - hs, hs * 2, hs * 2);
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5; ctx.strokeRect(hx - hs, hy - hs, hs * 2, hs * 2);
      });
      // Size label
      ctx.fillStyle = '#3b82f6'; ctx.font = '600 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(cropRect.w)}×${Math.round(cropRect.h)}px`, r.x + r.w / 2, r.y + r.h + 14);
    }
  };
  useEffect(() => { if (cropMode) drawCrop(); }, [cropMode, cropImg, cropRect]);

  const getCornerAt = (mx, my) => {
    if (!cropRect) return null;
    const sc = cropScale.current, hs = 8;
    const r = { x: cropRect.x * sc, y: cropRect.y * sc, w: cropRect.w * sc, h: cropRect.h * sc };
    if (Math.abs(mx - r.x) < hs && Math.abs(my - r.y) < hs) return 'tl';
    if (Math.abs(mx - (r.x + r.w)) < hs && Math.abs(my - r.y) < hs) return 'tr';
    if (Math.abs(mx - r.x) < hs && Math.abs(my - (r.y + r.h)) < hs) return 'bl';
    if (Math.abs(mx - (r.x + r.w)) < hs && Math.abs(my - (r.y + r.h)) < hs) return 'br';
    if (mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h) return 'move';
    return 'new';
  };

  const handleCropMouse = (e) => {
    const cv = cropCanvasRef.current; if (!cv || !cropImg) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const sc = cropScale.current;

    if (e.type === 'mousedown') {
      const corner = getCornerAt(mx, my);
      dragCorner.current = corner;
      dragStart.current = { mx, my, rect: cropRect ? { ...cropRect } : null };
      isDragging.current = true;
      if (corner === 'new') {
        setCropRect({ x: mx / sc, y: my / sc, w: 1, h: 1 });
        dragCorner.current = 'br';
        dragStart.current = { mx, my, rect: { x: mx / sc, y: my / sc, w: 1, h: 1 } };
      }
    } else if (e.type === 'mousemove' && isDragging.current && dragStart.current) {
      const dx = (mx - dragStart.current.mx) / sc, dy = (my - dragStart.current.my) / sc;
      const sr = dragStart.current.rect; if (!sr) return;
      const clp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
      let nr = { ...sr };

      if (dragCorner.current === 'move') {
        nr.x = clp(sr.x + dx, 0, cropImg.width - sr.w);
        nr.y = clp(sr.y + dy, 0, cropImg.height - sr.h);
      } else if (dragCorner.current === 'tl') {
        nr.x = clp(sr.x + dx, 0, sr.x + sr.w - 20);
        nr.y = clp(sr.y + dy, 0, sr.y + sr.h - 20);
        nr.w = sr.w - (nr.x - sr.x); nr.h = sr.h - (nr.y - sr.y);
      } else if (dragCorner.current === 'tr') {
        nr.w = clp(sr.w + dx, 20, cropImg.width - sr.x);
        nr.y = clp(sr.y + dy, 0, sr.y + sr.h - 20);
        nr.h = sr.h - (nr.y - sr.y);
      } else if (dragCorner.current === 'bl') {
        nr.x = clp(sr.x + dx, 0, sr.x + sr.w - 20);
        nr.w = sr.w - (nr.x - sr.x);
        nr.h = clp(sr.h + dy, 20, cropImg.height - sr.y);
      } else if (dragCorner.current === 'br') {
        nr.w = clp(sr.w + dx, 20, cropImg.width - sr.x);
        nr.h = clp(sr.h + dy, 20, cropImg.height - sr.y);
      }
      setCropRect({ x: Math.round(nr.x), y: Math.round(nr.y), w: Math.round(nr.w), h: Math.round(nr.h) });
    } else if (e.type === 'mouseup' || e.type === 'mouseleave') {
      isDragging.current = false; dragCorner.current = null;
    }
  };

  return (
    <>
      <Sc title="Tile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
          {allTiles.map((t, idx) => (
            <button key={t.id || `c${idx}`} onClick={() => { setTile(t); clearOffsets(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, width: '100%', background: tile.id === t.id ? '#f0f4ff' : '#fff', border: `1px solid ${tile.id === t.id ? '#bfdbfe' : '#f1f5f9'}`, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all .15s' }}>
              {t.img ? <img src={t.img.src} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} /> :
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg,${t.color},${t.accent})`, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: tile.id === t.id ? '#0f172a' : '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', display: 'flex', gap: 6 }}><span>{toFraction(t.w)}×{toFraction(t.h)}"</span><span>{t.type}</span></div>
              </div>
              {t.isCustomUpload && <button onClick={e => { e.stopPropagation(); removeCustomTile?.(customTiles.indexOf(t)); }} style={{ fontSize: 9, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}
            </button>
          ))}
        </div>
      </Sc>

      {walls && walls.length > 1 && (
        <Sc title="Per-Surface Tile" color="#8b5cf6">
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            <button onClick={() => setUsePerWallTile(false)} style={{ ...Sp(!usePerWallTile), flex: 1, textAlign: 'center', fontSize: 10 }}>Same Tile</button>
            <button onClick={() => setUsePerWallTile(true)} style={{ ...Sp(usePerWallTile), flex: 1, textAlign: 'center', fontSize: 10 }}>Per Surface</button>
          </div>
          {usePerWallTile && (
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 8, border: '1px solid #e2e8f0' }}>
              {walls.map((w, i) => {
                const st = wallTiles?.[i] || tile;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, padding: '3px 5px', borderRadius: 5, background: '#fff', border: '1px solid #f1f5f9' }}>
                    {st.img ? <img src={st.img.src} style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} /> :
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: `linear-gradient(135deg,${st.color||'#ccc'},${st.accent||'#999'})`, flexShrink: 0 }} />}
                    <span style={{ fontSize: 9, color: '#475569', flex: 1, fontWeight: 500 }}>{w.name}</span>
                    <select value={st.id} onChange={e => {
                      const found = allTiles.find(t => t.id === +e.target.value);
                      if (found) setWallTile(i, found);
                    }} style={{ fontSize: 8, padding: '2px 3px', borderRadius: 3, border: '1px solid #e2e8f0', background: '#fff', fontFamily: 'inherit', outline: 'none', maxWidth: 90 }}>
                      <option value={tile.id}>Default</option>
                      {allTiles.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </Sc>
      )}

      <Sc title="Upload Material" color="#64748b">
        <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
          <label style={{ ...Sp(false), flex: 1, textAlign: 'center', fontSize: 10, cursor: 'pointer' }}>
            + Apply to Current
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, false)} />
          </label>
          <label style={{ ...Sp(false), flex: 1, textAlign: 'center', fontSize: 10, cursor: 'pointer', border: '1px dashed #a7f3d0', color: '#059669' }}>
            + Add to Library
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, true)} />
          </label>
        </div>
        {tile.img && (
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f1f5f9', padding: 4, marginBottom: 8 }}>
            <img src={tile.img.src} alt="Tile" style={{ width: '100%', height: 'auto', borderRadius: 6, display: 'block', maxHeight: 60, objectFit: 'cover' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
              <span style={{ fontSize: 8, color: '#94a3b8' }}>{toFraction(tile.w)}×{toFraction(tile.h)}" face</span>
              <button onClick={() => setTile(t => ({ ...t, img: null }))} style={{ fontSize: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        )}
        {tile.img && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ ...S.l, fontSize: 8, marginBottom: 3 }}>Texture Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {TEXTURE_MODES.map(m => (
                <button key={m.id} onClick={() => setTile(t => ({ ...t, textureMode: m.id }))}
                  style={{ ...Sp((tile.textureMode || 'single') === m.id), fontSize: 8, padding: '3px 4px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
          <div><label style={S.l}>Width"</label><FracInp val={tile.w} onChg={v => { if (v > 0) { setTile(t => ({ ...t, w: v, id: t.img ? -1 : t.id, name: t.img ? t.name : 'Custom' })); clearOffsets(); } }} min={0.5} max={96} style={S.i} /></div>
          <div><label style={S.l}>Height"</label><FracInp val={tile.h} onChg={v => { if (v > 0) { setTile(t => ({ ...t, h: v, id: t.img ? -1 : t.id, name: t.img ? t.name : 'Custom' })); clearOffsets(); } }} min={0.5} max={96} style={S.i} /></div>
        </div>
        <div><label style={S.l}>Color</label><input type="color" value={tile.color || '#cccccc'} onChange={e => setTile(t => ({ ...t, color: e.target.value, accent: e.target.value, id: -1 }))} style={{ ...S.i, padding: 2, height: 30, cursor: 'pointer' }} disabled={!!tile.img} /></div>
      </Sc>

      <Sc title="Grout">
        <label style={S.l}>Width</label>
        <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
          {[{ v: 0.0625, l: '1/16"' }, { v: 0.125, l: '1/8"' }, { v: 0.1875, l: '3/16"' }, { v: 0.25, l: '1/4"' }].map(x => (
            <button key={x.v} onClick={() => setGrout(x.v)} style={{ ...Sp(grout === x.v), flex: 1, textAlign: 'center', fontSize: 9 }}>{x.l}</button>
          ))}
        </div>
        <label style={S.l}>Color</label>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {GROUT_COLORS.map(gc => (
            <button key={gc.id} onClick={() => setGroutColorId(gc.id)} style={{ width: 22, height: 22, borderRadius: 6, border: groutColorId === gc.id ? '2px solid #1e293b' : '1px solid #d1d5db', background: gc.color, cursor: 'pointer' }} title={gc.name} />
          ))}
        </div>
      </Sc>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => setStep(0)} style={{ ...S.b, flex: 0.5, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', boxShadow: 'none' }}>← Back</button>
        <button onClick={goToStep2} style={{ ...S.b, flex: 1 }}>Next → Layout</button>
      </div>

      {/* ═══ CROP MODAL ═══ */}
      {cropMode && cropImg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,.25)', width: 340, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Crop Tile Face</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12 }}>Drag corners to select the tile face. Drag inside to move.</div>
            <canvas ref={cropCanvasRef}
              onMouseDown={handleCropMouse} onMouseMove={handleCropMouse} onMouseUp={handleCropMouse} onMouseLeave={handleCropMouse}
              style={{ width: '100%', height: 'auto', borderRadius: 8, cursor: isDragging.current ? 'grabbing' : 'crosshair', border: '1px solid #e2e8f0', display: 'block' }} />
            {forLibrary && (
              <div style={{ marginTop: 8 }}>
                <label style={{ ...S.l, fontSize: 8 }}>Name</label>
                <input value={uploadName} onChange={e => setUploadName(e.target.value)} style={{ ...S.i, fontSize: 11 }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setCropMode(false); setCropImg(null); }} style={{ flex: 0.5, padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => setCropRect({ x: 0, y: 0, w: cropImg.width, h: cropImg.height })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f8fafc', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
              <button onClick={applyCrop} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {forLibrary ? 'Add to Library' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
