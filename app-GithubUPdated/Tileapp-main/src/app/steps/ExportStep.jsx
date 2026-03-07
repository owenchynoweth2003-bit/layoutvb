import React from 'react';
import { Sc } from '../../components/ui/Sc.jsx';
import { Pill } from '../../components/ui/Pill.jsx';
import { CATALOG } from '../../domain/tiles.js';
import { PATTERNS } from '../../domain/patterns.js';
import { GROUT_COLORS } from '../../domain/grout.js';
import { toFraction, formatInches, sqft, wallArea } from '../../solver/utils.js';

export default function ExportStep({
  walls, feats, tile, pat, grout, groutColorId, mcw, mch, wrap, viewMode, autoSolve, zoom, totalArea, pro,
  setWalls, setFeats, setTile, setPat, setGrout, setGroutColorId, setMcw, setMch, setWrap, setViewMode, setAutoSolve, setZoom, setAw, setStep,
<<<<<<< HEAD
  setManXOff, setManYOff, exportPNG, export3D, wallConnection, S
=======
  setManXOff, setManYOff, S
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
}) {
  return (
    <>
      <Sc title="Installer Report">
        <div style={{ background: pro.allMeet ? '#ecfdf5' : '#fffbeb', borderRadius: 12, padding: 12, border: `1px solid ${pro.allMeet ? '#a7f3d0' : '#fde68a'}`, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: pro.allMeet ? '#059669' : '#d97706', letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>{pro.allMeet ? '✓ PRO READY' : '⚠ REVIEW'}</div>
          {pro.notes.map((n, i) => <div key={i} style={{ fontSize: 10, color: n.startsWith('✓') ? '#059669' : n.startsWith('⚠') ? '#d97706' : '#64748b', lineHeight: 1.8 }}>{n}</div>)}
          <div style={{ marginTop: 6, fontSize: 10 }}>Score: <span style={{ color: pro.avgScore >= 80 ? '#059669' : '#d97706', fontWeight: 600 }}>{pro.avgScore}/100</span></div>
        </div>
        {walls.map((w, i) => {
          const wl = pro.layouts[i];
          return (
            <div key={i} style={{ background: i === pro.mi ? '#f0f4ff' : '#fff', borderRadius: 10, padding: 10, marginBottom: 6, border: `1px solid ${i === pro.mi ? '#bfdbfe' : '#e5e7eb'}`, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: i === pro.mi ? '#2563eb' : '#475569' }}>{w.name}{i === pro.mi ? ' ★' : ''}</span><Pill s={wl.score} />
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 10 }}><span>{wl.tiles}t</span><span>{wl.waste}%</span></div>
              {wl.lc !== '—' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 3, marginTop: 4 }}>
                  {[['L', wl.lc, mcw], ['R', wl.rc, mcw], ['T', wl.tc, mch], ['B', wl.bc, mch]].map(([k, v, min]) => {
                    const val = parseFloat(v) || 0, bad = val > 0.01 && val < min;
                    return <div key={k} style={{ fontSize: 10, color: bad ? '#dc2626' : '#64748b' }}>{k}:<span style={{ fontWeight: 500 }}>{formatInches(val)}</span>{bad && ' ✗'}</div>;
                  })}
                </div>
              )}
              {wl.lc !== '—' && (() => {
                const tmH = parseFloat(wl.trueMinH) || 0, tmV = parseFloat(wl.trueMinV) || 0;
                const tm = Math.min(tmH > 0.005 ? tmH : Infinity, tmV > 0.005 ? tmV : Infinity);
                if (tm < Infinity && tm > 0.005) {
                  const bad = tm < Math.min(mcw, mch);
                  return <div style={{ fontSize: 10, marginTop: 3, color: bad ? '#dc2626' : '#059669', fontWeight: 500 }}>Min piece: {formatInches(tm)} {bad ? '✗' : '✓'}</div>;
                }
                return null;
              })()}
            </div>
          );
        })}
        <div style={{ background: '#ecfdf5', borderRadius: 10, padding: 10, border: '1px solid #a7f3d0', marginTop: 10 }}>
          <div style={{ fontSize: 10, color: '#059669', letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>START POINT</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{formatInches(pro.globalXOff)} X, {formatInches(pro.globalYOff)} Y</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>on {walls[pro.mi]?.name}</div>
        </div>
      </Sc>

      <Sc title="Material List" color="#2563eb">
        {(() => {
          const totalTiles = pro.layouts.reduce((s, l) => s + l.tiles, 0);
          const tileAreaSqIn = tile.w * tile.h;
          const tilesPerBox = Math.max(1, Math.round(1440 / tileAreaSqIn));
          const withWaste = Math.ceil(totalTiles * 1.10);
          const boxes = Math.ceil(withWaste / tilesPerBox);
          const totalSf = sqft(totalArea);
<<<<<<< HEAD
          const rows = [
            ['Tiles needed', `${totalTiles} pcs`], ['+ 10% waste', `${withWaste} pcs`],
            [`Boxes (≈${tilesPerBox}/box)`, `${boxes} boxes`], ['Coverage', `${totalSf} sf`],
=======
          const groutLbs = (totalArea / 144 * 0.8 * (grout / 0.125)).toFixed(1);
          const tileCostTotal = (withWaste * (tile.price || 5)).toFixed(0);
          const rows = [
            ['Tiles needed', `${totalTiles} pcs`], ['+ 10% waste', `${withWaste} pcs`],
            [`Boxes (≈${tilesPerBox}/box)`, `${boxes} boxes`], ['Coverage', `${totalSf} sf`],
            ['Grout estimate', `${groutLbs} lbs`], ['Tile cost', `$${tileCostTotal}`],
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          ];
          return (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, border: '1px solid #e2e8f0' }}>
              {rows.map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: 10, color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{v}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </Sc>

      <Sc title="Spec" color="#94a3b8">
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, border: '1px solid #e2e8f0', fontSize: 10, lineHeight: 2, color: '#64748b' }}>
          <div><span style={{ color: '#94a3b8' }}>Tile:</span> <span style={{ color: '#1e293b' }}>{tile.name} ({toFraction(tile.w)}×{toFraction(tile.h)}")</span></div>
          <div><span style={{ color: '#94a3b8' }}>Pattern:</span> <span style={{ color: '#1e293b' }}>{PATTERNS.find(p => p.id === pat)?.name}</span></div>
          <div><span style={{ color: '#94a3b8' }}>Grout:</span> <span style={{ color: '#1e293b' }}>{formatInches(grout)} {GROUT_COLORS.find(g => g.id === groutColorId)?.name}</span></div>
          <div><span style={{ color: '#94a3b8' }}>Min cut:</span> <span style={{ color: '#1e293b' }}>{formatInches(mcw)} sides / {formatInches(mch)} T/B</span></div>
        </div>
      </Sc>

      <Sc title="Actions" color="#2563eb">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => {
            const patName = PATTERNS.find(p => p.id === pat)?.name || pat;
            const groutName = GROUT_COLORS.find(g => g.id === groutColorId)?.name || '';
            const totalTiles = pro.layouts.reduce((s, l) => s + l.tiles, 0);
            const withWaste = Math.ceil(totalTiles * 1.10);
            let txt = `TILEVISION PRO — INSTALLER REPORT\n${'═'.repeat(40)}\n\n`;
            txt += `Tile: ${tile.name} (${toFraction(tile.w)}×${toFraction(tile.h)}")\n`;
            txt += `Pattern: ${patName}\nGrout: ${formatInches(grout)} ${groutName}\n`;
            txt += `Min cut: ${formatInches(mcw)} sides / ${formatInches(mch)} T/B\n`;
<<<<<<< HEAD
            txt += `Connection: ${wallConnection === 'continuous' ? 'Continuous Pattern' : 'Independent Walls'}\n`;
            txt += `Score: ${pro.avgScore}/100 ${pro.allMeet ? '✓' : '⚠'}\n\n`;
            txt += `MATERIALS\n${'─'.repeat(30)}\nTiles: ${totalTiles} pcs (+10% = ${withWaste})\n`;
            txt += `Coverage: ${sqft(totalArea)} sf\n\n`;
=======
            txt += `Score: ${pro.avgScore}/100 ${pro.allMeet ? '✓' : '⚠'}\n\n`;
            txt += `MATERIALS\n${'─'.repeat(30)}\nTiles: ${totalTiles} pcs (+10% = ${withWaste})\n`;
            txt += `Coverage: ${sqft(totalArea)} sf\nCost: $${(withWaste * (tile.price || 5)).toFixed(0)}\n\n`;
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
            txt += `START POINT\n${'─'.repeat(30)}\n${formatInches(pro.globalXOff)} X, ${formatInches(pro.globalYOff)} Y on ${walls[pro.mi]?.name}\n\n`;
            txt += `WALLS\n${'─'.repeat(30)}\n`;
            walls.forEach((w, i) => {
              const wl = pro.layouts[i]; const a = wallArea(w);
              txt += `${w.name}${i === pro.mi ? ' ★' : ''}: ${toFraction(w.w)}×${toFraction(w.h)}" (${sqft(a)} sf) — ${wl.tiles}t, ${wl.waste}% waste`;
              if (wl.lc !== '—') txt += ` | L:${formatInches(parseFloat(wl.lc)||0)} R:${formatInches(parseFloat(wl.rc)||0)} T:${formatInches(parseFloat(wl.tc)||0)} B:${formatInches(parseFloat(wl.bc)||0)}`;
              txt += '\n';
            });
            txt += `\n${pro.notes.join('\n')}\n`;
            navigator.clipboard?.writeText(txt).then(() => {
              const btn = document.activeElement;
              if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = orig, 1500); }
            });
          }} style={{ ...S.b, background: '#1e293b' }}>Copy Report to Clipboard</button>
<<<<<<< HEAD
          
          <button onClick={exportPNG} style={{ ...S.b, background: '#2563eb', color: '#fff' }}>Export Layout as PNG</button>

          <button onClick={export3D} style={{ ...S.b, background: '#475569', color: '#fff' }}>Export 3D View as PNG</button>

          <button onClick={() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return;
            const win = window.open('', '_blank');
            win.document.write('<html><head><title>TileVision Layout</title><style>body{margin:20px;font-family:sans-serif}h1{font-size:16px;color:#1e293b}p{font-size:11px;color:#64748b;margin:4px 0}img{max-width:100%;border:1px solid #e2e8f0;border-radius:8px;margin:12px 0}</style></head><body>');
            win.document.write('<h1>TileVision — Layout Plan</h1>');
            win.document.write('<p>Pattern: ' + (PATTERNS.find(p => p.id === pat)?.name) + ' · Tile: ' + tile.name + ' (' + toFraction(tile.w) + '×' + toFraction(tile.h) + '")</p>');
            win.document.write('<p>Score: ' + pro.avgScore + '/100 ' + (pro.allMeet ? '✓' : '⚠') + ' · Total: ' + pro.layouts.reduce((s, l) => s + l.tiles, 0) + ' tiles · ' + sqft(totalArea) + ' sf</p>');
            win.document.write('<img src="' + canvas.toDataURL('image/png') + '" />');
            win.document.write('</body></html>');
            win.document.close();
            setTimeout(() => { win.print(); }, 500);
          }} style={{ ...S.b, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', boxShadow: 'none' }}>Print Layout</button>
=======
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

          <button onClick={() => {
            const proj = { version: 1, walls, feats, tile: { id: tile.id, name: tile.name, w: tile.w, h: tile.h, color: tile.color, accent: tile.accent, type: tile.type, price: tile.price }, pat, grout, groutColorId, mcw, mch, wrap, viewMode, autoSolve, zoom };
            const blob = new Blob([JSON.stringify(proj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `tilevision-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
          }} style={{ ...S.b, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>Save Project (.json)</button>

          <label style={{ ...S.b, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,.04)', textAlign: 'center', cursor: 'pointer', display: 'block' }}>
            Load Project (.json)
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                try {
                  const proj = JSON.parse(ev.target.result);
                  if (proj.walls) setWalls(proj.walls);
                  if (proj.feats) setFeats(proj.feats);
                  if (proj.tile) { const found = CATALOG.find(t => t.id === proj.tile.id); setTile(found || { ...CATALOG[0], ...proj.tile }); }
                  if (proj.pat) setPat(proj.pat);
                  if (proj.grout != null) setGrout(proj.grout);
                  if (proj.groutColorId) setGroutColorId(proj.groutColorId);
                  if (proj.mcw != null) setMcw(proj.mcw);
                  if (proj.mch != null) setMch(proj.mch);
                  if (proj.wrap != null) setWrap(proj.wrap);
                  if (proj.viewMode) setViewMode(proj.viewMode);
                  if (proj.autoSolve != null) setAutoSolve(proj.autoSolve);
                  if (proj.zoom) setZoom(proj.zoom);
                  setAw(0); setStep(0); setManXOff(null); setManYOff(null);
                } catch (err) { console.error('Load failed:', err); }
              };
              reader.readAsText(file); e.target.value = '';
            }} />
          </label>
        </div>
      </Sc>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => setStep(2)} style={{ ...S.b, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', boxShadow: 'none' }}>← Back to Layout</button>
      </div>
    </>
  );
}
