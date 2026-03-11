// ─── TILE GEOMETRY HELPERS ───────────────────────────────────────────────────
// Pure math for bounding boxes and scanline intersections. No React/DOM.

// Get X extent of a rotated rectangle at scanline y
export function rotRectXAtY(t, y) {
  const cos = Math.cos(t.a), sin = Math.sin(t.a);
  const hw = t.w / 2, hh = t.h / 2;
  const corners = [
    [t.cx - cos * hw + sin * hh, t.cy - sin * hw - cos * hh],
    [t.cx + cos * hw + sin * hh, t.cy + sin * hw - cos * hh],
    [t.cx + cos * hw - sin * hh, t.cy + sin * hw + cos * hh],
    [t.cx - cos * hw - sin * hh, t.cy - sin * hw + cos * hh],
  ];
  const ints = [];
  for (let i = 0; i < 4; i++) {
    const p1 = corners[i], p2 = corners[(i + 1) % 4];
    if ((p1[1] <= y && p2[1] > y) || (p1[1] > y && p2[1] <= y)) {
      ints.push(p1[0] + (y - p1[1]) / (p2[1] - p1[1]) * (p2[0] - p1[0]));
    } else if (Math.abs(p1[1] - y) < 0.01) ints.push(p1[0]);
  }
  return ints.length >= 2 ? [Math.min(...ints), Math.max(...ints)] : null;
}

// Get Y extent of a rotated rectangle at scanline x
export function rotRectYAtX(t, x) {
  const cos = Math.cos(t.a), sin = Math.sin(t.a);
  const hw = t.w / 2, hh = t.h / 2;
  const corners = [
    [t.cx - cos * hw + sin * hh, t.cy - sin * hw - cos * hh],
    [t.cx + cos * hw + sin * hh, t.cy + sin * hw - cos * hh],
    [t.cx + cos * hw - sin * hh, t.cy + sin * hw + cos * hh],
    [t.cx - cos * hw - sin * hh, t.cy - sin * hw + cos * hh],
  ];
  const ints = [];
  for (let i = 0; i < 4; i++) {
    const p1 = corners[i], p2 = corners[(i + 1) % 4];
    if ((p1[0] <= x && p2[0] > x) || (p1[0] > x && p2[0] <= x)) {
      ints.push(p1[1] + (x - p1[0]) / (p2[0] - p1[0]) * (p2[1] - p1[1]));
    } else if (Math.abs(p1[0] - x) < 0.01) ints.push(p1[1]);
  }
  return ints.length >= 2 ? [Math.min(...ints), Math.max(...ints)] : null;
}

// Get X extent of parallelogram at scanline y
export function paraXAtY(t, y) {
  const ints = [];
  for (let i = 0; i < t.pts.length; i++) {
    const p1 = t.pts[i], p2 = t.pts[(i + 1) % t.pts.length];
    if ((p1[1] <= y && p2[1] > y) || (p1[1] > y && p2[1] <= y))
      ints.push(p1[0] + (y - p1[1]) / (p2[1] - p1[1]) * (p2[0] - p1[0]));
    else if (Math.abs(p1[1] - y) < 0.01) ints.push(p1[0]);
  }
  return ints.length >= 2 ? [Math.min(...ints), Math.max(...ints)] : null;
}

// Get Y extent of parallelogram at scanline x
export function paraYAtX(t, x) {
  const ints = [];
  for (let i = 0; i < t.pts.length; i++) {
    const p1 = t.pts[i], p2 = t.pts[(i + 1) % t.pts.length];
    if ((p1[0] <= x && p2[0] > x) || (p1[0] > x && p2[0] <= x))
      ints.push(p1[1] + (x - p1[0]) / (p2[0] - p1[0]) * (p2[1] - p1[1]));
    else if (Math.abs(p1[0] - x) < 0.01) ints.push(p1[1]);
  }
  return ints.length >= 2 ? [Math.min(...ints), Math.max(...ints)] : null;
}

// Get tile X extent at scanline y (works for any tile type)
export function tileXAtY(t, y) {
  if (t.t === 'r') {
    if (y < t.y - 0.01 || y > t.y + t.h + 0.01) return null;
    return [t.x, t.x + t.w];
  }
  if (t.t === 'rot') return rotRectXAtY(t, y);
  if (t.t === 'para') return paraXAtY(t, y);
  return null;
}

// Get tile Y extent at scanline x (works for any tile type)
export function tileYAtX(t, x) {
  if (t.t === 'r') {
    if (x < t.x - 0.01 || x > t.x + t.w + 0.01) return null;
    return [t.y, t.y + t.h];
  }
  if (t.t === 'rot') return rotRectYAtX(t, x);
  if (t.t === 'para') return paraYAtX(t, x);
  return null;
}

// Tile bounding box → [x0, y0, x1, y1]
export function tileBB(t) {
  if (t.t === 'r') return [t.x, t.y, t.x + t.w, t.y + t.h];
  if (t.t === 'rot') {
    const cos = Math.cos(t.a), sin = Math.sin(t.a), hw = t.w / 2, hh = t.h / 2;
    const dx = Math.abs(cos * hw) + Math.abs(sin * hh), dy = Math.abs(sin * hw) + Math.abs(cos * hh);
    return [t.cx - dx, t.cy - dy, t.cx + dx, t.cy + dy];
  }
  if (t.t === 'para') {
    const xs = t.pts.map(p => p[0]), ys = t.pts.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  return [0, 0, 0, 0];
}

// Compute piece width for rotated tiles crossing a wall edge
export function rotatedPieceWidth(t, wallEdgeX, side) {
  if (t.t === 'r') {
    if (side === 'left') return t.x + t.w - wallEdgeX;
    if (side === 'right') return wallEdgeX - t.x;
    return t.w;
  }
  if (t.t === 'rot') {
    const cos = Math.cos(t.a), sin = Math.sin(t.a);
    const hw = t.w / 2, hh = t.h / 2;
    const corners = [
      [t.cx - cos * hw + sin * hh, t.cy - sin * hw - cos * hh],
      [t.cx + cos * hw + sin * hh, t.cy + sin * hw - cos * hh],
      [t.cx + cos * hw - sin * hh, t.cy + sin * hw + cos * hh],
      [t.cx - cos * hw - sin * hh, t.cy - sin * hw + cos * hh],
    ];
    if (side === 'left') {
      const insideCorners = corners.filter(c => c[0] > wallEdgeX);
      if (insideCorners.length === 0) return 0;
      return Math.max(...insideCorners.map(c => c[0])) - wallEdgeX;
    }
    if (side === 'right') {
      const insideCorners = corners.filter(c => c[0] < wallEdgeX);
      if (insideCorners.length === 0) return 0;
      return wallEdgeX - Math.min(...insideCorners.map(c => c[0]));
    }
    return t.w;
  }
  return 0;
}
