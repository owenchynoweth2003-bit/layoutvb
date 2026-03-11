// ─── HIT TEST HELPERS FOR TILE CANVAS ────────────────────────────────────────
// Convert mouse coords to wall space and detect drag targets.

export function toWallSpace(e, canvasRef, CW, CH, renderState) {
  const cv = canvasRef.current;
  if (!cv) return { mx: 0, my: 0 };
  const r = cv.getBoundingClientRect();
  return {
    mx: (e.clientX - r.left) * (CW / r.width) - (renderState.current.ox || 0),
    my: (e.clientY - r.top) * (CH / r.height) - (renderState.current.oy || 0)
  };
}

export function findDragTarget(mx, my, renderState, feats, sections, maxH, wrap) {
  const { sc = 1, gap = 0, sections: secs = sections, maxH: mH = maxH } = renderState.current;

  // Check custom polygon points first
  let dxAcc2 = 0;
  for (let j = 0; j < secs.length; j++) {
    const sec = secs[j];
    const yOff = (mH - sec.h) * sc;
    if (sec.active && sec.isCustom && sec.points) {
      for (let pi = 0; pi < sec.points.length; pi++) {
        const px = dxAcc2 + sec.points[pi][0] * sc, py = yOff + sec.points[pi][1] * sc;
        if (Math.hypot(mx - px, my - py) < 12) {
          return { type: 'wallPt', wi: sec.idx, pi, sdx: dxAcc2, sdy: yOff };
        }
      }
    }
    dxAcc2 += sec.w * sc + (wrap ? gap : 0);
  }

  // Check features (reverse order so topmost wins)
  for (let i = feats.length - 1; i >= 0; i--) {
    const f = feats[i];
    const sec = secs.find(s => s.idx === f.wi);
    if (!sec) continue;
    let sdx2 = 0;
    for (let j = 0; j < secs.length; j++) {
      if (secs[j].idx === f.wi) break;
      sdx2 += secs[j].w * sc + (wrap ? gap : 0);
    }
    const yOff = (mH - sec.h) * sc;
    if (mx >= sdx2 + f.x * sc && mx <= sdx2 + (f.x + f.w) * sc && my >= yOff + f.y * sc && my <= yOff + (f.y + f.h) * sc) {
      return { type: 'feat', idx: i, dx: mx - sdx2 - f.x * sc, dy: my - yOff - f.y * sc, sdx: sdx2, sdy: yOff, sw: sec.w };
    }
  }

  // Click on wall section to select it (wrap mode)
  if (wrap && secs.length > 1) {
    let dx3 = 0;
    for (let j = 0; j < secs.length; j++) {
      const sec = secs[j];
      const sw3 = sec.w * sc, sh3 = sec.h * sc;
      const yO3 = (mH - sec.h) * sc;
      if (mx >= dx3 && mx <= dx3 + sw3 && my >= yO3 && my <= yO3 + sh3) {
        if (!sec.active) {
          return { type: 'selectWall', wallIdx: sec.idx };
        }
        break;
      }
      dx3 += sw3 + gap;
    }
  }

  return null;
}
