import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { posOr, sqft, polyArea, formatInches, drawPill } from '../../solver/utils.js';
import { generateTiles } from '../../solver/generateTiles.js';
import { FEAT_TYPES } from '../../domain/features.js';
import { drawTile } from './drawTile.js';
import { toWallSpace, findDragTarget } from './hitTest.js';

export default function TileCanvas({ walls, aw, tile, grout, groutColor, pat, feats, CW, CH, onDrag, onDragPt, wrap, zoom, showMeas, pro, isWallVisible, usePerWallPat, getWallPattern, drawMode, drawPoints, setDrawPoints, finishDraw, usePerWallTile, getWallTile }) {
  const ref         = useRef(null);
  const dragRef     = useRef(null);
  const rafRef      = useRef(0);
  const renderState = useRef({});

  // Classify surfaces into rows: ceiling (top), walls (middle), floor (bottom)
  const classifyName = (n) => { const l = (n || '').toLowerCase(); if (l.includes('ceiling') || l.includes('ceil')) return 'ceiling'; if (l.includes('floor')) return 'floor'; return 'wall'; };

  const { sections, totalTW, maxH, tileGenH, rowLayout } = useMemo(() => {
    if (!wrap || walls.length <= 1) {
      const w = walls[aw] || walls[0];
      const h = posOr(w?.h, 1);
      const secs = [{ xTile: 0, w: posOr(w?.w, 1), h, name: w?.name || 'Wall', idx: aw, active: true, isCustom: w?.isCustom, points: w?.points, row: 'wall', rowX: 0, rowY: 0 }];
      return { sections: secs, totalTW: secs[0].w, maxH: h, tileGenH: h, rowLayout: null };
    }
    // Split into rows
    const ceilings = [], wallsArr = [], floors = [];
    walls.forEach((w, i) => {
      const role = classifyName(w.name);
      const entry = { w: posOr(w.w, 1), h: posOr(w.h, 1), name: w.name, idx: i, active: i === aw, isCustom: w.isCustom, points: w.points, row: role };
      if (role === 'ceiling') ceilings.push(entry);
      else if (role === 'floor') floors.push(entry);
      else wallsArr.push(entry);
    });

    // Compute xTile offset per row (each row's tiles are consecutive in the solver)
    const ordered = [...wallsArr, ...floors, ...ceilings]; // solver order stays walls-first
    let tx = 0;
    ordered.forEach(s => { s.xTile = tx; tx += s.w; });

    // Layout rows: compute each row's total width and max height
    const wallsTotalW = wallsArr.reduce((s, sec) => s + sec.w, 0) || 1;
    const floorTotalW = floors.reduce((s, sec) => s + sec.w, 0);
    const ceilTotalW = ceilings.reduce((s, sec) => s + sec.w, 0);
    const wallMaxH = Math.max(1, ...wallsArr.map(s => s.h));
    const floorMaxH = floors.length ? Math.max(...floors.map(s => s.h)) : 0;
    const ceilMaxH = ceilings.length ? Math.max(...ceilings.map(s => s.h)) : 0;

    // Compute row Y positions: ceiling at top, walls in middle, floor at bottom
    const GAP = 16; // gap between rows
    let curRowY = 0;
    const ceilRowY = ceilings.length ? curRowY : 0;
    if (ceilings.length) curRowY += ceilMaxH + GAP;
    const wallRowY = curRowY;
    curRowY += wallMaxH;
    if (floors.length) curRowY += GAP;
    const floorRowY = floors.length ? curRowY : 0;
    if (floors.length) curRowY += floorMaxH;

    // Assign rowX (horizontal position within row) and rowY
    let wx = 0; wallsArr.forEach(s => { s.rowX = wx; s.rowY = wallRowY; wx += s.w; });
    // Center floors under walls
    let fx = Math.max(0, (wallsTotalW - floorTotalW) / 2);
    floors.forEach(s => { s.rowX = fx; s.rowY = floorRowY; fx += s.w; });
    // Center ceilings above walls
    let cx = Math.max(0, (wallsTotalW - ceilTotalW) / 2);
    ceilings.forEach(s => { s.rowX = cx; s.rowY = ceilRowY; cx += s.w; });

    const allSections = [...ceilings, ...wallsArr, ...floors];
    const ttw = tx;
    const mh = curRowY;
    const tileGenH = Math.max(1, ...allSections.map(s => s.h)); // tallest single surface for tile generation

    return { sections: allSections, totalTW: ttw, maxH: mh, tileGenH, rowLayout: { wallsTotalW, wallRowY, wallMaxH, floorRowY, floorMaxH, ceilRowY, ceilMaxH, ceilTotalW, floorTotalW } };
  }, [walls, aw, wrap]);
  const allTiles = useMemo(() => generateTiles(totalTW, maxH, tile, pat, grout, pro?.globalXOff || 0, pro?.globalYOff || 0), [totalTW, maxH, tile, pat, grout, pro]);

  // Per-section tile generation: handles per-wall pattern AND per-wall tile (different sizes)
  const perSectionTilesMap = useMemo(() => {
    if ((!usePerWallPat && !usePerWallTile) || (!getWallPattern && !getWallTile)) return null;
    const map = {};
    sections.forEach(sec => {
      const secPat = (usePerWallPat && getWallPattern) ? getWallPattern(sec.idx, pat) : pat;
      const secTile = (usePerWallTile && getWallTile) ? getWallTile(sec.idx, tile) : tile;
      const key = `${secTile.id}-${secTile.w}x${secTile.h}-${secPat}`;
      if (!map[key]) {
        map[key] = { tiles: generateTiles(totalTW, maxH, secTile, secPat, grout, pro?.globalXOff || 0, pro?.globalYOff || 0), tile: secTile };
      }
      // Store which key each section uses
      map[`sec-${sec.idx}`] = key;
    });
    return map;
  }, [usePerWallPat, usePerWallTile, getWallPattern, getWallTile, sections, totalTW, maxH, tile, pat, grout, pro]);

  // Helper: get tiles and tile object for a section
  const getSectionData = useCallback((sec) => {
    if (perSectionTilesMap) {
      const key = perSectionTilesMap[`sec-${sec.idx}`];
      if (key && perSectionTilesMap[key]) {
        return perSectionTilesMap[key];
      }
    }
    const secTile = (usePerWallTile && getWallTile) ? getWallTile(sec.idx, tile) : tile;
    return { tiles: allTiles, tile: secTile };
  }, [perSectionTilesMap, usePerWallTile, getWallTile, allTiles, tile]);

  const render = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const displayW = CW;
    const displayH = CH;
    cv.width  = Math.floor(displayW * dpr);
    cv.height = Math.floor(displayH * dpr);
    cv.style.width  = displayW + 'px';
    cv.style.height = displayH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const pad = 72, VGAP = wrap && walls.length > 1 ? 8 : 0;
    // Use widest row width for scale, not total of all sections
    const layoutW = rowLayout ? Math.max(rowLayout.wallsTotalW, rowLayout.floorTotalW, rowLayout.ceilTotalW) : totalTW;
    const wallCount = sections.filter(s => s.row === 'wall').length;
    const wallGaps = VGAP * Math.max(0, wallCount - 1);
    const baseSc = Math.min((CW - pad * 2 - wallGaps) / Math.max(1, layoutW), (CH - pad * 2) / Math.max(1, maxH));
    const sc  = baseSc * zoom;
    const ox0 = (CW - layoutW * sc - wallGaps) / 2;
    const oy0 = (CH - maxH * sc) / 2;

    renderState.current = { sc, ox: ox0, oy: oy0, sections, gap: VGAP, maxH };

    const bg = ctx.createRadialGradient(CW / 2, CH / 2, 0, CW / 2, CH / 2, CW * 0.7);
    bg.addColorStop(0, '#f1f5f9'); bg.addColorStop(1, '#e8ecf1');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = 'rgba(0,0,0,.04)';
    for (let x = 0; x < CW; x += 20) for (let y = 0; y < CH; y += 20) { ctx.beginPath(); ctx.arc(x, y, 0.4, 0, Math.PI * 2); ctx.fill(); }

    ctx.save(); ctx.translate(ox0, oy0);
    const gs = Math.max(0.4, grout * sc * 0.45), gcol = groutColor || '#c8ccd2';

    // Track wall row positions for separators
    const wallSections = sections.filter(s => s.row === 'wall');
    let wallDxAcc = 0;

    sections.forEach((sec, si) => {
      const isCustSec = sec.isCustom && sec.points?.length > 2;
      const visible = !isWallVisible || isWallVisible(sec.idx);
      const sw2 = sec.w * sc, sh2 = sec.h * sc;
      const secFeats = feats.filter(f => f.wi === sec.idx);
      const minX = isCustSec ? Math.min(...sec.points.map(p => p[0])) : 0;
      const maxX = isCustSec ? Math.max(...sec.points.map(p => p[0])) : sec.w;
      const minY = isCustSec ? Math.min(...sec.points.map(p => p[1])) : 0;
      const maxY = isCustSec ? Math.max(...sec.points.map(p => p[1])) : sec.h;

      // Use row-based positioning if available
      let secX, secY;
      if (rowLayout && sec.rowX !== undefined) {
        // Add VGAP between wall sections
        const wallIdx = wallSections.indexOf(sec);
        const gapOffset = sec.row === 'wall' && wallIdx > 0 ? wallIdx * VGAP : 0;
        secX = sec.rowX * sc + gapOffset;
        secY = sec.rowY * sc;
      } else {
        secX = wallDxAcc;
        secY = (maxH - sec.h) * sc;
        wallDxAcc += sw2 + VGAP;
      }

      ctx.save(); ctx.translate(secX, secY);

      ctx.beginPath();
      if (isCustSec) {
        ctx.moveTo(sec.points[0][0] * sc, sec.points[0][1] * sc);
        for (let i = 1; i < sec.points.length; i++) ctx.lineTo(sec.points[i][0] * sc, sec.points[i][1] * sc);
        ctx.closePath();
      } else {
        ctx.rect(0, 0, sw2, sh2);
      }
      secFeats.forEach(f => { const ft = FEAT_TYPES.find(t => t.id === f.type); if (ft?.isHole) ctx.rect(f.x * sc, f.y * sc, f.w * sc, f.h * sc); });

      ctx.save();
      ctx.clip('evenodd');

      // Ghost outline for hidden walls
      if (!visible) {
        ctx.fillStyle = '#f1f5f9';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(minX * sc - 2, minY * sc - 2, (maxX - minX) * sc + 4, (maxY - minY) * sc + 4);
        ctx.globalAlpha = 1;
        ctx.restore(); // restore clip

        ctx.beginPath();
        if (isCustSec) { ctx.moveTo(sec.points[0][0] * sc, sec.points[0][1] * sc); for (let i = 1; i < sec.points.length; i++) ctx.lineTo(sec.points[i][0] * sc, sec.points[i][1] * sc); ctx.closePath(); }
        else { ctx.rect(0, 0, sw2, sh2); }
        ctx.strokeStyle = 'rgba(148,163,184,0.15)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.3;
        ctx.font = '500 9px -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(sec.name + ' (hidden)', sw2 / 2, sh2 / 2);
        ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
        ctx.restore();
        return;
      }

      ctx.fillStyle = gcol; ctx.globalAlpha = 0.85; ctx.fillRect(minX * sc, minY * sc, (maxX - minX) * sc, (maxY - minY) * sc);
      ctx.fillStyle = sec.active ? '#dde4ed' : '#d0d7e2'; ctx.globalAlpha = 0.3; ctx.fillRect(minX * sc, minY * sc, (maxX - minX) * sc, (maxY - minY) * sc);
      ctx.globalAlpha = 1;

      ctx.save(); const tileYOff = (tileGenH - sec.h) * sc; ctx.translate(-sec.xTile * sc, -tileYOff);
      const secData = getSectionData(sec);
      for (const t of secData.tiles) drawTile(ctx, t, secData.tile, gs, sec.xTile * sc, (sec.xTile + sec.w) * sc, tileYOff, tileYOff + sh2, sc);
      ctx.restore();

      // Draw RECTANGULAR wall measurements INSIDE clip
      const lo = pro?.layouts?.[sec.idx]; const mcwV = pro?.mcw ?? 2, mchV = pro?.mch ?? 2;
      if (lo && showMeas && !isCustSec) {
        const lc = parseFloat(lo.lc) || 0, rc = parseFloat(lo.rc) || 0;
        const tc = parseFloat(lo.tc) || 0, bc = parseFloat(lo.bc) || 0;
        const drawCutV = (x, w, val, min, side) => {
          if (val < 0.01) return;
          const ok = val >= min;
          ctx.fillStyle = ok ? 'rgba(37,99,235,.08)' : 'rgba(220,38,38,.08)'; ctx.fillRect(x, minY * sc, w, (maxY - minY) * sc);
          const lineX = side === 'L' ? x + w : x;
          ctx.strokeStyle = ok ? 'rgba(37,99,235,.35)' : 'rgba(220,38,38,.4)'; ctx.lineWidth = 1;
          ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(lineX, minY * sc); ctx.lineTo(lineX, maxY * sc); ctx.stroke(); ctx.setLineDash([]);
        };
        const drawCutH = (y, h, val, min, side) => {
          if (val < 0.01) return;
          const ok = val >= min;
          ctx.fillStyle = ok ? 'rgba(37,99,235,.08)' : 'rgba(220,38,38,.08)'; ctx.fillRect(minX * sc, y, (maxX - minX) * sc, h);
          const lineY = side === 'T' ? y + h : y;
          ctx.strokeStyle = ok ? 'rgba(37,99,235,.35)' : 'rgba(220,38,38,.4)'; ctx.lineWidth = 1;
          ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(minX * sc, lineY); ctx.lineTo(maxX * sc, lineY); ctx.stroke(); ctx.setLineDash([]);
        };
        drawCutV(minX * sc, lc * sc, lc, mcwV, 'L');
        drawCutV(maxX * sc - rc * sc, rc * sc, rc, mcwV, 'R');
        drawCutH(minY * sc, tc * sc, tc, mchV, 'T');
        drawCutH(maxY * sc - bc * sc, bc * sc, bc, mchV, 'B');
      }
      if (lo && showMeas && isCustSec) {
        const lc = parseFloat(lo.lc) || 0, rc = parseFloat(lo.rc) || 0;
        const tc = parseFloat(lo.tc) || 0, bc = parseFloat(lo.bc) || 0;
        if (lc > 0.01) { const ok = lc >= mcwV; ctx.fillStyle = ok ? 'rgba(37,99,235,.1)' : 'rgba(220,38,38,.1)'; ctx.fillRect(minX * sc, minY * sc, lc * sc, (maxY - minY) * sc); }
        if (rc > 0.01) { const ok = rc >= mcwV; ctx.fillStyle = ok ? 'rgba(37,99,235,.1)' : 'rgba(220,38,38,.1)'; ctx.fillRect(maxX * sc - rc * sc, minY * sc, rc * sc, (maxY - minY) * sc); }
        if (tc > 0.01) { const ok = tc >= mchV; ctx.fillStyle = ok ? 'rgba(37,99,235,.1)' : 'rgba(220,38,38,.1)'; ctx.fillRect(minX * sc, minY * sc, (maxX - minX) * sc, tc * sc); }
        if (bc > 0.01) { const ok = bc >= mchV; ctx.fillStyle = ok ? 'rgba(37,99,235,.1)' : 'rgba(220,38,38,.1)'; ctx.fillRect(minX * sc, maxY * sc - bc * sc, (maxX - minX) * sc, bc * sc); }
      }
      ctx.restore(); // END CLIP

      // Edge-anchored cut labels
      if (lo && showMeas) {
        const lc = parseFloat(lo.lc) || 0, rc = parseFloat(lo.rc) || 0;
        const tc = parseFloat(lo.tc) || 0, bc = parseFloat(lo.bc) || 0;
        const tmH = parseFloat(lo.trueMinH) || 0, tmV = parseFloat(lo.trueMinV) || 0;
        const trueMin = Math.min(tmH > 0.005 ? tmH : Infinity, tmV > 0.005 ? tmV : Infinity);
        const hasTrueMin = trueMin < Infinity && trueMin > 0.005;

        const edgeLabel = (val, min, cx, cy, align) => {
          if (val < 0.01) return;
          const ok = val >= min;
          const txt = formatInches(val);
          const sym = ok ? '✓' : '✗';
          // Passing labels: very subtle. Failing labels: prominent.
          const fontSize = ok ? 7 : 8;
          ctx.font = `${ok ? 500 : 700} ${fontSize}px "SF Mono","Consolas",monospace`;
          const tw = ctx.measureText(txt + ' ' + sym).width;
          const totalW = tw + 6;
          const ph = ok ? 12 : 14, pr = 3;
          let px = align === 'left' ? cx - totalW - 3 : align === 'right' ? cx + 3 : cx - totalW / 2;
          let py = cy - ph / 2;
          ctx.fillStyle = ok ? 'rgba(255,255,255,0.7)' : 'rgba(254,242,242,0.92)';
          ctx.strokeStyle = ok ? 'rgba(0,0,0,0.04)' : 'rgba(220,38,38,0.2)';
          ctx.lineWidth = 0.5;
          drawPill(ctx, px, py, totalW, ph, pr); ctx.fill(); ctx.stroke();
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillStyle = ok ? '#64748b' : '#b91c1c';
          ctx.fillText(txt, px + 3, cy);
          ctx.fillStyle = ok ? '#059669' : '#dc2626';
          ctx.fillText(' ' + sym, px + 3 + ctx.measureText(txt).width, cy);
          ctx.textBaseline = 'alphabetic';
        };

        if (!isCustSec) {
          if (lc > 0.01) edgeLabel(lc, mcwV, 0, sh2 * 0.3, 'left');
          if (rc > 0.01) edgeLabel(rc, mcwV, sw2, sh2 * 0.55, 'right');
          if (tc > 0.01) edgeLabel(tc, mchV, sw2 * 0.3, -2, 'center');
          if (bc > 0.01) edgeLabel(bc, mchV, sw2 / 2, sh2 + 2, 'center');
        } else {
          const bbL = minX * sc, bbR = maxX * sc, bbT = minY * sc, bbB = maxY * sc;
          if (lc > 0.01) edgeLabel(lc, mcwV, bbL, (bbT + bbB) / 2, 'left');
          if (rc > 0.01) edgeLabel(rc, mcwV, bbR, (bbT + bbB) / 2, 'right');
          if (tc > 0.01) edgeLabel(tc, mchV, (bbL + bbR) / 2, bbT - 2, 'center');
          if (bc > 0.01) edgeLabel(bc, mchV, (bbL + bbR) / 2, bbB + 2, 'center');
        }

        // Dimension leader lines
        if (showMeas && !isCustSec) {
          ctx.strokeStyle = 'rgba(0,0,0,0.06)';
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(0, -12); ctx.lineTo(sw2, -12);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -15); ctx.lineTo(0, -9);
          ctx.moveTo(sw2, -15); ctx.lineTo(sw2, -9);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-12, 0); ctx.lineTo(-12, sh2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-15, 0); ctx.lineTo(-9, 0);
          ctx.moveTo(-15, sh2); ctx.lineTo(-9, sh2);
          ctx.stroke();
        }

        if (hasTrueMin && trueMin < Math.min(mcwV, mchV)) {
          const mtxt = `Min ${formatInches(trueMin)} ✗`;
          ctx.font = '500 8px "SF Mono", "Consolas", monospace';
          const mtw = ctx.measureText(mtxt).width;
          const mx2 = sw2 + 3, my2 = 3;
          ctx.fillStyle = 'rgba(254,242,242,.88)';
          ctx.strokeStyle = 'rgba(252,165,165,.3)'; ctx.lineWidth = 0.5;
          drawPill(ctx, mx2, my2, mtw + 8, 13, 3); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#b91c1c'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(mtxt, mx2 + 4, my2 + 6.5);
          ctx.textBaseline = 'alphabetic';
        }
      }

      // Custom polygon edge dashes
      if (lo && showMeas && isCustSec) {
        ctx.save();
        const lc2 = parseFloat(lo.lc) || 0, rc2 = parseFloat(lo.rc) || 0;
        const tc2 = parseFloat(lo.tc) || 0, bc2 = parseFloat(lo.bc) || 0;
        const pts = sec.points;
        const cx2 = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        const cy2 = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        for (let ei = 0; ei < pts.length; ei++) {
          const ep1 = pts[ei], ep2 = pts[(ei + 1) % pts.length];
          const edx = ep2[0] - ep1[0], edy = ep2[1] - ep1[1];
          const elen = Math.sqrt(edx * edx + edy * edy);
          if (elen < 1) continue;
          const nx0 = -edy / elen, ny0 = edx / elen;
          const eMidX = (ep1[0] + ep2[0]) / 2, eMidY = (ep1[1] + ep2[1]) / 2;
          const dot = nx0 * (cx2 - eMidX) + ny0 * (cy2 - eMidY);
          const nx = dot >= 0 ? nx0 : -nx0;
          const isL = nx > 0.3, isR = nx < -0.3, isT = ny0 > 0.3, isB = ny0 < -0.3;
          let cutVal = 0, cutMin = mcwV;
          if (isL && lc2 > 0.01) cutVal = lc2;
          else if (isR && rc2 > 0.01) cutVal = rc2;
          else if (isT && tc2 > 0.01) { cutVal = tc2; cutMin = mchV; }
          else if (isB && bc2 > 0.01) { cutVal = bc2; cutMin = mchV; }
          const eOk = cutVal > 0.01 ? cutVal >= cutMin : true;
          ctx.strokeStyle = cutVal > 0.01 ? (eOk ? 'rgba(37,99,235,.4)' : 'rgba(220,38,38,.45)') : 'rgba(148,163,184,.2)';
          ctx.lineWidth = cutVal > 0.01 ? 2 : 0.8; ctx.setLineDash([4, 3]);
          ctx.beginPath(); ctx.moveTo(ep1[0] * sc, ep1[1] * sc); ctx.lineTo(ep2[0] * sc, ep2[1] * sc); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // Wall outline
      ctx.beginPath();
      if (isCustSec) {
        ctx.moveTo(sec.points[0][0] * sc, sec.points[0][1] * sc);
        for (let i = 1; i < sec.points.length; i++) ctx.lineTo(sec.points[i][0] * sc, sec.points[i][1] * sc);
        ctx.closePath();
      } else {
        ctx.rect(0, 0, sw2, sh2);
      }
      if (sec.active) { ctx.shadowColor = 'rgba(37,99,235,.12)'; ctx.shadowBlur = 5; }
      ctx.strokeStyle = sec.active ? 'rgba(37,99,235,.4)' : 'rgba(148,163,184,.2)';
      ctx.lineWidth = sec.active ? 1.5 : 0.8; ctx.stroke(); ctx.shadowBlur = 0;

      // Custom polygon vertex handles
      if (sec.active && isCustSec && sec.points) {
        sec.points.forEach((pt, pi) => {
          ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(pt[0] * sc, pt[1] * sc, 5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#1e40af'; ctx.font = '700 9px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'left';
          ctx.fillText(pi + 1, pt[0] * sc + 7, pt[1] * sc - 5);
        });
      }

      // Dimension labels
      if (showMeas) {
        if (!isCustSec || sec.points?.length > 2) {
          ctx.font = '500 8px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const wTxt = formatInches(sec.w), wTw = ctx.measureText(wTxt).width;
          ctx.fillStyle = 'rgba(255,255,255,.78)'; drawPill(ctx, sw2/2 - wTw/2 - 3, -24, wTw + 6, 12, 3); ctx.fill();
          ctx.fillStyle = '#475569'; ctx.fillText(wTxt, sw2/2, -18);
          ctx.save(); ctx.translate(-20, sh2/2); ctx.rotate(-Math.PI/2);
          const hTxt = formatInches(sec.h), hTw = ctx.measureText(hTxt).width;
          ctx.fillStyle = 'rgba(255,255,255,.78)'; drawPill(ctx, -hTw/2 - 3, -6, hTw + 6, 12, 3); ctx.fill();
          ctx.fillStyle = '#475569'; ctx.fillText(hTxt, 0, 0);
          ctx.restore();
          ctx.textBaseline = 'alphabetic';
        }
      }

      // Wall name label
      {
        const nm = sec.name;
        const secArea = isCustSec ? polyArea(sec.points) : sec.w * sec.h;
        const areaStr = `${sqft(secArea)} sf`;
        ctx.font = '600 8px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const nmW = ctx.measureText(`${nm}  ${areaStr}`).width;
        const pillW2 = nmW + 10, pillH2 = 14, pillY2 = sh2 + 18;
        ctx.fillStyle = sec.active ? 'rgba(239,246,255,.85)' : 'rgba(255,255,255,.78)';
        ctx.strokeStyle = sec.active ? 'rgba(147,197,253,.25)' : 'rgba(203,213,225,.2)'; ctx.lineWidth = 0.5;
        drawPill(ctx, sw2/2 - pillW2/2, pillY2, pillW2, pillH2, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = sec.active ? '#1e40af' : '#475569';
        ctx.font = '600 8px "SF Mono", "Consolas", monospace';
        const nmMeas = ctx.measureText(nm).width;
        ctx.font = '400 7px "SF Mono", "Consolas", monospace';
        const areaMeas = ctx.measureText(areaStr).width;
        const totalLabelW = nmMeas + 5 + areaMeas;
        ctx.font = '600 8px "SF Mono", "Consolas", monospace';
        ctx.fillText(nm, sw2/2 - totalLabelW/2 + nmMeas/2, pillY2 + pillH2/2);
        ctx.fillStyle = '#94a3b8'; ctx.font = '400 7px "SF Mono", "Consolas", monospace';
        ctx.fillText(areaStr, sw2/2 + totalLabelW/2 - areaMeas/2, pillY2 + pillH2/2);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();

      // Wrap separator (between adjacent walls in same row)
      if (wrap && sec.row === 'wall') {
        const wallIdx = wallSections.indexOf(sec);
        if (wallIdx > 0) {
          const sepX = secX - VGAP / 2;
          ctx.save(); ctx.strokeStyle = 'rgba(5,150,105,.15)'; ctx.lineWidth = 0.5; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(sepX, secY); ctx.lineTo(sepX, secY + sh2); ctx.stroke(); ctx.setLineDash([]);
          ctx.restore();
        }
      }
    });

    // Draw features
    feats.forEach(f => {
      const sec = sections.find(s => s.idx === f.wi); if (!sec) return;
      const ft = FEAT_TYPES.find(t => t.id === f.type); const col = ft?.color || '#00beff';
      // Use row position for section
      const wallIdx = sec.row === 'wall' ? sections.filter(s => s.row === 'wall').indexOf(sec) : -1;
      const gapOff = sec.row === 'wall' && wallIdx > 0 ? wallIdx * VGAP : 0;
      const sdx = (sec.rowX !== undefined ? sec.rowX * sc + gapOff : 0);
      const sdy = (sec.rowY !== undefined ? sec.rowY * sc : 0);
      const fx = sdx + f.x * sc, fy = sdy + f.y * sc, fw = f.w * sc, fh = f.h * sc;
      if (ft?.isHole) {
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.strokeRect(fx, fy, fw, fh); ctx.setLineDash([]);
      } else if (f.type === 'valve') {
        const rad = posOr(f.radius, 2) * sc;
        ctx.fillStyle = col + '12'; ctx.beginPath(); ctx.arc(fx + fw / 2, fy + fh / 2, rad, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col + '55'; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(fx + fw / 2, fy + fh / 2, rad, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      } else {
        ctx.fillStyle = col + '0c'; ctx.fillRect(fx, fy, fw, fh);
        ctx.strokeStyle = col + '44'; ctx.lineWidth = 0.8; ctx.setLineDash([4, 3]); ctx.strokeRect(fx, fy, fw, fh); ctx.setLineDash([]);
      }
      ctx.font = '500 8px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'left';
      const ftLabel = `${ft?.icon || ''} ${f.name}${f.iNum > 1 ? ' #' + f.iNum : ''}`;
      ctx.fillStyle = col; ctx.globalAlpha = 0.7;
      ctx.fillText(ftLabel, fx + 3, fy > 12 ? fy - 4 : fy + 10);
      ctx.globalAlpha = 1;
    });

    // Tile size reference box
    if (showMeas && !drawMode) {
      const refW = tile.w * sc * zoom;
      const refH = tile.h * sc * zoom;
      if (refW > 20 && refH > 10) {
        const rx = displayW - ox0 - 60;
        const ry = displayH - oy0 - 40;
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(rx, ry, Math.min(refW, 50), Math.min(refH, 30));
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.4;
        ctx.font = '500 7px "SF Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';
        ctx.fillText(tile.w + '\u00D7' + tile.h + '"', rx + Math.min(refW, 50) / 2, ry + Math.min(refH, 30) + 10);
        ctx.globalAlpha = 1;
      }
    }

    // Draw mode overlay
    if (drawMode && drawPoints && drawPoints.length > 0) {
      ctx.save();
      // Draw grid
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.5;
      const gridStep = 12; // 1 foot grid
      for (let gx = 0; gx < CW; gx += gridStep * sc) { ctx.beginPath(); ctx.moveTo(gx + ox0, 0); ctx.lineTo(gx + ox0, CH); ctx.stroke(); }
      for (let gy = 0; gy < CH; gy += gridStep * sc) { ctx.beginPath(); ctx.moveTo(0, gy + oy0); ctx.lineTo(CW, gy + oy0); ctx.stroke(); }
      ctx.globalAlpha = 1;

      // Draw polygon in progress
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(drawPoints[0][0] * sc + ox0, drawPoints[0][1] * sc + oy0);
      for (let dp = 1; dp < drawPoints.length; dp++) {
        ctx.lineTo(drawPoints[dp][0] * sc + ox0, drawPoints[dp][1] * sc + oy0);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill preview
      if (drawPoints.length >= 3) {
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.moveTo(drawPoints[0][0] * sc + ox0, drawPoints[0][1] * sc + oy0);
        for (let dp = 1; dp < drawPoints.length; dp++) {
          ctx.lineTo(drawPoints[dp][0] * sc + ox0, drawPoints[dp][1] * sc + oy0);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw points
      drawPoints.forEach((pt, pi) => {
        const ppx = pt[0] * sc + ox0, ppy = pt[1] * sc + oy0;
        ctx.fillStyle = pi === 0 ? '#059669' : '#4f46e5';
        ctx.beginPath(); ctx.arc(ppx, ppy, pi === 0 ? 6 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '700 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(pi + 1, ppx, ppy);
        ctx.textBaseline = 'alphabetic';
      });

      // Close hint circle
      if (drawPoints.length >= 3) {
        ctx.strokeStyle = 'rgba(5,150,105,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        const fp = drawPoints[0];
        ctx.beginPath(); ctx.arc(fp[0] * sc + ox0, fp[1] * sc + oy0, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Draw mode info overlay
    if (drawMode) {
      ctx.fillStyle = 'rgba(79,70,229,0.9)';
      ctx.font = '600 11px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click to place points · Click green dot to close', CW / 2, CH - 14);
    }

    ctx.restore();
  }, [CW, CH, allTiles, walls.length, wrap, sections, totalTW, maxH, tileGenH, rowLayout, tile, grout, groutColor, feats, zoom, showMeas, pro, isWallVisible, getSectionData, drawMode, drawPoints, usePerWallTile, getWallTile]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const onDown = useCallback(e => {
    // Draw mode: click adds points
    if (drawMode && setDrawPoints && finishDraw) {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const { sc = 1, ox = 0, oy = 0 } = renderState.current;
      const clientX = (e.clientX - rect.left);
      const clientY = (e.clientY - rect.top);
      let ptX = (clientX - ox) / sc;
      let ptY = (clientY - oy) / sc;

      // Snap to horizontal/vertical when close to previous point
      if (drawPoints && drawPoints.length > 0) {
        const prev = drawPoints[drawPoints.length - 1];
        const snapThresh = 4; // inches
        if (Math.abs(ptX - prev[0]) < snapThresh) ptX = prev[0]; // snap vertical
        if (Math.abs(ptY - prev[1]) < snapThresh) ptY = prev[1]; // snap horizontal
      }
      // Snap to grid (1-inch increments)
      ptX = Math.round(ptX * 4) / 4;
      ptY = Math.round(ptY * 4) / 4;

      // Close shape if clicking near first point
      if (drawPoints && drawPoints.length >= 3) {
        const fp = drawPoints[0];
        const closeDist = Math.sqrt((ptX - fp[0]) ** 2 + (ptY - fp[1]) ** 2);
        if (closeDist < 6) {
          finishDraw(drawPoints);
          return;
        }
      }
      setDrawPoints(p => [...(p || []), [ptX, ptY]]);
      return;
    }

    const { mx, my } = toWallSpace(e, ref, CW, CH, renderState);
    const target = findDragTarget(mx, my, renderState, feats, sections, maxH, wrap);
    if (!target) return;
    if (target.type === 'selectWall') {
      setTimeout(() => {
        const ev = new CustomEvent('tilevision-select-wall', { detail: target.wallIdx });
        window.dispatchEvent(ev);
      }, 0);
      return;
    }
    dragRef.current = target;
  }, [feats, sections, maxH, CW, CH, wrap, drawMode, drawPoints, setDrawPoints, finishDraw]);

  const onMove = useCallback(e => {
    if (!dragRef.current) return;
    const { mx, my } = toWallSpace(e, ref, CW, CH, renderState);
    const { sc = 1 } = renderState.current;
    const d = dragRef.current;
    if (d.type === 'wallPt') { onDragPt(d.wi, d.pi, (mx - d.sdx) / sc, (my - d.sdy) / sc); return; }
    if (d.type === 'feat') {
      const f = feats[d.idx]; if (!f) return;
      const clampVal = (v, a, b) => Math.max(a, Math.min(b, v));
      onDrag(d.idx, clampVal((mx - d.dx - d.sdx) / sc, -100, 1000), clampVal((my - d.dy - d.sdy) / sc, -100, 1000));
    }
  }, [feats, CW, CH, onDrag, onDragPt]);

  const onUp = useCallback(() => { dragRef.current = null; }, []);

  return (
    <canvas ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      style={{ width: CW, height: CH, display: 'block', borderRadius: 12, cursor: drawMode ? 'cell' : 'crosshair', border: drawMode ? '2px solid #4f46e5' : '1px solid #e2e8f0', boxShadow: drawMode ? '0 0 0 3px rgba(79,70,229,.15)' : '0 1px 4px rgba(0,0,0,0.04)', background: '#f8f9fb', transition: 'border .2s, box-shadow .2s' }} />
  );
}
