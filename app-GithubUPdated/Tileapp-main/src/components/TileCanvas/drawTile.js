// ─── TILE DRAWING FOR 2D CANVAS ──────────────────────────────────────────────
// Draws individual tiles onto a 2D canvas context. Used by TileCanvas.

export function drawTile(ctx, t, tile, gs, cL, cR, cT, cB, sc) {
  const bleed = 200 * sc;
  if (t.t === 'r') {
    const px = t.x * sc, py = t.y * sc, pw = t.w * sc, ph = t.h * sc;
<<<<<<< HEAD
    if (tile.img) {
      try {
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, pw - gs, ph - gs);
        ctx.clip();
        ctx.drawImage(tile.img, px, py, pw - gs, ph - gs);
        ctx.restore();
      } catch (e) {
        ctx.fillStyle = tile.color || '#ccc';
        ctx.fillRect(px, py, pw - gs, ph - gs);
      }
=======
    if (px + pw < cL - bleed || px > cR + bleed || py + ph < cT - bleed || py > cB + bleed) return;
    
    if (tile.img) {
      ctx.drawImage(tile.img, px, py, pw - gs, ph - gs);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    } else {
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.92; ctx.fillRect(px, py, pw - gs, ph - gs);
      ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff'; ctx.fillRect(px, py, pw - gs, Math.max(1, ph * 0.018));
      ctx.fillStyle = '#000'; ctx.globalAlpha = 0.06; ctx.fillRect(px, py + ph - gs - 1, pw - gs, 1);
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.02; ctx.fillRect(px, py, 0.8, ph - gs);
    }
    
    if (!tile.img && tile.type === 'marble' && pw > 6) {
      ctx.globalAlpha = 0.04; ctx.strokeStyle = tile.accent; ctx.lineWidth = 0.5;
      const sd = Math.abs(Math.round(t.x * 7 + t.y * 11)) % 10;
      ctx.beginPath(); ctx.moveTo(px + sd * 0.4, py + ph * 0.15);
      ctx.bezierCurveTo(px + pw * 0.3, py + ph * (0.2 + sd * 0.02), px + pw * 0.65, py + ph * (0.5 + sd * 0.01), px + pw - sd, py + ph * 0.75);
      ctx.stroke();
    }
<<<<<<< HEAD
    if (!tile.img && tile.type === 'zellige' && pw > 3) {
=======
    if (tile.type === 'zellige' && pw > 3) {
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      const sh2 = Math.abs(Math.round(t.x * 3 + t.y * 5)) % 4;
      ctx.globalAlpha = 0.03 + sh2 * 0.008; ctx.fillStyle = '#fff';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.08, pw * 0.25, ph * 0.18);
    }
    ctx.globalAlpha = 1;
  } else if (t.t === 'rot') {
    const pcx = t.cx * sc, pcy = t.cy * sc, pw = t.w * sc, ph = t.h * sc;
    if (pcx < cL - 60 || pcx > cR + 60 || pcy < cT - 60 || pcy > cB + 60) return;
    ctx.save(); ctx.translate(pcx, pcy); ctx.rotate(t.a);
<<<<<<< HEAD
    if (tile.img) {
      try {
        ctx.beginPath();
        ctx.rect(-pw / 2, -ph / 2, pw - gs, ph - gs);
        ctx.clip();
        ctx.drawImage(tile.img, -pw / 2, -ph / 2, pw - gs, ph - gs);
      } catch (e) {
        ctx.fillStyle = tile.color || '#ccc';
        ctx.fillRect(-pw / 2, -ph / 2, pw - gs, ph - gs);
      }
    } else {
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.9; ctx.fillRect(-pw / 2, -ph / 2, pw - gs, ph - gs);
      ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff'; ctx.fillRect(-pw / 2, -ph / 2, pw - gs, 1.5);
    }
=======
    ctx.fillStyle = t.c; ctx.globalAlpha = 0.9; ctx.fillRect(-pw / 2, -ph / 2, pw - gs, ph - gs);
    ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff'; ctx.fillRect(-pw / 2, -ph / 2, pw - gs, 1.5);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    ctx.globalAlpha = 1; ctx.restore();
  } else if (t.t === 'para') {
    const pts = t.pts.map(p => [p[0] * sc, p[1] * sc]);
    const xs2 = pts.map(p => p[0]), ys2 = pts.map(p => p[1]);
    if (Math.max(...xs2) < cL - bleed || Math.min(...xs2) > cR + bleed || Math.max(...ys2) < cT - bleed || Math.min(...ys2) > cB + bleed) return;
<<<<<<< HEAD
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (tile.img) {
      try {
        ctx.clip();
        const minPx = Math.min(...xs2), minPy = Math.min(...ys2);
        const maxPx = Math.max(...xs2), maxPy = Math.max(...ys2);
        ctx.drawImage(tile.img, minPx, minPy, maxPx - minPx, maxPy - minPy);
      } catch (e) { ctx.fillStyle = tile.color || '#ccc'; ctx.fill(); }
    } else {
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.9;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
=======
    ctx.fillStyle = t.c; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
  }
}
