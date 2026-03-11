import React from 'react';
import { Sc } from '../../components/ui/Sc.jsx';
import { Pill } from '../../components/ui/Pill.jsx';
import { CutBadge } from '../../components/ui/CutBadge.jsx';
import { PATTERNS } from '../../domain/patterns.js';
import { formatInches, nOr } from '../../solver/utils.js';

export default function LayoutStep({
  walls, aw, setAw, pat, setPat, wrap, setWrap,
  mcw, setMcw, mch, setMch,
  autoSolve, setAutoSolve, manXOff, setManXOff, manYOff, setManYOff,
  zoom, setZoom, pro, ranked, rankSnapshot, clearOffsets, setStep,
  usePerWallPat, setUsePerWallPat, wallPatterns, setWallPattern,
  usePerWallMinCut, setUsePerWallMinCut, getWallMinCut, setWallMinCut, wallMinCuts,
  S, Sp
}) {
  return (
    <>
      <Sc title="Pattern">
        {walls.length > 1 && (
          <div style={S.s}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              <button onClick={() => setWrap(true)} style={{ ...Sp(wrap), flex: 1, textAlign: 'center', fontSize: 11 }}>All Walls</button>
              <button onClick={() => setWrap(false)} style={{ ...Sp(!wrap), flex: 1, textAlign: 'center', fontSize: 11 }}>Single</button>
            </div>
            {!wrap && (
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {walls.map((w, i) => <button key={i} onClick={() => setAw(i)} style={{ ...Sp(aw === i), fontSize: 10, padding: '4px 8px' }}>{w.name}{i === pro.mi ? ' ★' : ''}</button>)}
              </div>
            )}
          </div>
        )}

        {walls.length > 1 && (
          <div style={{ ...S.s, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
              <button onClick={() => setUsePerWallPat(false)} style={{ ...Sp(!usePerWallPat), flex: 1, textAlign: 'center', fontSize: 10 }}>Same Pattern</button>
              <button onClick={() => setUsePerWallPat(true)} style={{ ...Sp(usePerWallPat), flex: 1, textAlign: 'center', fontSize: 10 }}>Per Surface</button>
            </div>
            {usePerWallPat && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 8, border: '1px solid #e2e8f0' }}>
                {walls.map((w, i) => {
                  const wp = wallPatterns?.[i] || pat;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#64748b', width: 60, fontWeight: 500 }}>{w.name}</span>
                      <select value={wp} onChange={e => setWallPattern(i, e.target.value)}
                        style={{ flex: 1, fontSize: 10, padding: '4px 6px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontFamily: 'inherit', outline: 'none' }}>
                        {PATTERNS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={S.s}>
          <label style={S.l}>Best Fit {rankSnapshot ? '' : '(enter Layout tab to rank)'}</label>
          {ranked.slice(0, 3).map((l, i) => {
            const p2 = PATTERNS.find(p => p.id === l.pat);
            return (
              <button key={l.pat} onClick={() => { setPat(l.pat); clearOffsets(); setAutoSolve(true); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: 10, borderRadius: 10, marginBottom: 4, background: pat === l.pat ? '#f0f4ff' : '#fff', border: `1px solid ${pat === l.pat ? '#bfdbfe' : '#e5e7eb'}`, boxShadow: pat === l.pat ? '0 0 0 1px rgba(59,130,246,.1)' : '0 1px 2px rgba(0,0,0,.03)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: pat === l.pat ? '#0f172a' : '#475569' }}>{p2?.icon} {p2?.name}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {l.allMeet && <span style={{ fontSize: 9, color: '#059669', fontWeight: 600, background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>✓</span>}
                    <Pill s={l.avgScore} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 10 }}><span>{l.tiles}t</span><span>{l.waste}%</span><span>{l.boxes}bx</span></div>
                {i === 0 && <div style={{ fontSize: 9, color: '#059669', letterSpacing: 1.5, fontWeight: 600, marginTop: 3 }}>★ BEST</div>}
              </button>
            );
          })}
        </div>
        <div style={S.s}>
          <label style={S.l}>All ({PATTERNS.length})</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {PATTERNS.map(p => (
              <button key={p.id} onClick={() => { setPat(p.id); clearOffsets(); setAutoSolve(true); }} style={{ ...Sp(pat === p.id), textAlign: 'left', padding: '6px 8px', fontSize: 10 }}>
                <span style={{ opacity: 0.3, marginRight: 4 }}>{p.icon}</span>{p.name}
              </button>
            ))}
          </div>
        </div>
      </Sc>

      <Sc title="Min Cut" color="#f87171">
        <label style={S.l}>Sides: {formatInches(mcw)}</label>
        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
          {[{ v: 0.5, l: '1/2"' }, { v: 1, l: '1"' }, { v: 2, l: '2"' }, { v: 3, l: '3"' }].map(x => (
            <button key={x.v} onClick={() => { setMcw(x.v); setMch(x.v); setManXOff(null); setManYOff(null); }} style={{ ...Sp(mcw === x.v && mch === x.v), flex: 1, textAlign: 'center', fontSize: 9, padding: '3px 4px' }}>{x.l}</button>
          ))}
        </div>
        <input type="range" min={0} max={8} step={0.25} value={mcw} onChange={e => { setMcw(nOr(e.target.value, 2)); setManXOff(null); }} style={{ width: '100%' }} />
        <label style={{ ...S.l, marginTop: 6 }}>Top/Btm: {formatInches(mch)}</label>
        <input type="range" min={0} max={8} step={0.25} value={mch} onChange={e => { setMch(nOr(e.target.value, 2)); setManYOff(null); }} style={{ width: '100%' }} />
        <div style={{ fontSize: 10, color: pro.allMeet ? '#059669' : '#dc2626', marginTop: 6, fontWeight: 500 }}>{pro.allMeet ? '✓ All edges pass' : '⚠ Slivers detected'}</div>

        {walls.length > 1 && (
          <div style={{ marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
              <button onClick={() => setUsePerWallMinCut(false)} style={{ ...Sp(!usePerWallMinCut), flex: 1, textAlign: 'center', fontSize: 9 }}>Same</button>
              <button onClick={() => setUsePerWallMinCut(true)} style={{ ...Sp(usePerWallMinCut), flex: 1, textAlign: 'center', fontSize: 9 }}>Per Surface</button>
            </div>
            {usePerWallMinCut && (
              <div style={{ background: '#f8fafc', borderRadius: 6, padding: 6, border: '1px solid #e2e8f0' }}>
                {walls.map((w, i) => {
                  const wmc = wallMinCuts?.[i] || {};
                  const wmcw = wmc.mcw ?? mcw, wmch = wmc.mch ?? mch;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3, fontSize: 9 }}>
                      <span style={{ width: 50, color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: 8 }}>S:</span>
                      <input type="number" value={wmcw} step={0.25} min={0} max={8}
                        onChange={e => setWallMinCut(i, nOr(e.target.value, mcw), wmch)}
                        style={{ width: 36, fontSize: 9, padding: '2px 3px', borderRadius: 3, border: '1px solid #e2e8f0', fontFamily: 'inherit', outline: 'none', textAlign: 'center' }} />
                      <span style={{ color: '#94a3b8', fontSize: 8 }}>T:</span>
                      <input type="number" value={wmch} step={0.25} min={0} max={8}
                        onChange={e => setWallMinCut(i, wmcw, nOr(e.target.value, mch))}
                        style={{ width: 36, fontSize: 9, padding: '2px 3px', borderRadius: 3, border: '1px solid #e2e8f0', fontFamily: 'inherit', outline: 'none', textAlign: 'center' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Sc>

      <Sc title="Offset" color="#a78bfa">
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button onClick={() => { setAutoSolve(true); clearOffsets(); }} style={{ ...Sp(autoSolve), flex: 1, textAlign: 'center', fontSize: 11 }}>Auto</button>
          <button onClick={() => { setAutoSolve(false); setManXOff(pro.globalXOff); setManYOff(pro.globalYOff); }} style={{ ...Sp(!autoSolve), flex: 1, textAlign: 'center', fontSize: 11 }}>Manual</button>
        </div>
        <div style={{ fontSize: 10, color: '#64748b' }}>{formatInches(pro.globalXOff)} X · {formatInches(pro.globalYOff)} Y</div>
        {!autoSolve && <>
          <label style={{ ...S.l, marginTop: 6 }}>X: {formatInches(manXOff || 0)}</label>
          <input type="range" min={0} max={pro.cellW || 24} step={1 / 32} value={manXOff || 0} onChange={e => setManXOff(nOr(e.target.value, 0))} style={{ width: '100%' }} />
          <label style={{ ...S.l, marginTop: 4 }}>Y: {formatInches(manYOff || 0)}</label>
          <input type="range" min={0} max={pro.cellH || 12} step={1 / 32} value={manYOff || 0} onChange={e => setManYOff(nOr(e.target.value, 0))} style={{ width: '100%' }} />
        </>}
      </Sc>

      <Sc title="Cut Inspector" color="#fbbf24">
        {walls.map((w, i) => {
          const lo = pro.layouts[i]; const hasC = lo.lc === '—';
          const wmc = (usePerWallMinCut && getWallMinCut) ? getWallMinCut(i, mcw, mch) : { mcw, mch };
          const surfMcw = wmc.mcw, surfMch = wmc.mch;
          const tmH = parseFloat(lo.trueMinH) || 0, tmV = parseFloat(lo.trueMinV) || 0;
          const trueMin = Math.min(tmH > 0.005 ? tmH : Infinity, tmV > 0.005 ? tmV : Infinity);
          const hasTrueMin = trueMin < Infinity && trueMin > 0.005;
          const tmBad = hasTrueMin && trueMin < Math.min(surfMcw, surfMch);
          return (
            <div key={i} style={{ marginBottom: 8, padding: 8, borderRadius: 10, background: i === pro.mi ? '#f0f4ff' : '#fff', border: `1px solid ${i === pro.mi ? '#bfdbfe' : '#e5e7eb'}`, transition: 'all .2s' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: i === pro.mi ? '#2563eb' : '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>{w.name}{i === pro.mi ? ' ★' : ''} <Pill s={lo.score} /></div>
              {!hasC ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <CutBadge label="L" val={lo.lc} min={surfMcw} /><CutBadge label="R" val={lo.rc} min={surfMcw} />
                    <CutBadge label="T" val={lo.tc} min={surfMch} /><CutBadge label="B" val={lo.bc} min={surfMch} />
                  </div>
                  {hasTrueMin && (
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '4px 8px', background: tmBad ? '#fef2f2' : '#ecfdf5', border: `1px solid ${tmBad ? '#fecaca' : '#a7f3d0'}`, borderRadius: 6 }}>
                      <span style={{ color: tmBad ? '#dc2626' : '#059669', fontWeight: 600, fontSize: 9 }}>MIN</span>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>{formatInches(trueMin)}</span>
                      {tmBad && <span style={{ color: '#dc2626', fontSize: 9, fontWeight: 600 }}>✗ sliver</span>}
                      {!tmBad && <span style={{ color: '#059669', fontSize: 9 }}>✓</span>}
                    </div>
                  )}
                </>
              ) : <div style={{ fontSize: 10, color: '#94a3b8', padding: '3px 0' }}>Complex — {lo.tiles}t, {lo.waste}% waste</div>}
            </div>
          );
        })}
      </Sc>

      <Sc title="Zoom" color="#a78bfa">
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.15))} style={{ ...Sp(false), flex: 1, textAlign: 'center', fontSize: 12 }}>+</button>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))} style={{ ...Sp(false), flex: 1, textAlign: 'center', fontSize: 12 }}>−</button>
          <button onClick={() => setZoom(1)} style={{ ...Sp(false), flex: 1, textAlign: 'center', fontSize: 11 }}>{Math.round(zoom * 100)}%</button>
        </div>
      </Sc>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => setStep(1)} style={{ ...S.b, flex: 0.5, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', boxShadow: 'none' }}>← Back</button>
        <button onClick={() => setStep(3)} style={{ ...S.b, flex: 1, background: '#059669', color: '#fff', border: 'none' }}>Export →</button>
      </div>
    </>
  );
}
