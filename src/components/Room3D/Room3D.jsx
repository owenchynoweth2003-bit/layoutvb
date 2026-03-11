import React, { useRef, useEffect } from 'react';
import { clamp } from '../../solver/utils.js';
import { useThreeScene } from './useThreeScene.js';
import { buildWalls } from './buildWalls.js';

export default function Room3D({ walls, feats, wrap, activeWallIdx, tile, pat, grout, groutColor, pro, viewMode, usePerWallPat, getWallPattern, usePerWallTile, getWallTile }) {
  const mountRef = useRef(null);
  const hudRef   = useRef(null);
  const { loaded, groupRef, texCacheRef, rendererRef } = useThreeScene(mountRef, hudRef);

  useEffect(() => {
    if (!loaded || !groupRef.current) return;
    buildWalls(groupRef.current, walls, feats, wrap, activeWallIdx, tile, pat, grout, groutColor, pro, viewMode, texCacheRef, rendererRef, usePerWallPat, getWallPattern, usePerWallTile, getWallTile);
  }, [loaded, walls, wrap, activeWallIdx, feats, tile, pat, grout, groutColor, pro, viewMode, usePerWallPat, getWallPattern, usePerWallTile, getWallTile]);

  useEffect(() => {
    if (!loaded || !groupRef.current) return;
    const orb = window._orbitRef;
    if (!orb) return;
    if (viewMode === 'outside' && wrap) {
      orb.tTheta = Math.PI + 0.4; orb.tPhi = Math.PI / 2 - 0.2;
    } else if (viewMode === 'inside' && wrap) {
      orb.tTheta = 0.3; orb.tPhi = Math.PI / 2 - 0.12;
    } else if (viewMode === 'outside') {
      orb.tTheta = Math.PI; orb.tPhi = Math.PI / 2 - 0.08;
    } else {
      orb.tTheta = 0; orb.tPhi = Math.PI / 2 - 0.08;
    }
    orb.tPanX = 0; orb.tPanY = 0;
    orb.animating = true;
  }, [viewMode, wrap, loaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#f0f3f7', borderRadius: 12, overflow: 'hidden', border: '1px solid #d1d5db', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      {!loaded && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Loading 3D Engine…</div>}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      {loaded && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 120, height: 120 }}>
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <button className="hud-home" onClick={() => window._resetView && window._resetView()} title="Home (Reset View)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </button>
          <div ref={hudRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }} />
        </div>
      )}
      {loaded && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10, display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #d1d5db', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <button onClick={() => window._tvSetViewMode?.('inside')} style={{ padding: '6px 12px', fontSize: 10, fontWeight: 500, fontFamily: 'inherit', letterSpacing: 0.3, cursor: 'pointer', border: 'none', background: viewMode === 'inside' ? '#eff6ff' : 'transparent', color: viewMode === 'inside' ? '#2563eb' : '#94a3b8', transition: 'all .2s' }}>Inside</button>
          <button onClick={() => window._tvSetViewMode?.('outside')} style={{ padding: '6px 12px', fontSize: 10, fontWeight: 500, fontFamily: 'inherit', letterSpacing: 0.3, cursor: 'pointer', border: 'none', borderLeft: '1px solid #e5e7eb', background: viewMode === 'outside' ? '#fefce8' : 'transparent', color: viewMode === 'outside' ? '#a16207' : '#94a3b8', transition: 'all .2s' }}>Outside</button>
        </div>
      )}
      {loaded && (
        <div style={{ position: 'absolute', bottom: 40, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => {
            const orb = window._orbitRef;
            if (orb) { orb.distance = clamp(orb.distance * 0.8, 20, 2000); orb.tDist = orb.distance; orb.needsUpdate = true; }
          }} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #d1d5db', background: 'rgba(255,255,255,.92)', color: '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, backdropFilter: 'blur(8px)', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>+</button>
          <button onClick={() => {
            const orb = window._orbitRef;
            if (orb) { orb.distance = clamp(orb.distance * 1.25, 20, 2000); orb.tDist = orb.distance; orb.needsUpdate = true; }
          }} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #d1d5db', background: 'rgba(255,255,255,.92)', color: '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, backdropFilter: 'blur(8px)', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>−</button>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 9, color: 'rgba(100,116,139,.45)', pointerEvents: 'none', fontWeight: 500, letterSpacing: 0.5 }}>
        Orbit: Drag · Pan: Shift+Drag · Zoom: Scroll
      </div>
    </div>
  );
}
