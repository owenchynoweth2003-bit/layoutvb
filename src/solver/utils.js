// ─── PURE UTILITY FUNCTIONS ──────────────────────────────────────────────────
// No React, no DOM, no window — safe for solver and domain use.

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const nOr = (v, f = 0) => { const x = +v; return Number.isFinite(x) ? x : f; };
export const posOr = (v, f = 1) => { const x = +v; return Number.isFinite(x) && x > 0 ? x : f; };
export const sqft = n => (n / 144).toFixed(1);

// Shoelace formula for polygon area in square inches
export const polyArea = pts => {
  if (!pts || pts.length < 3) return 0;
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return Math.abs(a / 2);
};

export const wallArea = w =>
  w.isCustom && w.points?.length >= 3 ? polyArea(w.points) : posOr(w.w, 1) * posOr(w.h, 1);

export function adjCol(hex, pct) {
  if (!hex || hex.length < 7) return hex || '#888';
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  r = clamp(Math.round(r + r * pct / 100), 0, 255);
  g = clamp(Math.round(g + g * pct / 100), 0, 255);
  b = clamp(Math.round(b + b * pct / 100), 0, 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function varCol(x, y, base) {
  return adjCol(base, (Math.abs(Math.round(x * 7 + y * 13)) % 7) * 1.5 - 4.5);
}

export function toFraction(val) {
  const v = parseFloat(val);
  if (isNaN(v) || v < 0.01) return '0';
  const t32 = Math.round(v * 32);
  if (t32 === 0) return '0';
  const whole = Math.floor(t32 / 32);
  let num = t32 % 32, den = 32;
  if (num === 0) return `${whole}`;
  while (num % 2 === 0 && den > 2) { num /= 2; den /= 2; }
  return whole === 0 ? `${num}/${den}` : `${whole} ${num}/${den}`;
}

export function parseFraction(str) {
  if (!str) return 0;
  const raw = str.toString().trim();
  const sign = raw.startsWith('-') ? -1 : 1;
  const s = raw.replace(/^-/, '').replace('-', ' ');
  const parts = s.split(/\s+/);
  let result;
  if (parts.length > 1) {
    const whole = parseFloat(parts[0]);
    const frac = parts[1].split('/');
    result = frac.length === 2 ? whole + parseFloat(frac[0]) / parseFloat(frac[1]) : parseFloat(s);
  } else if (s.includes('/')) {
    const frac = s.split('/');
    result = frac.length === 2 ? parseFloat(frac[0]) / parseFloat(frac[1]) : parseFloat(s);
  } else {
    result = parseFloat(s);
  }
  return isNaN(result) ? 0 : sign * result;
}

export const formatInches = val => {
  const f = toFraction(val);
  return f === '0' ? '0"' : `${f}"`;
};

// ─── POLYGON TRANSFORM HELPERS ──────────────────────────────────────────────
export function transformPts(pts, action) {
  if (!pts || pts.length < 3) return pts;
  const xs = pts.map(p => +p[0]), ys = pts.map(p => +p[1]);
  const minXp = Math.min(...xs), maxXp = Math.max(...xs);
  const minYp = Math.min(...ys), maxYp = Math.max(...ys);
  const cx = (minXp + maxXp) / 2, cy = (minYp + maxYp) / 2;
  let result;
  if (action === 'cw90') {
    result = pts.map(p => [cx + (p[1] - cy), cy - (p[0] - cx)]);
  } else if (action === 'ccw90') {
    result = pts.map(p => [cx - (p[1] - cy), cy + (p[0] - cx)]);
  } else if (action === 'rot180') {
    result = pts.map(p => [2 * cx - p[0], 2 * cy - p[1]]);
  } else if (action === 'flipH') {
    result = pts.map(p => [maxXp - (p[0] - minXp), p[1]]);
  } else if (action === 'flipV') {
    result = pts.map(p => [p[0], maxYp - (p[1] - minYp)]);
  } else return pts;
  const rx = result.map(p => p[0]), ry = result.map(p => p[1]);
  const offX = Math.min(...rx), offY = Math.min(...ry);
  return result.map(p => [+(p[0] - offX).toFixed(4), +(p[1] - offY).toFixed(4)]);
}

// Canvas rounded pill (safe cross-browser, no ctx.roundRect)
export function drawPill(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function snapXY(n, sw, sh, fw, fh) {
  const p = 2, cx = (sw - fw) / 2, cy = (sh - fh) / 2;
  return ({
    Center: [cx, cy], Top: [cx, p], Bottom: [cx, sh - fh - p],
    Left: [p, cy], Right: [sw - fw - p, cy],
    'Top-Left': [p, p], 'Top-Right': [sw - fw - p, p],
    'Btm-Left': [p, sh - fh - p], 'Btm-Right': [sw - fw - p, sh - fh - p]
  })[n] || [cx, cy];
}
