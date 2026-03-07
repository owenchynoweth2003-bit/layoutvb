import React from 'react';
import { Sc } from '../../components/ui/Sc.jsx';
import { FracInp } from '../../components/ui/FracInp.jsx';
import { CATALOG } from '../../domain/tiles.js';
import { GROUT_COLORS } from '../../domain/grout.js';
import { toFraction, formatInches, nOr } from '../../solver/utils.js';

export default function TileStep({
  tile, setTile, grout, setGrout, groutColorId, setGroutColorId,
  mcw, setMcw, mch, setMch,
  autoSolve, setAutoSolve, manXOff, setManXOff, manYOff, setManYOff,
  pro, clearOffsets, setStep, goToStep2, S, Sp
}) {
  return (
    <>
      <Sc title="Tile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {CATALOG.map(t => (
            <button key={t.id} onClick={() => { setTile(t); clearOffsets(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, width: '100%', background: tile.id === t.id ? '#f0f4ff' : '#fff', border: `1px solid ${tile.id === t.id ? '#bfdbfe' : '#e5e7eb'}`, boxShadow: tile.id === t.id ? '0 0 0 1px rgba(59,130,246,.1)' : '0 1px 2px rgba(0,0,0,.03)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all .2s ease' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${t.color},${t.accent})`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: tile.id === t.id ? '#0f172a' : '#475569', fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 8, marginTop: 1 }}><span>{toFraction(t.w)}×{toFraction(t.h)}"</span><span>{t.type}</span><span style={{ color: '#059669' }}>${t.price}</span></div>
              </div>
            </button>
          ))}
        </div>
      </Sc>
      <Sc title="Custom Size & Image" color="#64748b">
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, border: '1px solid #e2e8f0' }}>
          
          {/* Tile Image Upload */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ ...S.b, background: '#fff', border: '1px dashed #cbd5e1', color: '#475569', boxShadow: 'none', textAlign: 'center', cursor: 'pointer', display: 'block', padding: '12px' }}>
              {tile.img ? '✓ Custom Tile Uploaded (Click to change)' : '+ Upload Tile Image (JPG/PNG)'}
              <input type="file" accept="image/png, image/jpeg, image/jpg" style={{ display: 'none' }} onChange={e => {
<<<<<<< HEAD
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 512;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const optimizedImg = new Image();
      optimizedImg.onload = () => {
        setTile(t => ({ ...t, img: optimizedImg, id: -1, name: 'Custom Upload', type: 'custom' }));
        clearOffsets();
      };
      optimizedImg.src = canvas.toDataURL('image/jpeg', 0.85);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}} />
=======
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const img = new Image();
                  img.onload = () => {
                    setTile(t => ({ ...t, img: img, id: -1, name: 'Custom Upload', type: 'custom' }));
                    clearOffsets();
                  };
                  img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }} />
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
            </label>
            {tile.img && (
              <button onClick={() => setTile(t => ({ ...t, img: null, name: 'Custom Tile' }))} style={{ fontSize: 10, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, width: '100%', textAlign: 'center' }}>Remove Image</button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <label style={S.l}>Width"</label>
              <FracInp val={tile.w} onChg={v => { if (v > 0) { setTile(t => ({ ...t, w: v, id: -1, name: t.id === -1 ? t.name : 'Custom' })); clearOffsets(); } }} min={0.5} max={96} style={S.i} />
            </div>
            <div>
              <label style={S.l}>Height"</label>
              <FracInp val={tile.h} onChg={v => { if (v > 0) { setTile(t => ({ ...t, h: v, id: -1, name: t.id === -1 ? t.name : 'Custom' })); clearOffsets(); } }} min={0.5} max={96} style={S.i} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
<<<<<<< HEAD
            
=======
            <div>
              <label style={S.l}>Price $/tile</label>
              <input type="number" value={tile.price || ''} onChange={e => setTile(t => ({ ...t, price: nOr(e.target.value, 5), id: -1 }))} step={0.25} min={0} style={S.i} />
            </div>
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
            <div>
              <label style={S.l}>Color</label>
              <input type="color" value={tile.color || '#cccccc'} onChange={e => setTile(t => ({ ...t, color: e.target.value, accent: e.target.value, id: -1 }))} style={{ ...S.i, padding: 2, height: 34, cursor: 'pointer' }} disabled={!!tile.img} />
            </div>
          </div>
        </div>
      </Sc>
      <Sc title="Grout">
        <label style={S.l}>Width</label>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[{ v: 0.0625, l: '1/16"' }, { v: 0.125, l: '1/8"' }, { v: 0.1875, l: '3/16"' }, { v: 0.25, l: '1/4"' }].map(x => (
            <button key={x.v} onClick={() => setGrout(x.v)} style={{ ...Sp(grout === x.v), flex: 1, textAlign: 'center', fontSize: 10 }}>{x.l}</button>
          ))}
        </div>
        <label style={S.l}>Color</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {GROUT_COLORS.map(gc => (
            <button key={gc.id} onClick={() => setGroutColorId(gc.id)} style={{ width: 26, height: 26, borderRadius: 8, border: groutColorId === gc.id ? '2px solid #1e293b' : '1px solid #d1d5db', background: gc.color, cursor: 'pointer', transition: 'all .2s' }} title={gc.name} />
          ))}
        </div>
      </Sc>
      <Sc title="Min Cut" color="#f87171">
        <label style={S.l}>Sides: {formatInches(mcw)}</label>
        <input type="range" min={0} max={8} step={0.25} value={mcw} onChange={e => { setMcw(nOr(e.target.value, 2)); setManXOff(null); }} style={{ width: '100%' }} />
        <label style={{ ...S.l, marginTop: 8 }}>Top/Btm: {formatInches(mch)}</label>
        <input type="range" min={0} max={8} step={0.25} value={mch} onChange={e => { setMch(nOr(e.target.value, 2)); setManYOff(null); }} style={{ width: '100%' }} />
        <div style={{ fontSize: 10, color: pro.allMeet ? '#059669' : '#dc2626', marginTop: 6, fontWeight: 500 }}>{pro.allMeet ? '✓ All edges pass' : '⚠ Adjust to fix slivers'}</div>
      </Sc>
      <Sc title="Offset Control" color="#a78bfa">
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <button onClick={() => { setAutoSolve(true); clearOffsets(); }} style={{ ...Sp(autoSolve), flex: 1, textAlign: 'center', fontSize: 11 }}>Auto</button>
          <button onClick={() => { setAutoSolve(false); setManXOff(pro.globalXOff); setManYOff(pro.globalYOff); }} style={{ ...Sp(!autoSolve), flex: 1, textAlign: 'center', fontSize: 11 }}>Manual</button>
        </div>
        {!autoSolve && <>
          <label style={S.l}>X Offset: {formatInches(manXOff || 0)}</label>
          <input type="range" min={0} max={pro.cellW || 24} step={1 / 32} value={manXOff || 0} onChange={e => setManXOff(nOr(e.target.value, 0))} style={{ width: '100%' }} />
          <label style={{ ...S.l, marginTop: 6 }}>Y Offset: {formatInches(manYOff || 0)}</label>
          <input type="range" min={0} max={pro.cellH || 12} step={1 / 32} value={manYOff || 0} onChange={e => setManYOff(nOr(e.target.value, 0))} style={{ width: '100%' }} />
          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 6 }}>Drag sliders → watch cuts cascade on canvas</div>
        </>}
      </Sc>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => setStep(0)} style={{ ...S.b, flex: 0.5, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', boxShadow: 'none' }}>← Back</button>
        <button onClick={goToStep2} style={{ ...S.b, flex: 1 }}>Next → Layout</button>
      </div>
    </>
  );
}
