import React from 'react';
import { Sc } from '../../components/ui/Sc.jsx';
import { PATTERNS } from '../../domain/patterns.js';
import { GROUT_COLORS } from '../../domain/grout.js';
import { formatInches, sqft, toFraction } from '../../solver/utils.js';

export default function ExportStep({
  walls, feats, tile, pat, grout, groutColorId, mcw, mch, wrap, viewMode, autoSolve, zoom,
  totalArea, pro, wallConnection,
  exportPNG, export3D,
  setWalls, setFeats, setTile, setPat, setGrout, setGroutColorId,
  setMcw, setMch, setWrap, setViewMode, setAutoSolve, setZoom, setAw,
  setStep, setManXOff, setManYOff, S
}) {
  const totT = pro.layouts.reduce((s, l) => s + l.tiles, 0);
  const totBoxes = pro.layouts.reduce((s, l) => s + l.boxes, 0);
  const gcName = GROUT_COLORS.find(g => g.id === groutColorId)?.name || groutColorId;
  const patName = PATTERNS.find(p => p.id === pat)?.name || pat;
  const connMode = wallConnection || 'independent';

  const copyReport = () => {
    let txt = `TileVision Pro — Layout Report\n`;
    txt += `═══════════════════════════════\n\n`;
    txt += `Tile: ${tile.name} (${toFraction(tile.w)}×${toFraction(tile.h)}")\n`;
    txt += `Pattern: ${patName}\n`;
    txt += `Grout: ${formatInches(grout)} ${gcName}\n`;
    txt += `Min cut: ${formatInches(mcw)} sides, ${formatInches(mch)} top/btm\n`;
    txt += `Connection: ${connMode}\n`;
    txt += `Score: ${pro.avgScore}/100 ${pro.allMeet ? '✓ No slivers' : '⚠ Slivers'}\n`;
    txt += `Offset: ${formatInches(pro.globalXOff)} X, ${formatInches(pro.globalYOff)} Y\n\n`;
    txt += `Surfaces (${walls.length}):\n`;
    walls.forEach((w, i) => {
      const lo = pro.layouts[i];
      txt += `  ${w.name}: ${toFraction(w.w)}×${toFraction(w.h)}" — ${lo.tiles}t, ${lo.waste}% waste, score ${lo.score}\n`;
      txt += `    Cuts: L${formatInches(lo.lc)} R${formatInches(lo.rc)} T${formatInches(lo.tc)} B${formatInches(lo.bc)}\n`;
    });
    txt += `\nTotal: ${totT} tiles, ${totBoxes} boxes\n`;
    txt += `Coverage: ${sqft(totalArea)} sf\n`;
    navigator.clipboard?.writeText(txt).then(() => alert('Report copied!')).catch(() => {});
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Sc title="Spec Summary">
        <div style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #e5e7eb', fontSize: 11, lineHeight: 1.8 }}>
          <div><span style={{ color: '#94a3b8' }}>Tile:</span> {tile.name} ({toFraction(tile.w)}×{toFraction(tile.h)}")</div>
          <div><span style={{ color: '#94a3b8' }}>Pattern:</span> {patName}</div>
          <div><span style={{ color: '#94a3b8' }}>Grout:</span> {formatInches(grout)} {gcName}</div>
          <div><span style={{ color: '#94a3b8' }}>Min cut:</span> {formatInches(mcw)} sides · {formatInches(mch)} top/btm</div>
          <div><span style={{ color: '#94a3b8' }}>Connection:</span> {connMode}</div>
          <div><span style={{ color: '#94a3b8' }}>Score:</span> <span style={{ color: pro.avgScore >= 80 ? '#059669' : '#d97706', fontWeight: 600 }}>{pro.avgScore}/100</span> {pro.allMeet ? '✓' : '⚠'}</div>
          <div><span style={{ color: '#94a3b8' }}>Offset:</span> {formatInches(pro.globalXOff)} X · {formatInches(pro.globalYOff)} Y</div>
        </div>
      </Sc>

      <Sc title="Materials" color="#059669">
        <div style={{ background: '#ecfdf5', borderRadius: 10, padding: 12, border: '1px solid #a7f3d0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: '#059669', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Total Tiles</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#065f46' }}>{totT}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#059669', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Boxes</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#065f46' }}>{totBoxes}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#059669', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Coverage</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#065f46' }}>{sqft(totalArea)} sf</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#059669', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Surfaces</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#065f46' }}>{walls.length}</div>
            </div>
          </div>
        </div>
      </Sc>

      <Sc title="Per Surface" color="#2563eb">
        {walls.map((w, i) => {
          const lo = pro.layouts[i];
          return (
            <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 8, border: '1px solid #e5e7eb', marginBottom: 4, fontSize: 10 }}>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{w.name}</div>
              <div style={{ color: '#64748b' }}>
                {lo.tiles}t · {lo.boxes}bx · {lo.waste}% waste · score {lo.score}
              </div>
            </div>
          );
        })}
      </Sc>

      <Sc title="Actions" color="#6366f1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={copyReport} style={{ ...S.b, background: '#1e293b' }}>Copy Report to Clipboard</button>
          {exportPNG && <button onClick={exportPNG} style={{ ...S.b, background: '#2563eb' }}>Export 2D PNG</button>}
          {export3D && <button onClick={export3D} style={{ ...S.b, background: '#7c3aed' }}>Export 3D PNG</button>}
          <button onClick={handlePrint} style={{ ...S.b, background: '#64748b' }}>Print Layout</button>
        </div>
      </Sc>

      <Sc title="Save / Load" color="#d97706">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => {
            const data = JSON.stringify({ walls, feats, tile: { ...tile, img: undefined }, pat, grout, groutColorId, mcw, mch, wrap, viewMode, autoSolve, zoom }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'tilevision-project.json'; a.click();
            URL.revokeObjectURL(url);
          }} style={{ ...S.b, background: '#f59e0b', color: '#1e293b' }}>Save Project</button>
          <label style={{ ...S.b, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', boxShadow: 'none', textAlign: 'center', cursor: 'pointer', display: 'block' }}>
            Load Project
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                try {
                  const d = JSON.parse(ev.target.result);
                  if (d.walls) setWalls(d.walls);
                  if (d.feats) setFeats(d.feats);
                  if (d.tile) setTile(d.tile);
                  if (d.pat) setPat(d.pat);
                  if (d.grout !== undefined) setGrout(d.grout);
                  if (d.groutColorId) setGroutColorId(d.groutColorId);
                  if (d.mcw !== undefined) setMcw(d.mcw);
                  if (d.mch !== undefined) setMch(d.mch);
                  if (d.wrap !== undefined) setWrap(d.wrap);
                  if (d.viewMode) setViewMode(d.viewMode);
                  if (d.autoSolve !== undefined) setAutoSolve(d.autoSolve);
                  if (d.zoom) setZoom(d.zoom);
                  setAw(0); setManXOff(null); setManYOff(null);
                } catch (err) { alert('Invalid project file'); }
              };
              reader.readAsText(file);
              e.target.value = '';
            }} />
          </label>
        </div>
      </Sc>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => setStep(2)} style={{ ...S.b, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', boxShadow: 'none' }}>← Back</button>
      </div>
    </>
  );
}
