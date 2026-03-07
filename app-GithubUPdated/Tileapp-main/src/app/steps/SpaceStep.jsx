import React from 'react';
import { Sc } from '../../components/ui/Sc.jsx';
import { FracInp } from '../../components/ui/FracInp.jsx';
import { WALLPRESETS } from '../../domain/walls.js';
import { FEAT_TYPES, SNAPS } from '../../domain/features.js';
import { sqft, wallArea, posOr } from '../../solver/utils.js';

export default function SpaceStep({
  walls, aw, setAw, cw, sp, wf, totalArea, wallType, setWallType, viewMode, setViewMode, pro,
  updWall, toggleCustom, rotateWall, applyShape, duplicateWall, addWall, deleteWall, moveWall,
  updWallPt, addWallPt, remWallPt,
  feats, addFeat, remFeat, updFeat, snapF,
<<<<<<< HEAD
  setStep, wallVisible, toggleWallVisible, isWallVisible,
  wallConnection, setWallConnection, wrap, setWrap, S, Sp
=======
  setStep, S, Sp
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
}) {
  return (
    <>
      <Sc title="Space">
        <div style={S.s}>
          <label style={S.l}>Preset</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {WALLPRESETS.map(ws => (
              <button key={ws.id} onClick={() => setWallType(ws.id)} style={{ ...Sp(wallType === ws.id), textAlign: 'left', padding: '8px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{ws.name}</div>
                <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{ws.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={S.s}>
          <label style={S.l}>3D Orientation</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setViewMode('inside')} style={{ ...Sp(viewMode === 'inside'), flex: 1, textAlign: 'center', padding: '8px 6px' }}>
              <div style={{ fontSize: 12, marginBottom: 3 }}>↙</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Inside</div>
              <div style={{ fontSize: 9, opacity: 0.4, marginTop: 1 }}>Shower / Tub</div>
            </button>
            <button onClick={() => setViewMode('outside')} style={{ ...Sp(viewMode === 'outside'), flex: 1, textAlign: 'center', padding: '8px 6px' }}>
              <div style={{ fontSize: 12, marginBottom: 3 }}>↗</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Outside</div>
              <div style={{ fontSize: 9, opacity: 0.4, marginTop: 1 }}>Exterior / Accent</div>
            </button>
          </div>
        </div>
<<<<<<< HEAD
        
        {walls.length > 1 && (
        <Sc title="Wall Connection" color="#6366f1">
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setWallConnection('independent')} style={{ ...Sp(wallConnection === 'independent'), flex: 1, textAlign: 'center', padding: '7px 6px' }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Independent</div>
              <div style={{ fontSize: 9, opacity: 0.4, marginTop: 1 }}>Each wall separate</div>
            </button>
            <button onClick={() => setWallConnection('continuous')} style={{ ...Sp(wallConnection === 'continuous'), flex: 1, textAlign: 'center', padding: '7px 6px' }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Continuous</div>
              <div style={{ fontSize: 9, opacity: 0.4, marginTop: 1 }}>Pattern flows around</div>
            </button>
          </div>
          {wallConnection === 'continuous' && (
            <div style={{ fontSize: 10, color: '#6366f1', marginTop: 6, padding: '6px 8px', background: '#eef2ff', borderRadius: 6, border: '1px solid #c7d2fe' }}>
              Tile pattern will flow continuously around corners.
            </div>
          )}
        </Sc>
      )}
        <div style={S.s}>
          <label style={S.l}>Walls</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {walls.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button onClick={() => setAw(i)} style={{ ...Sp(aw === i), fontSize: 11, padding: '5px 10px', opacity: isWallVisible(i) ? 1 : 0.4 }}>
                  {w.name}{i === pro.mi ? ' ★' : ''}
                </button>
                <button onClick={() => toggleWallVisible(i)} style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid #e5e7eb', background: isWallVisible(i) ? '#ecfdf5' : '#f1f5f9', color: isWallVisible(i) ? '#059669' : '#94a3b8', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isWallVisible(i) ? 'Hide' : 'Show'}>
                  {isWallVisible(i) ? '◉' : '◯'}
                </button>
              </div>
            ))}
            <button onClick={addWall} style={{ ...Sp(false), fontSize: 11, padding: '5px 10px', border: '1px dashed #d1d5db' }}>+</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
            <button onClick={() => {
              setWalls(p => [...p, { name: 'Floor', w: walls[1]?.w || 60, h: walls[0]?.w || 36 }]);
              setAw(walls.length);
              if (walls.length === 1) setWrap(true);
            }} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }}>+ Floor</button>
            <button onClick={() => {
              setWalls(p => [...p, { name: 'Ceiling', w: walls[1]?.w || 60, h: walls[0]?.w || 36 }]);
              setAw(walls.length);
              if (walls.length === 1) setWrap(true);
            }} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }}>+ Ceiling</button>
          </div>
=======
        <div style={S.s}>
          <label style={S.l}>Walls</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {walls.map((w, i) => <button key={i} onClick={() => setAw(i)} style={{ ...Sp(aw === i), fontSize: 11, padding: '6px 10px' }}>{w.name}{i === pro.mi ? ' ★' : ''}</button>)}
            <button onClick={addWall} style={{ ...Sp(false), fontSize: 11, padding: '6px 10px', border: '1px dashed rgba(255,255,255,.12)' }}>+ Add</button>
          </div>
        </div>
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input value={cw.name} onChange={e => updWall(aw, 'name', e.target.value || `Wall ${aw + 1}`)} title="Edit Wall Name"
                style={{ background: '#f0f4ff', border: '1px solid #bfdbfe', color: '#1e40af', fontFamily: 'inherit', fontWeight: 600, fontSize: 12, width: 90, outline: 'none', padding: '4px 8px', borderRadius: 6, transition: 'all .2s' }} />
              <button onClick={() => moveWall(-1)} disabled={aw === 0} style={{...Sp(false), padding: '4px 6px', fontSize: 10}} title="Move Left">◀</button>
              <button onClick={() => moveWall(1)} disabled={aw === walls.length - 1} style={{...Sp(false), padding: '4px 6px', fontSize: 10}} title="Move Right">▶</button>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={duplicateWall} style={{ fontSize: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} title="Duplicate Wall">⧉ Dup</button>
              {walls.length > 1 && <button onClick={deleteWall} style={{ fontSize: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>✕ Del</button>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <button onClick={() => toggleCustom(aw)} style={{ flex: 1, fontSize: 10, background: cw.isCustom ? '#eff6ff' : '#f8fafc', border: `1px solid ${cw.isCustom ? '#bfdbfe' : '#e5e7eb'}`, color: cw.isCustom ? '#2563eb' : '#64748b', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all .2s' }}>{cw.isCustom ? '▣ Custom Shape' : '▢ Edit Shape'}</button>
          </div>
          {cw.isCustom && (
            <div style={{ display: 'flex', gap: 3, marginBottom: 8, flexWrap: 'wrap' }}>
              <button onClick={() => rotateWall(aw, 'cw90')} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }} title="Rotate 90° CW">↻ 90°</button>
              <button onClick={() => rotateWall(aw, 'ccw90')} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }} title="Rotate 90° CCW">↺ 90°</button>
              <button onClick={() => rotateWall(aw, 'rot180')} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }} title="Rotate 180°">⟳ 180°</button>
              <button onClick={() => rotateWall(aw, 'flipH')} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }} title="Flip Horizontal">⇔ H</button>
              <button onClick={() => rotateWall(aw, 'flipV')} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }} title="Flip Vertical">⇕ V</button>
            </div>
          )}
          {cw.isCustom ? (
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <label style={{ ...S.l, marginBottom: 6 }}>Quick Shapes</label>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
                {[['arch','⌒ Arch'],['triangle','△ Triangle'],['trapezoid','⏢ Trapezoid'],['lshape','⌐ L-Shape'],['hexagon','⬡ Hexagon'],['diamond','◇ Diamond']].map(([id, label]) => (
                  <button key={id} onClick={() => applyShape(aw, id)} style={{ ...Sp(false), fontSize: 10, padding: '4px 8px' }}>{label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ ...S.l, marginBottom: 0 }}>Polygon Points</label>
                <button onClick={() => addWallPt(aw)} style={{ fontSize: 10, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Point</button>
              </div>
              {cw.points?.map((pt, pi) => (
                <div key={pi} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', width: 16, textAlign: 'right' }}>{pi + 1}.</span>
                  <div style={{ flex: 1 }}><FracInp val={pt[0]} onChg={v => updWallPt(aw, pi, 0, v)} style={{ ...S.i, fontSize: 11, padding: '4px 6px' }} /></div>
                  <div style={{ flex: 1 }}><FracInp val={pt[1]} onChg={v => updWallPt(aw, pi, 1, v)} style={{ ...S.i, fontSize: 11, padding: '4px 6px' }} /></div>
                  <button onClick={() => remWallPt(aw, pi)} style={{ fontSize: 10, width: 20, color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 6 }}>Drag orange nodes on canvas · Use rotate/flip above</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div><label style={S.l}>Width"</label><FracInp val={cw.w} onChg={v => updWall(aw, 'w', v)} min={1} style={S.i} /></div>
              <div><label style={S.l}>Height"</label><FracInp val={cw.h} onChg={v => updWall(aw, 'h', v)} min={1} style={S.i} /></div>
            </div>
          )}
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>{sqft(wallArea(cw))} sf · Total: {sqft(totalArea)} sf</div>
        </div>
      </Sc>

      <Sc title="Features / Cutouts" color="#fbbf24">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {FEAT_TYPES.map(ft => <button key={ft.id} onClick={() => addFeat(ft.id)} style={{ ...Sp(false), fontSize: 10, padding: '5px 10px' }}>{ft.icon} {ft.name}</button>)}
        </div>
        {wf.map((f, i) => {
          const ft = FEAT_TYPES.find(t => t.id === f.type);
          return (
            <div key={`${f.type}-${f.iNum}-${i}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 8, marginBottom: 6, boxShadow: '0 1px 2px rgba(0,0,0,.03)', transition: 'all .2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{ft?.icon} {f.name}</span>
                <button onClick={() => remFeat(i)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
                {SNAPS.map(s => <button key={s} onClick={() => snapF(i, s)} style={{ padding: '3px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 9, fontFamily: 'inherit', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', transition: 'all .15s' }}>{s}</button>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: f.radius !== undefined ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 4 }}>
                <div><div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>X</div><FracInp val={f.x} onChg={v => updFeat(i, 'x', v)} style={{ ...S.i, padding: '4px 6px', fontSize: 11 }} /></div>
                <div><div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>Y</div><FracInp val={f.y} onChg={v => updFeat(i, 'y', v)} style={{ ...S.i, padding: '4px 6px', fontSize: 11 }} /></div>
                {f.radius === undefined && <>
                  <div><div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>W</div><FracInp val={f.w} onChg={v => updFeat(i, 'w', v)} min={0.5} style={{ ...S.i, padding: '4px 6px', fontSize: 11 }} /></div>
                  <div><div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>H</div><FracInp val={f.h} onChg={v => updFeat(i, 'h', v)} min={0.5} style={{ ...S.i, padding: '4px 6px', fontSize: 11 }} /></div>
                </>}
                {f.radius !== undefined && <div><div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>R"</div><FracInp val={f.radius} onChg={v => updFeat(i, 'radius', v)} min={0.25} style={{ ...S.i, padding: '4px 6px', fontSize: 11 }} /></div>}
              </div>
            </div>
          );
        })}
      </Sc>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => setStep(1)} style={S.b}>Next → Tile</button>
      </div>
    </>
  );
}
