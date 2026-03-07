import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { posOr, sqft, polyArea, formatInches, drawPill } from '../../solver/utils.js';
import { generateTiles } from '../../solver/generateTiles.js';
import { FEAT_TYPES } from '../../domain/features.js';
import { drawTile } from './drawTile.js';
import { toWallSpace, findDragTarget } from './hitTest.js';

<<<<<<< HEAD
export default function TileCanvas({ walls, aw, tile, grout, groutColor, pat, feats, CW, CH, onDrag, onDragPt, wrap, zoom, showMeas, pro, isWallVisible }) {
=======
export default function TileCanvas({ walls, aw, tile, grout, groutColor, pat, feats, CW, CH, onDrag, onDragPt, wrap, zoom, showMeas, pro }) {
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
  const ref         = useRef(null);
  const dragRef     = useRef(null);
  const rafRef      = useRef(0);
  const renderState = useRef({});

  const sections = useMemo(() => {
    if (!wrap || walls.length <= 1) {
      const w = walls[aw] || walls[0];
      return [{ xTile: 0, w: posOr(w?.w, 1), h: posOr(w?.h, 1), name: w?.name || 'Wall', idx: aw, active: true, isCustom: w?.isCustom, points: w?.points }];
    }
    const s = []; let tx = 0;
    walls.forEach((w, i) => { const ww = posOr(w.w, 1); s.push({ xTile: tx, w: ww, h: posOr(w.h, 1), name: w.name, idx: i, active: i === aw, isCustom: w.isCustom, points: w.points }); tx += ww; });
    return s;
  }, [walls, aw, wrap]);

  const totalTW  = useMemo(() => sections.reduce((s, sec) => s + sec.w, 0), [sections]);
  const maxH     = useMemo(() => Math.max(1, ...sections.map(s => s.h)), [sections]);
  const allTiles = useMemo(() => generateTiles(totalTW, maxH, tile, pat, grout, pro?.globalXOff || 0, pro?.globalYOff || 0), [totalTW, maxH, tile, pat, grout, pro]);

  const render = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
<<<<<<< HEAD
    const displayW = CW;
    const displayH = CH;
    cv.width  = Math.floor(displayW * dpr);
    cv.height = Math.floor(displayH * dpr);
    cv.style.width  = displayW + 'px';
    cv.style.height = displayH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
=======
    cv.width = Math.floor(CW * dpr); cv.height = Math.floor(CH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(0.5, 0.5); // <--- ADD THIS LINE FOR CRISP LINES
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d

    const pad = 72, VGAP = wrap && walls.length > 1 ? 10 : 0, tgp = VGAP * Math.max(0, sections.length - 1);
    const baseSc = Math.min((CW - pad * 2 - tgp) / Math.max(1, totalTW), (CH - pad * 2) / maxH);
    const sc  = baseSc * zoom;
    const ox0 = (CW - totalTW * sc - tgp) / 2;
    const oy0 = (CH - maxH * sc) / 2;

    renderState.current = { sc, ox: ox0, oy: oy0, sections, gap: VGAP, maxH };

    const bg = ctx.createRadialGradient(CW / 2, CH / 2, 0, CW / 2, CH / 2, CW * 0.7);
    bg.addColorStop(0, '#f1f5f9'); bg.addColorStop(1, '#e8ecf1');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = 'rgba(0,0,0,.04)';
    for (let x = 0; x < CW; x += 20) for (let y = 0; y < CH; y += 20) { ctx.beginPath(); ctx.arc(x, y, 0.4, 0, Math.PI * 2); ctx.fill(); }

    ctx.save(); ctx.translate(ox0, oy0);
    const gs = Math.max(0.4, grout * sc * 0.45), gcol = groutColor || '#c8ccd2';

    let dxAcc = 0;
    sections.forEach((sec, si) => {
<<<<<<< HEAD
      const visible = !isWallVisible || isWallVisible(sec.idx);
=======
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      const sw2 = sec.w * sc, sh2 = sec.h * sc;
      const secFeats = feats.filter(f => f.wi === sec.idx);
      const minX = sec.isCustom && sec.points?.length > 2 ? Math.min(...sec.points.map(p => p[0])) : 0;
      const maxX = sec.isCustom && sec.points?.length > 2 ? Math.max(...sec.points.map(p => p[0])) : sec.w;
      const minY = sec.isCustom && sec.points?.length > 2 ? Math.min(...sec.points.map(p => p[1])) : 0;
      const maxY = sec.isCustom && sec.points?.length > 2 ? Math.max(...sec.points.map(p => p[1])) : sec.h;
      const yOffset = (maxH - sec.h) * sc;

      ctx.save(); ctx.translate(dxAcc, yOffset);

      ctx.beginPath();
      if (sec.isCustom && sec.points?.length > 2) {
        ctx.moveTo(sec.points[0][0] * sc, sec.points[0][1] * sc);
        for (let i = 1; i < sec.points.length; i++) ctx.lineTo(sec.points[i][0] * sc, sec.points[i][1] * sc);
        ctx.closePath();
      } else {
        ctx.rect(0, 0, sw2, sh2);
      }
      secFeats.forEach(f => { const ft = FEAT_TYPES.find(t => t.id === f.type); if (ft?.isHole) ctx.rect(f.x * sc, f.y * sc, f.w * sc, f.h * sc); });

<<<<<<< HEAD
      ctx.save(); 
      ctx.clip('evenodd');

      if (!visible) {
        ctx.fillStyle = '#f1f5f9';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(minX * sc - 2, minY * sc - 2, (maxX - minX) * sc + 4, (maxY - minY) * sc + 4);
        ctx.globalAlpha = 1;
        ctx.restore();
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
        dxAcc += sw2 + (wrap ? VGAP : 0);
        return;
      }
=======
      ctx.save(); ctx.clip('evenodd');
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      ctx.fillStyle = gcol; ctx.globalAlpha = 0.85; ctx.fillRect(minX * sc, minY * sc, (maxX - minX) * sc, (maxY - minY) * sc);
      ctx.fillStyle = sec.active ? '#dde4ed' : '#d0d7e2'; ctx.globalAlpha = 0.3; ctx.fillRect(minX * sc, minY * sc, (maxX - minX) * sc, (maxY - minY) * sc);
      ctx.globalAlpha = 1;

      ctx.save(); ctx.translate(-sec.xTile * sc, -yOffset);
      for (const t of allTiles) drawTile(ctx, t, tile, gs, sec.xTile * sc, (sec.xTile + sec.w) * sc, yOffset, yOffset + sh2, sc);
      ctx.restore();

      // Draw RECTANGULAR wall measurements INSIDE clip
      const lo = pro?.layouts?.[sec.idx]; const mcwV = pro?.mcw ?? 2, mchV = pro?.mch ?? 2;
      const isCustSec = sec.isCustom && sec.points?.length > 2;
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
<<<<<<< HEAD
          ctx.font = '600 10px "SF Mono", "Consolas", monospace';
=======
          ctx.font = '600 10px Inter, system-ui, sans-serif';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          const tw = ctx.measureText(txt).width;
          const sw = ctx.measureText(sym).width;
          const gap = 3;
          const totalW = tw + gap + sw + 10;
          const ph = 18, pr = 5;
          let px = align === 'left' ? cx - totalW - 2 : align === 'right' ? cx + 2 : cx - totalW / 2;
          let py = cy - ph / 2;
<<<<<<< HEAD
          ctx.fillStyle = ok ? 'rgba(255,255,255,0.92)' : 'rgba(254,242,242,0.95)';
          ctx.strokeStyle = ok ? 'rgba(0,0,0,0.08)' : 'rgba(220,38,38,0.25)';
=======
          ctx.fillStyle = ok ? 'rgba(239,246,255,.92)' : 'rgba(254,242,242,.92)';
          ctx.strokeStyle = ok ? 'rgba(147,197,253,.45)' : 'rgba(252,165,165,.45)';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          ctx.lineWidth = 0.8;
          drawPill(ctx, px, py, totalW, ph, pr); ctx.fill(); ctx.stroke();
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillStyle = ok ? '#1e40af' : '#b91c1c';
          ctx.fillText(txt, px + 5, cy);
<<<<<<< HEAD
          ctx.font = '700 9px "SF Mono", "Consolas", monospace';
=======
          ctx.font = '700 9px Inter, system-ui, sans-serif';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          ctx.fillStyle = ok ? '#059669' : '#dc2626';
          ctx.fillText(sym, px + 5 + tw + gap, cy);
          ctx.textBaseline = 'alphabetic';
        };

        if (!isCustSec) {
<<<<<<< HEAD
          if (lc > 0.01) edgeLabel(lc, mcwV, 0, sh2 * 0.3, 'left');
          if (rc > 0.01) edgeLabel(rc, mcwV, sw2, sh2 * 0.55, 'right');
          if (tc > 0.01) edgeLabel(tc, mchV, sw2 * 0.3, -2, 'center');
=======
          if (lc > 0.01) edgeLabel(lc, mcwV, 0, sh2 * 0.25, 'left'); // Staggered Y position
          if (rc > 0.01) edgeLabel(rc, mcwV, sw2, sh2 * 0.40, 'right'); // Staggered Y position
          if (tc > 0.01) edgeLabel(tc, mchV, sw2 / 2, -2, 'center');
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          if (bc > 0.01) edgeLabel(bc, mchV, sw2 / 2, sh2 + 2, 'center');
        } else {
          const bbL = minX * sc, bbR = maxX * sc, bbT = minY * sc, bbB = maxY * sc;
          if (lc > 0.01) edgeLabel(lc, mcwV, bbL, (bbT + bbB) / 2, 'left');
          if (rc > 0.01) edgeLabel(rc, mcwV, bbR, (bbT + bbB) / 2, 'right');
          if (tc > 0.01) edgeLabel(tc, mchV, (bbL + bbR) / 2, bbT - 2, 'center');
          if (bc > 0.01) edgeLabel(bc, mchV, (bbL + bbR) / 2, bbB + 2, 'center');
        }

<<<<<<< HEAD
        // Dimension leader lines
      if (showMeas && !isCustSec) {
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 0.5;
        // Width leader
        ctx.beginPath();
        ctx.moveTo(0, -16); ctx.lineTo(sw2, -16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -19); ctx.lineTo(0, -13);
        ctx.moveTo(sw2, -19); ctx.lineTo(sw2, -13);
        ctx.stroke();
        // Height leader
        ctx.beginPath();
        ctx.moveTo(-14, 0); ctx.lineTo(-14, sh2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-17, 0); ctx.lineTo(-11, 0);
        ctx.moveTo(-17, sh2); ctx.lineTo(-11, sh2);
        ctx.stroke();
      }

        if (hasTrueMin && trueMin < Math.min(mcwV, mchV)) {
          const mtxt = `Min ${formatInches(trueMin)} ✗`;
          ctx.font = '600 9px "SF Mono", "Consolas", monospace';
=======
        if (hasTrueMin && trueMin < Math.min(mcwV, mchV)) {
          const mtxt = `Min ${formatInches(trueMin)} ✗`;
          ctx.font = '600 9px Inter, system-ui, sans-serif';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          const mtw = ctx.measureText(mtxt).width;
          const mx2 = sw2 + 4, my2 = 4;
          ctx.fillStyle = 'rgba(254,242,242,.92)';
          ctx.strokeStyle = 'rgba(252,165,165,.4)'; ctx.lineWidth = 0.8;
          drawPill(ctx, mx2, my2, mtw + 10, 16, 4); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#b91c1c'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(mtxt, mx2 + 5, my2 + 8);
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
      if (sec.isCustom && sec.points?.length > 2) {
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
      if (sec.active && sec.isCustom && sec.points) {
        sec.points.forEach((pt, pi) => {
          ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(pt[0] * sc, pt[1] * sc, 5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
<<<<<<< HEAD
          ctx.fillStyle = '#1e40af'; ctx.font = '700 9px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'left';
=======
          ctx.fillStyle = '#1e40af'; ctx.font = '700 9px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          ctx.fillText(pi + 1, pt[0] * sc + 7, pt[1] * sc - 5);
        });
      }

      // Dimension labels
      if (showMeas) {
        if (!sec.isCustom || sec.points?.length > 2) {
<<<<<<< HEAD
          ctx.font = '600 9px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
=======
          ctx.font = '600 9px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
          const wTxt = formatInches(sec.w), wTw = ctx.measureText(wTxt).width;
          ctx.fillStyle = 'rgba(255,255,255,.82)'; drawPill(ctx, sw2/2 - wTw/2 - 4, -28, wTw + 8, 14, 4); ctx.fill();
          ctx.fillStyle = '#334155'; ctx.fillText(wTxt, sw2/2, -21);
          ctx.save(); ctx.translate(-24, sh2/2); ctx.rotate(-Math.PI/2);
          const hTxt = formatInches(sec.h), hTw = ctx.measureText(hTxt).width;
          ctx.fillStyle = 'rgba(255,255,255,.82)'; drawPill(ctx, -hTw/2 - 4, -7, hTw + 8, 14, 4); ctx.fill();
          ctx.fillStyle = '#334155'; ctx.fillText(hTxt, 0, 0);
          ctx.restore();
          ctx.textBaseline = 'alphabetic';
        }
      }

      // Wall name label
      {
        const nm = sec.name;
        const secArea = sec.isCustom && sec.points?.length >= 3 ? polyArea(sec.points) : sec.w * sec.h;
        const areaStr = `${sqft(secArea)} sf`;
<<<<<<< HEAD
        ctx.font = '600 9px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
=======
        ctx.font = '600 9px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
        const nmW = ctx.measureText(`${nm}  ${areaStr}`).width;
        const pillW2 = nmW + 12, pillH2 = 16, pillY2 = sh2 + 22;
        ctx.fillStyle = sec.active ? 'rgba(239,246,255,.88)' : 'rgba(255,255,255,.82)';
        ctx.strokeStyle = sec.active ? 'rgba(147,197,253,.3)' : 'rgba(203,213,225,.3)'; ctx.lineWidth = 0.6;
        drawPill(ctx, sw2/2 - pillW2/2, pillY2, pillW2, pillH2, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = sec.active ? '#1e40af' : '#475569';
<<<<<<< HEAD
        ctx.font = '600 9px "SF Mono", "Consolas", monospace';
        const nmMeas = ctx.measureText(nm).width;
        ctx.font = '500 8px "SF Mono", "Consolas", monospace';
        const areaMeas = ctx.measureText(areaStr).width;
        const totalLabelW = nmMeas + 6 + areaMeas;
        ctx.font = '600 9px "SF Mono", "Consolas", monospace';
        ctx.fillText(nm, sw2/2 - totalLabelW/2 + nmMeas/2, pillY2 + pillH2/2);
        ctx.fillStyle = '#94a3b8'; ctx.font = '500 8px "SF Mono", "Consolas", monospace';
=======
        ctx.font = '600 9px Inter, system-ui, sans-serif';
        const nmMeas = ctx.measureText(nm).width;
        ctx.font = '500 8px Inter, system-ui, sans-serif';
        const areaMeas = ctx.measureText(areaStr).width;
        const totalLabelW = nmMeas + 6 + areaMeas;
        ctx.font = '600 9px Inter, system-ui, sans-serif';
        ctx.fillText(nm, sw2/2 - totalLabelW/2 + nmMeas/2, pillY2 + pillH2/2);
        ctx.fillStyle = '#94a3b8'; ctx.font = '500 8px Inter, system-ui, sans-serif';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
        ctx.fillText(areaStr, sw2/2 + totalLabelW/2 - areaMeas/2, pillY2 + pillH2/2);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();

      // Wrap separator
      if (si > 0 && wrap) {
        ctx.save(); ctx.strokeStyle = 'rgba(5,150,105,.2)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(dxAcc - VGAP / 2, yOffset); ctx.lineTo(dxAcc - VGAP / 2, yOffset + sec.h * sc); ctx.stroke(); ctx.setLineDash([]);
<<<<<<< HEAD
        ctx.fillStyle = 'rgba(5,150,105,.4)'; ctx.font = '600 7px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'center';
=======
        ctx.fillStyle = 'rgba(5,150,105,.4)'; ctx.font = '600 7px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
        ctx.fillText('⟨', dxAcc - VGAP / 2, yOffset - 3);
        ctx.restore();
      }
      dxAcc += sw2 + (wrap ? VGAP : 0);
    });

    // Draw features
    feats.forEach(f => {
      const sec = sections.find(s => s.idx === f.wi); if (!sec) return;
      let sdx = 0;
      for (let i = 0; i < sections.length; i++) { if (sections[i].idx === f.wi) break; sdx += sections[i].w * sc + (wrap ? VGAP : 0); }
      const ft = FEAT_TYPES.find(t => t.id === f.type); const col = ft?.color || '#00beff';
      const yOff = (maxH - sec.h) * sc;
      const fx = sdx + f.x * sc, fy = yOff + f.y * sc, fw = f.w * sc, fh = f.h * sc;
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
<<<<<<< HEAD
      ctx.font = '500 8px "SF Mono", "Consolas", monospace'; ctx.textAlign = 'left';
=======
      ctx.font = '500 8px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      const ftLabel = `${ft?.icon || ''} ${f.name}${f.iNum > 1 ? ' #' + f.iNum : ''}`;
      ctx.fillStyle = col; ctx.globalAlpha = 0.7;
      ctx.fillText(ftLabel, fx + 3, fy > 12 ? fy - 4 : fy + 10);
      ctx.globalAlpha = 1;
    });
<<<<<<< HEAD
    // Tile size reference
    if (showMeas) {
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
        ctx.font = '500 8px "SF Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';
        ctx.fillText(tile.w + '\u00D7' + tile.h + '"', rx + Math.min(refW, 50) / 2, ry + Math.min(refH, 30) + 10);
        ctx.globalAlpha = 1;
      }
    }
=======
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    ctx.restore();
  }, [CW, CH, allTiles, walls.length, wrap, sections, totalTW, maxH, tile, grout, groutColor, feats, zoom, showMeas, pro]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const onDown = useCallback(e => {
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
  }, [feats, sections, maxH, CW, CH, wrap]);

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
<<<<<<< HEAD
      style={{ width: CW, height: CH, display: 'block', borderRadius: 12, cursor: 'crosshair', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', background: '#f8f9fb' }} />
=======
      style={{ width: '100%', height: CH, display: 'block', borderRadius: 10, cursor: 'crosshair', border: '1px solid #d1d5db', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }} />
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
  );
}
