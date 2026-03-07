// ─── TILE GENERATION ─────────────────────────────────────────────────────────
// Generates positioned tile geometry for all supported patterns. Pure math.

import { posOr, nOr, varCol } from './utils.js';

export function generateTiles(totalW, totalH, tile, patId, grout, gxo, gyo) {
  const out = [];
  const tW = posOr(tile?.w, 12), tH = posOr(tile?.h, 24), g = Math.max(0, nOr(grout, 0.125));
  const short = Math.min(tW, tH), long_ = Math.max(tW, tH);
  const ox = -gxo, oy = -gyo, mx = gxo + Math.max(tW, tH) * 2, my = gyo + Math.max(tW, tH) * 2;

  const rect = (x, y, w, h) => {
    const ax = x + ox, ay = y + oy;
    if (ax + w < -w * 2 || ay + h < -h * 2 || ax > totalW + w * 2 || ay > totalH + h * 2) return;
    out.push({ t: 'r', x: ax, y: ay, w, h, c: varCol(ax, ay, tile.color) });
  };
  const rotR = (cx, cy, w, h, a) => {
    const ax = cx + ox, ay = cy + oy, r = Math.max(w, h);
    if (ax < -r * 2 || ay < -r * 2 || ax > totalW + r * 2 || ay > totalH + r * 2) return;
    out.push({ t: 'rot', cx: ax, cy: ay, w, h, a, c: varCol(ax, ay, tile.color) });
  };
  const para = pts => {
    const sp = pts.map(p => [p[0] + ox, p[1] + oy]);
    const xs = sp.map(p => p[0]), ys = sp.map(p => p[1]);
    if (Math.max(...xs) < -50 || Math.max(...ys) < -50 || Math.min(...xs) > totalW + 50 || Math.min(...ys) > totalH + 50) return;
    out.push({ t: 'para', pts: sp, c: varCol(sp[0][0], sp[0][1], tile.color) });
  };

  if (patId === 'stacked_h') {
    const cw = long_ + g, ch = short + g;
    for (let r = -2; r <= (totalH + my) / ch + 2; r++)
      for (let c = -2; c <= (totalW + mx) / cw + 2; c++)
        rect(c * cw, r * ch, long_, short);
  } else if (patId === 'stacked_v') {
    const cw = short + g, ch = long_ + g;
    for (let r = -2; r <= (totalH + my) / ch + 2; r++)
      for (let c = -2; c <= (totalW + mx) / cw + 2; c++)
        rect(c * cw, r * ch, short, long_);
  } else if (patId === 'offset_h') {
    const cw = long_ + g, ch = short + g;
    for (let r = -2; r <= (totalH + my) / ch + 2; r++) {
      const off = r % 2 !== 0 ? cw / 2 : 0;
      for (let c = -3; c <= (totalW + mx) / cw + 3; c++)
        rect(c * cw + off, r * ch, long_, short);
    }
  } else if (patId === 'offset_v') {
    const cw = short + g, ch = long_ + g;
    for (let c = -2; c <= (totalW + mx) / cw + 2; c++) {
      const off = c % 2 !== 0 ? ch / 2 : 0;
      for (let r = -3; r <= (totalH + my) / ch + 3; r++)
        rect(c * cw, r * ch + off, short, long_);
    }
  } else if (patId === 'third_offset') {
    const cw = long_ + g, ch = short + g;
    for (let r = -2; r <= (totalH + my) / ch + 2; r++) {
      const off = (((r % 3) + 3) % 3) * (cw / 3);
      for (let c = -3; c <= (totalW + mx) / cw + 3; c++)
        rect(c * cw + off, r * ch, long_, short);
    }
  } else if (['herringbone','herringbone_diag','herringbone_str'].includes(patId)) {
    const sx = long_ + g, sy = short + g;
    const angle = patId === 'herringbone_diag' ? Math.PI / 4 : patId === 'herringbone_str' ? -Math.PI / 4 : 0;
    const twH = totalW + mx, tH2 = totalH + my, cxR = twH / 2, cyR = tH2 / 2;
<<<<<<< HEAD
    const diag = Math.sqrt(twH * twH + tH2 * tH2), span = diag / 2 + Math.max(sx, sy) * 4;
=======
    const diag = Math.sqrt(twH * twH + tH2 * tH2), span = diag / 2 + Math.max(sx, sy) * 3;
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    const aC = (cxR + cyR) / (2 * sx), bC = (cxR - cyR) / (2 * sy), aR = span / sx, bR = span / sy;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const emit = (x, y, w, h) => {
      if (angle === 0) { rect(x, y, w, h); return; }
      const tcx = x + w / 2, tcy = y + h / 2, dx = tcx - cxR, dy = tcy - cyR;
      rotR(dx * cos - dy * sin + cxR, dx * sin + dy * cos + cyR, w, h, angle);
    };
    for (let a = Math.floor(aC - aR); a <= Math.ceil(aC + aR); a++)
      for (let b = Math.floor(bC - bR); b <= Math.ceil(bC + bR); b++) {
        const px = a * sx + b * sy, py = a * sx - b * sy;
        emit(px, py, long_, short);
        emit(px + sx, py, short, long_);
      }
  } else if (patId === 'chevron') {
    const cw2 = long_ * Math.SQRT1_2, vh = short * Math.SQRT2, gv = g * Math.SQRT2, colW = cw2 + g, rowH = vh;
<<<<<<< HEAD
    const nC = Math.ceil((totalW + mx) / colW) + 3, nR = Math.ceil((totalH + my) / rowH) + Math.ceil(cw2 / rowH) + 3;
=======
    const nC = Math.ceil((totalW + mx) / colW) + 2, nR = Math.ceil((totalH + my) / rowH) + Math.ceil(cw2 / rowH) + 2;
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    for (let c = -2; c <= nC; c++) {
      const x = c * colW;
      for (let r = -Math.ceil(cw2 / rowH) - 2; r <= nR; r++) {
        const y = r * rowH;
        if (c % 2 === 0) para([[x,y],[x+cw2,y+cw2],[x+cw2,y+cw2+vh-gv],[x,y+vh-gv]]);
        else para([[x,y+cw2],[x+cw2,y],[x+cw2,y+vh-gv],[x,y+cw2+vh-gv]]);
      }
    }
  } else if (patId === 'diagonal') {
<<<<<<< HEAD
    const c45 = Math.SQRT1_2, mxN = Math.ceil(Math.max(totalW + mx, totalH + my) * 1.8 / Math.max(tW, tH));
=======
    const c45 = Math.SQRT1_2, mxN = Math.ceil(Math.max(totalW + mx, totalH + my) * 1.5 / Math.max(tW, tH));
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    const cx2 = (totalW + mx) / 2, cy2 = (totalH + my) / 2;
    for (let r = -mxN; r <= mxN; r++)
      for (let c = -mxN; c <= mxN; c++)
        rotR(c * (tW + g) * c45 - r * (tH + g) * c45 + cx2, c * (tW + g) * c45 + r * (tH + g) * c45 + cy2, tW, tH, Math.PI / 4);
  } else if (patId === 'crosshatch') {
    const nT = Math.max(1, Math.round(long_ / short)), sub = (long_ - g * (nT - 1)) / nT, us = long_ + g;
    for (let r = -2; r <= (totalH + my) / us + 2; r++)
      for (let c = -2; c <= (totalW + mx) / us + 2; c++) {
        const bx = c * us, by = r * us;
        if ((c + r) % 2 === 0) for (let i = 0; i < nT; i++) rect(bx, by + i * (sub + g), long_, sub);
        else for (let i = 0; i < nT; i++) rect(bx + i * (sub + g), by, sub, long_);
      }
  } else if (patId === 'pinwheel') {
    const unit = long_ + short + g * 2;
    for (let r = -2; r <= (totalH + my) / unit + 2; r++)
      for (let c = -2; c <= (totalW + mx) / unit + 2; c++) {
        const bx = c * unit, by = r * unit;
        rect(bx + short + g, by, long_, short);
        rect(bx + long_ + g, by + short + g, short, long_);
        rect(bx, by + long_ + g, long_, short);
        rect(bx, by, short, long_);
        const sq = long_ - short - g;
        if (sq > 0) rect(bx + short + g, by + short + g, sq, sq);
      }
  } else if (patId === 'corridor') {
    const rowH = long_ + short + g * 2;
    for (let r = -2; r <= (totalH + my) / rowH + 2; r++) {
      const by1 = r * rowH, by2 = by1 + short + g;
      for (let c = -2; c <= (totalW + mx) / (long_ + g) + 2; c++) rect(c * (long_ + g), by1, long_, short);
      for (let c = -2; c <= (totalW + mx) / (short + g) + 2; c++) rect(c * (short + g), by2, short, long_);
    }
  } else if (patId === 'versailles') {
    const unit = long_ + short + g * 2;
    for (let r = -2; r <= (totalH + my) / unit + 2; r++)
      for (let c = -2; c <= (totalW + mx) / unit + 2; c++) {
        const bx = c * unit, by = r * unit;
        rect(bx, by, long_, long_);
        rect(bx + long_ + g, by, short, long_);
        rect(bx, by + long_ + g, long_, short);
        rect(bx + long_ + g, by + long_ + g, short, short);
      }
  } else if (patId === 'parquet') {
    const eH = (long_ - g * 2) / 3, gs2 = long_ + g;
    for (let r = -2; r <= (totalH + my) / gs2 + 2; r++)
      for (let c = -2; c <= (totalW + mx) / gs2 + 2; c++) {
        const bx = c * gs2, by = r * gs2;
        if ((c + r) % 2 === 0) for (let i = 0; i < 3; i++) rect(bx + i * (eH + g), by, eH, long_);
        else for (let i = 0; i < 3; i++) rect(bx, by + i * (eH + g), long_, eH);
      }
  }

  return out;
}
