// ─── CUT CALCULATORS ─────────────────────────────────────────────────────────
// Direct scan-line and tile-geometry cut detection. Pure math, no DOM.

import { tileBB, tileXAtY, tileYAtX } from './tileBB.js';

// ─── DIRECT SCAN-LINE CUT CALCULATORS ─────────────────────────────────────────

function segCutsX(al, ar, cW) {
  const span = ar - al;
  if (span < 0.01) return { lc: 0, rc: 0 };
  const alInCell = ((al % cW) + cW) % cW;
  const distToNextGrid = alInCell < 0.001 ? cW : cW - alInCell;
  if (distToNextGrid >= span - 0.001) {
    const w = span;
    return { lc: w, rc: w };
  } else {
    const lCut = distToNextGrid;
    const arInCell = ((ar % cW) + cW) % cW;
    const rCut = arInCell < 0.001 ? 0 : arInCell;
    return { lc: lCut, rc: rCut };
  }
}

function segCutsY(at, ab, cH) {
  const span = ab - at;
  if (span < 0.01) return { tc: 0, bc: 0 };
  const atInCell = ((at % cH) + cH) % cH;
  const distToNextGrid = atInCell < 0.001 ? cH : cH - atInCell;
  if (distToNextGrid >= span - 0.001) {
    const h = span;
    return { tc: h, bc: h };
  } else {
    const tCut = distToNextGrid;
    const abInCell = ((ab % cH) + cH) % cH;
    const bCut = abInCell < 0.001 ? 0 : abInCell;
    return { tc: tCut, bc: bCut };
  }
}

export function cutsProfileX(profile, cellW, cellH, gox, wallStartY, phases) {
  const cW = Math.max(0.001, cellW);
  let minL = Infinity, minR = Infinity;
  for (const shift of phases) {
    for (const { y, segs } of profile) {
      for (const [lx, rx] of segs) {
        const span = rx - lx;
        if (span < 0.005) continue;
        const al = lx + gox - shift, ar = rx + gox - shift;
        if (span < cW - 0.005) {
          minL = Math.min(minL, span);
          minR = Math.min(minR, span);
        } else {
          const { lc, rc } = segCutsX(al, ar, cW);
          if (lc > 0.005 && lc < cW - 0.005) minL = Math.min(minL, lc);
          if (rc > 0.005 && rc < cW - 0.005) minR = Math.min(minR, rc);
        }
      }
    }
  }
  return { lc: minL === Infinity ? 0 : minL, rc: minR === Infinity ? 0 : minR };
}

export function cutsProfileY(profile, cellH, cellW, goy, wallStartY, phases) {
  const cH = Math.max(0.001, cellH);
  let minT = Infinity, minB = Infinity;
  for (const shift of phases) {
    for (const { x, segs } of profile) {
      for (const [ty, by] of segs) {
        const span = by - ty;
        if (span < 0.005) continue;
        if (span < cH - 0.005) {
          minT = Math.min(minT, span);
          minB = Math.min(minB, span);
        } else {
          const at = ty + wallStartY + goy - shift, ab = by + wallStartY + goy - shift;
          const { tc, bc } = segCutsY(at, ab, cH);
          if (tc > 0.005 && tc < cH - 0.005) minT = Math.min(minT, tc);
          if (bc > 0.005 && bc < cH - 0.005) minB = Math.min(minB, bc);
        }
      }
    }
  }
  return { tc: minT === Infinity ? 0 : minT, bc: minB === Infinity ? 0 : minB };
}

// ─── EDGE-GRID CROSSING HELPERS ──────────────────────────────────────────────

function edgeGridCrossingsX(p1, p2, wallX, gxo, cW, cH, gyo, wallY, pat) {
  const ys = [];
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  if (Math.abs(dx) < 1e-9) return ys;
  const yLo = Math.min(p1[1], p2[1]), yHi = Math.max(p1[1], p2[1]);
  if (yHi - yLo < 0.001) return ys;
  const rowLo = Math.floor((yLo + wallY + gyo) / cH) - 1;
  const rowHi = Math.ceil((yHi + wallY + gyo) / cH) + 1;
  for (let row = rowLo; row <= rowHi; row++) {
    let shift = 0;
    if (pat === 'offset_h') shift = (((row % 2) + 2) % 2) * cW / 2;
    else if (pat === 'third_offset') shift = (((row % 3) + 3) % 3) * (cW / 3);
    else if (pat === 'offset_v') shift = 0;
    const rowYbot = row * cH - wallY - gyo;
    const rowYtop = (row + 1) * cH - wallY - gyo;
    const effYlo = Math.max(yLo, rowYbot);
    const effYhi = Math.min(yHi, rowYtop);
    if (effYhi - effYlo < 0.0001) continue;
    const xAtLo = p1[0] + (effYlo - p1[1]) * dx / dy;
    const xAtHi = p1[0] + (effYhi - p1[1]) * dx / dy;
    const absXlo = wallX + xAtLo + gxo - shift;
    const absXhi = wallX + xAtHi + gxo - shift;
    const minAbsX = Math.min(absXlo, absXhi), maxAbsX = Math.max(absXlo, absXhi);
    const nLo = Math.floor(minAbsX / cW), nHi = Math.ceil(maxAbsX / cW);
    for (let n = nLo; n <= nHi; n++) {
      const gx = n * cW;
      if (gx < minAbsX - 0.001 || gx > maxAbsX + 0.001) continue;
      const xLocal = gx - wallX - gxo + shift;
      if (Math.abs(dx) < 1e-9) continue;
      const crossY = p1[1] + (xLocal - p1[0]) * dy / dx;
      if (crossY >= yLo - 0.01 && crossY <= yHi + 0.01) {
        for (const d of [0, -0.002, 0.002, -0.01, 0.01, -0.05, 0.05, -0.2, 0.2]) {
          const yy = crossY + d;
          if (yy >= yLo && yy <= yHi) ys.push(yy);
        }
      }
    }
  }
  return ys;
}

function edgeGridCrossingsY(p1, p2, wallY, gyo, cH, cW, gxo, wallX, pat) {
  const ys = [];
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  if (Math.abs(dy) < 1e-9) return ys;
  const xLo = Math.min(p1[0], p2[0]), xHi = Math.max(p1[0], p2[0]);
  if (xHi - xLo < 0.001) return ys;
  const colLo = Math.floor((xLo + wallX + gxo) / cW) - 1;
  const colHi = Math.ceil((xHi + wallX + gxo) / cW) + 1;
  for (let col = colLo; col <= colHi; col++) {
    let shift = 0;
    if (pat === 'offset_v') shift = (((col % 2) + 2) % 2) * cH / 2;
    const colXleft = col * cW - wallX - gxo;
    const colXright = (col + 1) * cW - wallX - gxo;
    const effXlo = Math.max(xLo, colXleft);
    const effXhi = Math.min(xHi, colXright);
    if (effXhi - effXlo < 0.0001) continue;
    const yAtLo = p1[1] + (effXlo - p1[0]) * dy / dx;
    const yAtHi = p1[1] + (effXhi - p1[0]) * dy / dx;
    const absYlo = wallY + Math.min(yAtLo, yAtHi) + gyo - shift;
    const absYhi = wallY + Math.max(yAtLo, yAtHi) + gyo - shift;
    const nLo = Math.floor(absYlo / cH), nHi = Math.ceil(absYhi / cH);
    for (let n = nLo; n <= nHi; n++) {
      const gy = n * cH;
      const yLocal = gy - wallY - gyo + shift;
      if (Math.abs(dy) < 1e-9) continue;
      const crossX = p1[0] + (yLocal - p1[1]) * dx / dy;
      if (crossX >= xLo - 0.01 && crossX <= xHi + 0.01) {
        for (const d of [0, -0.002, 0.002, -0.01, 0.01, -0.05, 0.05, -0.2, 0.2]) {
          const xx = crossX + d;
          if (xx >= xLo && xx <= xHi) ys.push(xx);
        }
      }
    }
  }
  return ys;
}

// ─── EXACT CUTS (PROFILE-BASED) ─────────────────────────────────────────────

export function exactCutsX(pX, cellW, cellH, pat, gxo, gyo, wallX, wallY, wall) {
  const cW = Math.max(0.001, cellW), cH = Math.max(0.001, cellH);
  let minL = Infinity, minR = Infinity;
  let minPiece = Infinity, minPieceY = 0, minPieceSide = '';

  let extraYs = [];
  const isCust = wall?.isCustom && wall?.points?.length > 2;
  if (isCust) {
    const pts = wall.points;
    for (let j = 0; j < pts.length; j++) {
      const p1 = pts[j], p2 = pts[(j + 1) % pts.length];
      extraYs = extraYs.concat(edgeGridCrossingsX(p1, p2, wallX, gxo, cW, cH, gyo, wallY, pat));
    }
  }

  const allYs = new Set();
  for (const { y } of pX) allYs.add(y);
  for (const ey of extraYs) allYs.add(ey);
  const sortedYs = [...allYs].sort((a, b) => a - b);

  const getSegsAtY = (y) => {
    if (!isCust) {
      if (pX.length >= 2) return pX[0].segs;
      return [[0, wall?.w || 60]];
    }
    const pts = wall.points;
    const ints = [];
    for (let j = 0; j < pts.length; j++) {
      const p1 = pts[j], p2 = pts[(j + 1) % pts.length];
      if (Math.abs(p1[1] - p2[1]) < 1e-9) {
        if (Math.abs(p1[1] - y) < 0.01) { ints.push(p1[0]); ints.push(p2[0]); }
        continue;
      }
      if ((p1[1] <= y + 0.001 && p2[1] > y - 0.001) || (p1[1] > y - 0.001 && p2[1] <= y + 0.001)) {
        const t = (y - p1[1]) / (p2[1] - p1[1]);
        if (t >= -0.01 && t <= 1.01) ints.push(p1[0] + t * (p2[0] - p1[0]));
      }
    }
    if (ints.length < 2) return [];
    ints.sort((a, b) => a - b);
    const segs = [];
    for (let k = 0; k + 1 < ints.length; k += 2) {
      if (ints[k + 1] - ints[k] > 0.001) segs.push([ints[k], ints[k + 1]]);
    }
    return segs;
  };

  for (const y of sortedYs) {
    const row = Math.floor((y + wallY + gyo) / cH);
    let shift = 0;
    if (pat === 'offset_h') shift = (((row % 2) + 2) % 2) * cW / 2;
    else if (pat === 'third_offset') shift = (((row % 3) + 3) % 3) * (cW / 3);
    else if (pat === 'offset_v') shift = 0;

    const segs = isCust ? getSegsAtY(y) : pX.find(p => Math.abs(p.y - y) < 0.01)?.segs || [];

    for (const [lx, rx] of segs) {
      const span = rx - lx;
      if (span < 0.005) continue;
      const al = wallX + lx + gxo - shift, ar = wallX + rx + gxo - shift;
      const alInCell = ((al % cW) + cW) % cW;
      const firstGrid = al + (alInCell < 0.001 ? cW : cW - alInCell);
      const leftPiece = Math.min(firstGrid - al, span);
      if (leftPiece > 0.005 && leftPiece < cW - 0.005) {
        minL = Math.min(minL, leftPiece);
        if (leftPiece < minPiece) { minPiece = leftPiece; minPieceY = y; minPieceSide = 'L'; }
      }
      if (span > leftPiece + 0.005) {
        const arInCell = ((ar % cW) + cW) % cW;
        const rightPiece = arInCell < 0.001 ? 0 : arInCell;
        if (rightPiece > 0.005 && rightPiece < cW - 0.005) {
          minR = Math.min(minR, rightPiece);
          if (rightPiece < minPiece) { minPiece = rightPiece; minPieceY = y; minPieceSide = 'R'; }
        }
      }
      if (span < cW - 0.005 && span > 0.005) {
        if (span < minPiece) { minPiece = span; minPieceY = y; minPieceSide = 'V'; }
        minL = Math.min(minL, span);
        minR = Math.min(minR, span);
      }
    }
  }
  return {
    lc: minL === Infinity ? 0 : minL, rc: minR === Infinity ? 0 : minR,
    minPiece: minPiece === Infinity ? 0 : minPiece, minPieceY, minPieceSide
  };
}

export function exactCutsY(pY, cellW, cellH, pat, gxo, gyo, wallX, wallY, wall) {
  const cH = Math.max(0.001, cellH), cW = Math.max(0.001, cellW);
  let minT = Infinity, minB = Infinity;
  let minPiece = Infinity, minPieceX = 0, minPieceSide = '';

  let extraXs = [];
  const isCust = wall?.isCustom && wall?.points?.length > 2;
  if (isCust) {
    const pts = wall.points;
    for (let j = 0; j < pts.length; j++) {
      const p1 = pts[j], p2 = pts[(j + 1) % pts.length];
      extraXs = extraXs.concat(edgeGridCrossingsY(p1, p2, wallY, gyo, cH, cW, gxo, wallX, pat));
    }
  }

  const allXs = new Set();
  for (const { x } of pY) allXs.add(x);
  for (const ex of extraXs) allXs.add(ex);
  const sortedXs = [...allXs].sort((a, b) => a - b);

  const getSegsAtX = (x) => {
    if (!isCust) {
      if (pY.length >= 2) return pY[0].segs;
      return [[0, wall?.h || 96]];
    }
    const pts = wall.points;
    const ints = [];
    for (let j = 0; j < pts.length; j++) {
      const p1 = pts[j], p2 = pts[(j + 1) % pts.length];
      if (Math.abs(p1[0] - p2[0]) < 1e-9) {
        if (Math.abs(p1[0] - x) < 0.01) { ints.push(p1[1]); ints.push(p2[1]); }
        continue;
      }
      if ((p1[0] <= x + 0.001 && p2[0] > x - 0.001) || (p1[0] > x - 0.001 && p2[0] <= x + 0.001)) {
        const t = (x - p1[0]) / (p2[0] - p1[0]);
        if (t >= -0.01 && t <= 1.01) ints.push(p1[1] + t * (p2[1] - p1[1]));
      }
    }
    if (ints.length < 2) return [];
    ints.sort((a, b) => a - b);
    const segs = [];
    for (let k = 0; k + 1 < ints.length; k += 2) {
      if (ints[k + 1] - ints[k] > 0.001) segs.push([ints[k], ints[k + 1]]);
    }
    return segs;
  };

  for (const x of sortedXs) {
    const col = Math.floor((x + wallX + gxo) / cW);
    let shift = 0;
    if (pat === 'offset_v') shift = (((col % 2) + 2) % 2) * cH / 2;
    else if (pat === 'offset_h') shift = 0;

    const segs = isCust ? getSegsAtX(x) : pY.find(p => Math.abs(p.x - x) < 0.01)?.segs || [];

    for (const [ty, by] of segs) {
      const span = by - ty;
      if (span < 0.005) continue;
      const at = ty + wallY + gyo - shift, ab = by + wallY + gyo - shift;
      const atInCell = ((at % cH) + cH) % cH;
      const firstGrid = at + (atInCell < 0.001 ? cH : cH - atInCell);
      const topPiece = Math.min(firstGrid - at, span);
      if (topPiece > 0.005 && topPiece < cH - 0.005) {
        minT = Math.min(minT, topPiece);
        if (topPiece < minPiece) { minPiece = topPiece; minPieceX = x; minPieceSide = 'T'; }
      }
      if (span > topPiece + 0.005) {
        const abInCell = ((ab % cH) + cH) % cH;
        const botPiece = abInCell < 0.001 ? 0 : abInCell;
        if (botPiece > 0.005 && botPiece < cH - 0.005) {
          minB = Math.min(minB, botPiece);
          if (botPiece < minPiece) { minPiece = botPiece; minPieceX = x; minPieceSide = 'B'; }
        }
      }
      if (span < cH - 0.005 && span > 0.005) {
        if (span < minPiece) { minPiece = span; minPieceX = x; minPieceSide = 'V'; }
        minT = Math.min(minT, span);
        minB = Math.min(minB, span);
      }
    }
  }
  return {
    tc: minT === Infinity ? 0 : minT, bc: minB === Infinity ? 0 : minB,
    minPiece: minPiece === Infinity ? 0 : minPiece, minPieceX, minPieceSide
  };
}

// ─── SOLVER HELPERS (solveAllX / solveAllY) ──────────────────────────────────

export function solveAllX(walls, profiles, cellW, cellH, minCut, masterIdx, phases, yStarts) {
  const cW = Math.max(0.001, cellW), MC = Math.max(0, minCut);
  const starts = []; let acc = 0;
  for (const w of walls) { starts.push(acc); acc += w.w; }
  let bestScore = -Infinity, bestOffset = 0, bestPerWall = [];
  for (let go = 0; go <= cW + 1e-9; go += 1 / 32) {
    let total = 0, allMet = true;
    const pw = [];
    for (let i = 0; i < walls.length; i++) {
      const { lc, rc } = cutsProfileX(profiles[i], cellW, cellH, go + starts[i], yStarts[i], phases);
      const lOk = lc < 0.01 || lc >= MC, rOk = rc < 0.01 || rc >= MC, met = lOk && rOk;
      if (!met) allMet = false;
      let s = (met ? 40 : 0) + (lOk ? 8 : -(MC - lc) * 5) + (rOk ? 8 : -(MC - rc) * 5) - Math.abs(lc - rc) * 1.2;
      if (i === masterIdx) { s *= 2; if (met && Math.abs(lc - rc) < 0.5) s += 15; }
      pw.push({ lc, rc, met, fc: 0 }); total += s;
    }
    if (allMet) total += 30;
    if (total > bestScore) { bestScore = total; bestOffset = go; bestPerWall = pw; }
  }
  return { globalXOff: bestOffset, perWall: bestPerWall };
}

export function solveAllY(walls, profiles, cellH, cellW, minCut, phases, yStarts) {
  const cH = Math.max(0.001, cellH), MC = Math.max(0, minCut);
  let bestScore = -Infinity, bestOffset = 0, bestPerWall = [];
  for (let go = 0; go <= cH + 1e-9; go += 1 / 32) {
    let total = 0, allMet = true;
    const pw = [];
    for (let i = 0; i < walls.length; i++) {
      const { tc, bc } = cutsProfileY(profiles[i], cellH, cellW, go, yStarts[i], phases);
      const tOk = tc < 0.01 || tc >= MC, bOk = bc < 0.01 || bc >= MC, met = tOk && bOk;
      if (!met) allMet = false;
      const s = (met ? 40 : 0) + (tOk ? 8 : -(MC - tc) * 5) + (bOk ? 8 : -(MC - bc) * 5) - Math.abs(tc - bc) * 1.2;
      pw.push({ tc, bc, met, fc: 0 }); total += s;
    }
    if (allMet) total += 30;
    if (total > bestScore) { bestScore = total; bestOffset = go; bestPerWall = pw; }
  }
  return { globalYOff: bestOffset, perWall: bestPerWall };
}

// ─── TILE-GEOMETRY CUT DETECTION ─────────────────────────────────────────────

export function computeCutsFromTiles(genTiles, wall, wx0, wy0, isCust, maxTileDim) {
  const ww = wall.w, wh = wall.h;
  const wx1 = wx0 + ww, wy1 = wy0 + wh;
  let minL = Infinity, minR = Infinity, minT = Infinity, minB = Infinity;
  let minPiece = Infinity, minPieceY = 0, minPieceSide = '';
  const step = 0.125;

  const pad = maxTileDim * 2;
  const nearTiles = genTiles.filter(t => {
    const bb = tileBB(t);
    return bb[2] > wx0 - pad && bb[0] < wx1 + pad && bb[3] > wy0 - pad && bb[1] < wy1 + pad;
  });

  if (!isCust) {
    for (const t of nearTiles) {
      const bb = tileBB(t);
      const overlapY = bb[3] > wy0 + 0.01 && bb[1] < wy1 - 0.01;
      const overlapX = bb[2] > wx0 + 0.01 && bb[0] < wx1 - 0.01;

      if (overlapY && bb[0] < wx0 - 0.005 && bb[2] > wx0 + 0.005) {
        const yLo = Math.max(bb[1], wy0), yHi = Math.min(bb[3], wy1);
        for (let y = yLo + step; y < yHi; y += step) {
          const ext = tileXAtY(t, y);
          if (!ext) continue;
          const [tx0, tx1] = ext;
          if (tx0 < wx0 - 0.005 && tx1 > wx0 + 0.005) {
            const piece = tx1 - wx0, full = tx1 - tx0;
            if (piece > 0.005 && piece < full - 0.005) {
              minL = Math.min(minL, piece);
              if (piece < minPiece) { minPiece = piece; minPieceY = y - wy0; minPieceSide = 'L'; }
            }
          }
        }
      }
      if (overlapY && bb[0] < wx1 - 0.005 && bb[2] > wx1 + 0.005) {
        const yLo = Math.max(bb[1], wy0), yHi = Math.min(bb[3], wy1);
        for (let y = yLo + step; y < yHi; y += step) {
          const ext = tileXAtY(t, y);
          if (!ext) continue;
          const [tx0, tx1] = ext;
          if (tx0 < wx1 - 0.005 && tx1 > wx1 + 0.005) {
            const piece = wx1 - tx0, full = tx1 - tx0;
            if (piece > 0.005 && piece < full - 0.005) {
              minR = Math.min(minR, piece);
              if (piece < minPiece) { minPiece = piece; minPieceY = y - wy0; minPieceSide = 'R'; }
            }
          }
        }
      }
      if (overlapX && bb[1] < wy0 - 0.005 && bb[3] > wy0 + 0.005) {
        const xLo = Math.max(bb[0], wx0), xHi = Math.min(bb[2], wx1);
        for (let x = xLo + step; x < xHi; x += step) {
          const ext = tileYAtX(t, x);
          if (!ext) continue;
          const [ty0, ty1] = ext;
          if (ty0 < wy0 - 0.005 && ty1 > wy0 + 0.005) {
            const piece = ty1 - wy0, full = ty1 - ty0;
            if (piece > 0.005 && piece < full - 0.005) minT = Math.min(minT, piece);
          }
        }
      }
      if (overlapX && bb[1] < wy1 - 0.005 && bb[3] > wy1 + 0.005) {
        const xLo = Math.max(bb[0], wx0), xHi = Math.min(bb[2], wx1);
        for (let x = xLo + step; x < xHi; x += step) {
          const ext = tileYAtX(t, x);
          if (!ext) continue;
          const [ty0, ty1] = ext;
          if (ty0 < wy1 - 0.005 && ty1 > wy1 + 0.005) {
            const piece = wy1 - ty0, full = ty1 - ty0;
            if (piece > 0.005 && piece < full - 0.005) minB = Math.min(minB, piece);
          }
        }
      }
    }
  } else {
    const pts = wall.points;
    for (let ei = 0; ei < pts.length; ei++) {
      const ep1 = pts[ei], ep2 = pts[(ei + 1) % pts.length];
      const edgeLen = Math.sqrt((ep2[0] - ep1[0]) ** 2 + (ep2[1] - ep1[1]) ** 2);
      if (edgeLen < 0.01) continue;
      const edx = (ep2[0] - ep1[0]) / edgeLen, edy = (ep2[1] - ep1[1]) / edgeLen;
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const midX = (ep1[0] + ep2[0]) / 2, midY = (ep1[1] + ep2[1]) / 2;
      const nx0 = -edy, ny0 = edx;
      const toCx = cx - midX, toCy = cy - midY;
      const dot = nx0 * toCx + ny0 * toCy;
      const nx = dot >= 0 ? nx0 : -nx0, ny = dot >= 0 ? ny0 : -ny0;
      const isLeftish = nx > 0.3, isRightish = nx < -0.3;
      const isTopish = ny > 0.3, isBottomish = ny < -0.3;

      for (let d = step / 2; d < edgeLen; d += step) {
        const px = ep1[0] + edx * d, py = ep1[1] + edy * d;
        const gx = px + wx0, gy = py + wy0;
        let bestPiece = Infinity;
        for (const t of nearTiles) {
          let inside = false;
          if (t.t === 'r') {
            const ix = gx + nx * 0.1, iy = gy + ny * 0.1;
            if (ix >= t.x && ix <= t.x + t.w && iy >= t.y && iy <= t.y + t.h) inside = true;
          } else if (t.t === 'rot') {
            const dx2 = (gx + nx * 0.1) - t.cx, dy2 = (gy + ny * 0.1) - t.cy;
            const lc2 = Math.cos(-t.a), ls2 = Math.sin(-t.a);
            if (Math.abs(dx2 * lc2 - dy2 * ls2) < t.w / 2 && Math.abs(dx2 * ls2 + dy2 * lc2) < t.h / 2) inside = true;
          } else if (t.t === 'para') {
            const qx = gx + nx * 0.1, qy = gy + ny * 0.1;
            let inv = false;
            for (let i = 0, j = t.pts.length - 1; i < t.pts.length; j = i++) {
              if ((t.pts[i][1] > qy) !== (t.pts[j][1] > qy) &&
                  qx < (t.pts[j][0] - t.pts[i][0]) * (qy - t.pts[i][1]) / (t.pts[j][1] - t.pts[i][1]) + t.pts[i][0])
                inv = !inv;
            }
            inside = inv;
          }
          if (!inside) continue;
          let maxD = 0;
          for (let dd = 0.1; dd < maxTileDim * 1.5; dd += 0.2) {
            const qx2 = gx + nx * dd, qy2 = gy + ny * dd;
            let still = false;
            if (t.t === 'r') still = qx2 >= t.x && qx2 <= t.x + t.w && qy2 >= t.y && qy2 <= t.y + t.h;
            else if (t.t === 'rot') {
              const dx3 = qx2 - t.cx, dy3 = qy2 - t.cy;
              const lc3 = Math.cos(-t.a), ls3 = Math.sin(-t.a);
              still = Math.abs(dx3 * lc3 - dy3 * ls3) < t.w / 2 && Math.abs(dx3 * ls3 + dy3 * lc3) < t.h / 2;
            } else if (t.t === 'para') {
              let inv2 = false;
              for (let i = 0, j = t.pts.length - 1; i < t.pts.length; j = i++) {
                if ((t.pts[i][1] > qy2) !== (t.pts[j][1] > qy2) &&
                    qx2 < (t.pts[j][0] - t.pts[i][0]) * (qy2 - t.pts[i][1]) / (t.pts[j][1] - t.pts[i][1]) + t.pts[i][0])
                  inv2 = !inv2;
              }
              still = inv2;
            }
            if (still) maxD = dd; else break;
          }
          if (maxD > 0.05) bestPiece = Math.min(bestPiece, maxD);
        }
        if (bestPiece < Infinity && bestPiece > 0.005) {
          if (isLeftish)   minL = Math.min(minL, bestPiece);
          if (isRightish)  minR = Math.min(minR, bestPiece);
          if (isTopish)    minT = Math.min(minT, bestPiece);
          if (isBottomish) minB = Math.min(minB, bestPiece);
          if (bestPiece < minPiece) {
            minPiece = bestPiece;
            minPieceY = py;
            minPieceSide = isLeftish ? 'L' : isRightish ? 'R' : isTopish ? 'T' : 'B';
          }
        }
      }
    }
  }

  // Filter out grout-line artifacts
  const groutThreshold = 0.06;
  if (minL > 0 && minL < groutThreshold) minL = Infinity;
  if (minR > 0 && minR < groutThreshold) minR = Infinity;
  if (minT > 0 && minT < groutThreshold) minT = Infinity;
  if (minB > 0 && minB < groutThreshold) minB = Infinity;
  if (minPiece > 0 && minPiece < groutThreshold) minPiece = Infinity;

  return {
    lc: minL === Infinity ? 0 : minL, rc: minR === Infinity ? 0 : minR,
    tc: minT === Infinity ? 0 : minT, bc: minB === Infinity ? 0 : minB,
    minPiece: minPiece === Infinity ? 0 : minPiece, minPieceY, minPieceSide
  };
}
