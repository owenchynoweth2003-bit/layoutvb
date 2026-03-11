// ─── PROFILE BUILDERS ─────────────────────────────────────────────────────────
// Build wall edge profiles for cut calculation. Pure math, no DOM.

export function getWallXProfile(wall, holes) {
  if (!wall.isCustom && holes.length === 0) {
    return [{ y: 0, segs: [[0, wall.w]] }, { y: wall.h, segs: [[0, wall.w]] }];
  }
  const isCust = wall.isCustom && wall.points?.length > 2;
  const minY = isCust ? Math.min(...wall.points.map(p => p[1])) : 0;
  const maxY = isCust ? Math.max(...wall.points.map(p => p[1])) : wall.h;
  const ys = [];
  const step = isCust ? 0.025 : 0.05;
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y += step) ys.push(y);
  if (ys[ys.length - 1] !== maxY) ys.push(maxY);
  if (isCust) wall.points.forEach(p => {
    for (const d of [0, -0.003, 0.003, -0.01, 0.01, -0.02, 0.02, -0.05, 0.05, -0.1, 0.1, -0.25, 0.25, -0.5, 0.5, -1, 1, -2, 2]) {
      const yy = p[1] + d;
      if (yy >= minY && yy <= maxY) ys.push(yy);
    }
  });
  ys.sort((a, b) => a - b);

  const profile = [];
  for (let i = 0; i < ys.length; i++) {
    const y = ys[i];
    if (i > 0 && y - ys[i - 1] < 1e-5) continue;
    let ints = [];
    if (isCust) {
      for (let j = 0; j < wall.points.length; j++) {
        const p1 = wall.points[j], p2 = wall.points[(j + 1) % wall.points.length];
        if (Math.abs(p1[1] - p2[1]) < 1e-9) {
          if (Math.abs(p1[1] - y) < 1e-9) { ints.push(p1[0]); ints.push(p2[0]); }
          continue;
        }
        if ((p1[1] <= y && p2[1] > y) || (p1[1] > y && p2[1] <= y))
          ints.push(p1[0] + (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]));
      }
    } else {
      ints = [0, wall.w];
    }
    if (ints.length >= 2) {
      ints.sort((a, b) => a - b);
      let segs = [];
      for (let k = 0; k + 1 < ints.length; k += 2) segs.push([ints[k], ints[k + 1]]);
      holes.forEach(h => {
        if (y < h.y || y > h.y + h.h) return;
        const next = [];
        segs.forEach(s => {
          if (h.x + h.w < s[0] || h.x > s[1]) next.push(s);
          else {
            if (s[0] < h.x) next.push([s[0], h.x]);
            if (h.x + h.w < s[1]) next.push([h.x + h.w, s[1]]);
          }
        });
        segs = next;
      });
      if (segs.length) profile.push({ y, segs });
    }
  }
  return profile.length ? profile : [{ y: 0, segs: [[0, wall.w]] }];
}

export function getWallYProfile(wall, holes) {
  if (!wall.isCustom && holes.length === 0) {
    return [{ x: 0, segs: [[0, wall.h]] }, { x: wall.w, segs: [[0, wall.h]] }];
  }
  const isCust = wall.isCustom && wall.points?.length > 2;
  const minX = isCust ? Math.min(...wall.points.map(p => p[0])) : 0;
  const maxX = isCust ? Math.max(...wall.points.map(p => p[0])) : wall.w;
  const xs = [];
  const step = isCust ? 0.025 : 0.05;
  for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += step) xs.push(x);
  if (xs[xs.length - 1] !== maxX) xs.push(maxX);
  if (isCust) wall.points.forEach(p => {
    for (const d of [0, -0.003, 0.003, -0.01, 0.01, -0.02, 0.02, -0.05, 0.05, -0.1, 0.1, -0.25, 0.25, -0.5, 0.5, -1, 1, -2, 2]) {
      const xx = p[0] + d;
      if (xx >= minX && xx <= maxX) xs.push(xx);
    }
  });
  xs.sort((a, b) => a - b);

  const profile = [];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    if (i > 0 && x - xs[i - 1] < 1e-5) continue;
    let ints = [];
    if (isCust) {
      for (let j = 0; j < wall.points.length; j++) {
        const p1 = wall.points[j], p2 = wall.points[(j + 1) % wall.points.length];
        if (Math.abs(p1[0] - p2[0]) < 1e-9) {
          if (Math.abs(p1[0] - x) < 1e-9) { ints.push(p1[1]); ints.push(p2[1]); }
          continue;
        }
        if ((p1[0] <= x && p2[0] > x) || (p1[0] > x && p2[0] <= x))
          ints.push(p1[1] + (x - p1[0]) * (p2[1] - p1[1]) / (p2[0] - p1[0]));
      }
    } else {
      ints = [0, wall.h];
    }
    if (ints.length >= 2) {
      ints.sort((a, b) => a - b);
      let segs = [];
      for (let k = 0; k + 1 < ints.length; k += 2) segs.push([ints[k], ints[k + 1]]);
      holes.forEach(h => {
        if (x < h.x || x > h.x + h.w) return;
        const next = [];
        segs.forEach(s => {
          if (h.y + h.h < s[0] || h.y > s[1]) next.push(s);
          else {
            if (s[0] < h.y) next.push([s[0], h.y]);
            if (h.y + h.h < s[1]) next.push([h.y + h.h, s[1]]);
          }
        });
        segs = next;
      });
      if (segs.length) profile.push({ x, segs });
    }
  }
  return profile.length ? profile : [{ x: 0, segs: [[0, wall.h]] }];
}
