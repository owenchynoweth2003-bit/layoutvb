// ─── SOLVE PRO ───────────────────────────────────────────────────────────────
// Main solver: computes optimal tile offsets and cut analysis for all walls.

import { posOr, nOr, formatInches } from './utils.js';
import { getWallXProfile, getWallYProfile } from './profiles.js';
import { solveAllX, solveAllY, exactCutsX, exactCutsY, computeCutsFromTiles } from './cuts.js';
import { generateTiles } from './generateTiles.js';

export function solvePro(rawWalls, tile, pat, grout, mcw, mch, manualXOff, manualYOff, feats = [], connectionMode = 'independent') {
  const walls = rawWalls.map(w => ({ ...w, w: posOr(w.w, 1), h: posOr(w.h, 1) }));
  const tW = posOr(tile?.w, 12), tH = posOr(tile?.h, 24), g = Math.max(0, nOr(grout, 0.125));
  const short = Math.min(tW, tH), long_ = Math.max(tW, tH);
  let cellW, cellH, xShifts = [0], yShifts = [0];

  if      (['stacked_h'].includes(pat))                           { cellW = long_ + g;  cellH = short + g; }
  else if (['stacked_v'].includes(pat))                           { cellW = short + g;  cellH = long_  + g; }
  else if (['offset_h'].includes(pat))                            { cellW = long_ + g;  cellH = short + g;  xShifts = [0, (long_ + g) / 2]; }
  else if (['offset_v'].includes(pat))                            { cellW = short + g;  cellH = long_  + g; yShifts = [0, (long_ + g) / 2]; }
  else if (['third_offset'].includes(pat))                        { cellW = long_ + g;  cellH = short + g;  xShifts = [0, (long_ + g) / 3, (long_ + g) * 2 / 3]; }
  else if (['herringbone','crosshatch','parquet'].includes(pat))  { cellW = long_ + g;  cellH = long_ + g; }
  else if (['herringbone_diag','herringbone_str'].includes(pat))  { const s = (long_ + short) * Math.SQRT1_2; cellW = s; cellH = s; }
  else if (['chevron'].includes(pat))                             { cellW = long_ * Math.SQRT1_2 + g; cellH = short * Math.SQRT2; }
  else if (['diagonal'].includes(pat))                            { cellW = cellH = (tW + tH) * Math.SQRT1_2 + g; }
  else if (['pinwheel','versailles'].includes(pat))               { cellW = cellH = long_ + short + g * 2; }
  else if (['corridor'].includes(pat))                            { cellW = long_ + g; cellH = long_ + short + g * 2; }
  else                                                            { cellW = tW + g; cellH = tH + g; }

  const isComplex = ['herringbone','herringbone_diag','herringbone_str','chevron','diagonal',
    'crosshatch','pinwheel','corridor','versailles','parquet'].includes(pat);

  let masterIdx = 0;
  if (connectionMode === 'continuous') {
    let mw = 0;
    walls.forEach((w, i) => { if (w.w > mw) { mw = w.w; masterIdx = i; } });
  } else {
    if (walls.length >= 3) masterIdx = 1;
    else { let mw = 0; walls.forEach((w, i) => { if (w.w > mw) { mw = w.w; masterIdx = i; } }); }
  }

  const cutoutsByWall = i => feats.filter(f => f.wi === i && f.type === 'cutout');
  const profilesX = walls.map((w, i) => getWallXProfile(w, cutoutsByWall(i)));
  const profilesY = walls.map((w, i) => getWallYProfile(w, cutoutsByWall(i)));
  const maxH    = Math.max(1, ...walls.map(w => posOr(w.h, 1)));
  const yStarts = walls.map(w => maxH - posOr(w.h, 1));

  let globalXOff;
  if (manualXOff != null) {
    globalXOff = manualXOff;
  } else {
    globalXOff = solveAllX(walls, profilesX, cellW, cellH, mcw, masterIdx, xShifts, yStarts).globalXOff;
  }

  let globalYOff;
  if (manualYOff != null) {
    globalYOff = manualYOff;
  } else {
    globalYOff = solveAllY(walls, profilesY, cellH, cellW, mch, yShifts, yStarts).globalYOff;
  }

  const starts = []; let acc2 = 0;
  for (const w of walls) { starts.push(acc2); acc2 += w.w; }

  const totalTW = acc2, maxTileDim = Math.max(tW, tH);
  const genTiles = generateTiles(totalTW, maxH, tile, pat, grout, globalXOff, globalYOff);

  const xPW = [], yPW = [];
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const isCust = w.isCustom && w.points?.length > 2;
    const tileCuts = computeCutsFromTiles(genTiles, w, starts[i], yStarts[i], isCust, maxTileDim);

    let profileCuts = null;
    if (!isComplex) {
      const pxCuts = exactCutsX(profilesX[i], cellW, cellH, pat, globalXOff, globalYOff, starts[i], yStarts[i], w);
      const pyCuts = exactCutsY(profilesY[i], cellW, cellH, pat, globalXOff, globalYOff, starts[i], yStarts[i], w);
      profileCuts = { lc: pxCuts.lc, rc: pxCuts.rc, tc: pyCuts.tc, bc: pyCuts.bc,
        minPiece: Math.min(pxCuts.minPiece || Infinity, pyCuts.minPiece || Infinity),
        minPieceY: pxCuts.minPieceY, minPieceSide: pxCuts.minPieceSide };
    }

    const bestLc = Math.min(tileCuts.lc > 0.005 ? tileCuts.lc : Infinity, profileCuts?.lc > 0.005 ? profileCuts.lc : Infinity);
    const bestRc = Math.min(tileCuts.rc > 0.005 ? tileCuts.rc : Infinity, profileCuts?.rc > 0.005 ? profileCuts.rc : Infinity);
    const bestTc = Math.min(tileCuts.tc > 0.005 ? tileCuts.tc : Infinity, profileCuts?.tc > 0.005 ? profileCuts.tc : Infinity);
    const bestBc = Math.min(tileCuts.bc > 0.005 ? tileCuts.bc : Infinity, profileCuts?.bc > 0.005 ? profileCuts.bc : Infinity);

    const lc = bestLc === Infinity ? 0 : bestLc;
    const rc = bestRc === Infinity ? 0 : bestRc;
    const tc = bestTc === Infinity ? 0 : bestTc;
    const bc = bestBc === Infinity ? 0 : bestBc;

    const bestMinPiece = Math.min(tileCuts.minPiece > 0.005 ? tileCuts.minPiece : Infinity, profileCuts?.minPiece > 0.005 ? profileCuts.minPiece : Infinity);
    const minPiece = bestMinPiece === Infinity ? 0 : bestMinPiece;
    const minPieceY = tileCuts.minPiece <= (profileCuts?.minPiece || Infinity) ? tileCuts.minPieceY : (profileCuts?.minPieceY || 0);
    const minPieceSide = tileCuts.minPiece <= (profileCuts?.minPiece || Infinity) ? tileCuts.minPieceSide : (profileCuts?.minPieceSide || '');

    const allVals = [lc, rc, tc, bc, minPiece].filter(v => v > 0.005);
    const trueMin = allVals.length ? Math.min(...allVals) : 0;
    const metX = trueMin < 0.005 || trueMin >= mcw;
    const metY = trueMin < 0.005 || trueMin >= mch;

    const baseOffX = ((globalXOff + starts[i]) % cellW + cellW) % cellW;
    const baseOffY = (globalYOff % cellH + cellH) % cellH;

    xPW.push({ lc, rc, minPiece, minPieceY, minPieceSide, met: (lc < 0.005 || lc >= mcw) && (rc < 0.005 || rc >= mcw) && (minPiece < 0.005 || minPiece >= mcw), fc: Math.floor(Math.max(0, w.w - baseOffX) / cellW) });
    yPW.push({ tc, bc, minPiece, minPieceX: 0, minPieceSide: '', met: (tc < 0.005 || tc >= mch) && (bc < 0.005 || bc >= mch), fc: Math.floor(Math.max(0, w.h - baseOffY) / cellH) });
  }

  const ppb = tW <= 6 ? 20 : tW <= 12 ? 10 : 4;
  const layouts = walls.map((w, i) => {
    const x = xPW[i], y = yPW[i];
    const tC = x.fc + (x.lc > 0.01 ? 1 : 0) + (x.rc > 0.01 ? 1 : 0);
    const tR = y.fc + (y.tc > 0.01 ? 1 : 0) + (y.bc > 0.01 ? 1 : 0);
    const tot = Math.max(1, tC * tR), full = Math.max(0, x.fc * y.fc), cuts = tot - full;
    let wm, need;
    if (isComplex) {
      wm = ['diagonal','herringbone_diag','chevron'].includes(pat) ? 1.18 : ['herringbone','herringbone_str'].includes(pat) ? 1.15 : 1.12;
      need = Math.ceil((w.w * w.h / Math.max(1e-6, tW * tH)) * wm);
    } else {
      wm = 1 + Math.max(5, Math.min(15, (cuts / Math.max(tot, 1)) * 100 + 3)) / 100;
      need = Math.ceil(tot * wm);
    }
    const score = Math.min(100, Math.round(
      (x.met && y.met ? 55 : 25)
      + Math.max(0, 25 - Math.abs(x.lc - x.rc))
      + Math.max(0, 20 - Math.abs(y.tc - y.bc))
    ));
    const xMin = Math.min(x.lc > 0.005 ? x.lc : Infinity, x.rc > 0.005 ? x.rc : Infinity, x.minPiece > 0.005 ? x.minPiece : Infinity);
    const yMin = Math.min(y.tc > 0.005 ? y.tc : Infinity, y.bc > 0.005 ? y.bc : Infinity, y.minPiece > 0.005 ? y.minPiece : Infinity);
    const trueMinH = xMin === Infinity ? 0 : xMin;
    const trueMinV = yMin === Infinity ? 0 : yMin;
    return { tiles: need, waste: ((wm - 1) * 100).toFixed(1), boxes: Math.ceil(need / ppb), ppb, lc: x.lc, rc: x.rc, tc: y.tc, bc: y.bc, score, trueMinH, trueMinV, minPieceY: x.minPieceY, minPieceSide: x.minPieceSide };
  });

  const allMeet = xPW.every(x => x.met) && yPW.every(y => y.met);
  const notes = [];
  if (walls.length > 1) { notes.push(`Master: "${walls[masterIdx].name}"`); notes.push(`Wrap × ${walls.length} walls`); }
  if (allMeet) notes.push('✓ All cuts ≥ min — zero slivers');
  else {
    const bad = [];
    xPW.forEach((x, i) => { if (!x.met) bad.push(`${walls[i].name} H: L${formatInches(x.lc)}/R${formatInches(x.rc)}`); });
    yPW.forEach((y, i) => { if (!y.met) bad.push(`${walls[i].name} V: T${formatInches(y.tc)}/B${formatInches(y.bc)}`); });
    notes.push(`⚠ Violations: ${bad.join(', ')}`);
  }
  notes.push(`Offset: ${formatInches(globalXOff)} X, ${formatInches(globalYOff)} Y`);
  const avgScore = Math.round(layouts.reduce((s, l) => s + l.score, 0) / layouts.length);
  return { layouts, xPW, yPW, globalXOff, globalYOff, mi: masterIdx, notes, avgScore, allMeet, isC: isComplex, mcw, mch, cellW, cellH, connectionMode };
}
