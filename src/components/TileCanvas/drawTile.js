// ─── TILE DRAWING FOR 2D CANVAS ──────────────────────────────────────────────
export function drawTile(ctx, t, tile, gs, cL, cR, cT, cB, sc) {
  const bleed = 200 * sc;
  const mode = tile.textureMode || 'single';

  if (t.t === 'r') {
    const px = t.x * sc, py = t.y * sc, pw = t.w * sc, ph = t.h * sc;
    if (px + pw < cL - bleed || px > cR + bleed || py + ph < cT - bleed || py > cB + bleed) return;
    const tw = pw - gs, th = ph - gs;

    if (tile.img) {
      try {
        ctx.save(); ctx.beginPath(); ctx.rect(px, py, tw, th); ctx.clip();
        if (mode === 'repeat') {
          const rw = tw * 0.5, rh = th * 0.5;
          for (let rx = 0; rx < tw; rx += rw) for (let ry = 0; ry < th; ry += rh) ctx.drawImage(tile.img, px + rx, py + ry, rw, rh);
        } else if (mode === 'sheet') {
          const fw = tile.w * sc, fh = tile.h * sc;
          const cx = Math.floor(t.x / (tile.w + 0.001)) * tile.w, cy = Math.floor(t.y / (tile.h + 0.001)) * tile.h;
          ctx.drawImage(tile.img, cx * sc, cy * sc, fw * 3, fh * 3);
        } else if (mode === 'book') {
          const col = Math.floor(t.x / (t.w + 0.001));
          if (col % 2 !== 0) { ctx.translate(px + tw, py); ctx.scale(-1, 1); ctx.drawImage(tile.img, 0, 0, tw, th); }
          else ctx.drawImage(tile.img, px, py, tw, th);
        } else {
          ctx.drawImage(tile.img, px, py, tw, th);
        }
        ctx.restore();
      } catch (e) { ctx.fillStyle = tile.color || '#ccc'; ctx.fillRect(px, py, tw, th); }
    } else if (tile.type === 'penny') {
      // Penny round: draw circles on a sheet
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, tw, th); ctx.clip();
      // Grout background
      ctx.fillStyle = tile.accent || '#d5d0c8'; ctx.fillRect(px, py, tw, th);
      // Penny rounds: 3/4" diameter, hex stagger
      const diam = 0.75 * sc;
      const rad = diam * 0.46;
      const gapX = diam * 1.08; // horizontal spacing
      const gapY = diam * 0.94; // vertical spacing (hex)
      // Use absolute coords for seamless flow across tile boundaries
      const startX = Math.floor((px - gapX) / gapX) * gapX;
      const startY = Math.floor((py - gapY) / gapY) * gapY;
      for (let gy = startY; gy < py + th + gapY; gy += gapY) {
        const rowNum = Math.round(gy / gapY);
        const xShift = (rowNum % 2) * (gapX * 0.5);
        for (let gx = startX + xShift; gx < px + tw + gapX; gx += gapX) {
          if (gx + rad < px || gx - rad > px + tw || gy + rad < py || gy - rad > py + th) continue;
          // Circle body
          ctx.fillStyle = tile.color; ctx.globalAlpha = 0.95;
          ctx.beginPath(); ctx.arc(gx, gy, rad, 0, Math.PI * 2); ctx.fill();
          // Edge shadow
          ctx.globalAlpha = 0.06; ctx.strokeStyle = '#000'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(gx, gy, rad, 0, Math.PI * 2); ctx.stroke();
          // Top-left highlight
          ctx.globalAlpha = 0.1; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(gx - rad * 0.18, gy - rad * 0.18, rad * 0.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1; ctx.restore();
    } else {
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.92; ctx.fillRect(px, py, tw, th);
      ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff'; ctx.fillRect(px, py, tw, Math.max(1, th * 0.018));
      ctx.fillStyle = '#000'; ctx.globalAlpha = 0.04; ctx.fillRect(px, py + th - 1, tw, 1);
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.02; ctx.fillRect(px, py, 0.8, th);
      if (tile.type === 'ledge' && tw > 4) {
        const seed = Math.abs(Math.round(t.x * 5 + t.y * 9)) % 8;
        const strips = 3 + (seed % 3), sH = th / strips;
        for (let s = 0; s < strips; s++) { ctx.globalAlpha = 0.04 + (s % 2) * 0.03; ctx.fillStyle = s % 2 === 0 ? '#000' : '#fff'; ctx.fillRect(px + 0.5, py + s * sH + 0.5, tw - 1, sH - 0.8); ctx.globalAlpha = 0.08; ctx.strokeStyle = tile.accent || '#666'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(px, py + (s + 1) * sH); for (let jx = 0; jx < tw; jx += 4 + (seed + s) % 3) ctx.lineTo(px + jx, py + (s + 1) * sH + ((jx + seed * s) % 3 - 1) * 0.4); ctx.stroke(); }
      }
      if (tile.type === 'marble' && tw > 6) { ctx.globalAlpha = 0.04; ctx.strokeStyle = tile.accent; ctx.lineWidth = 0.5; const sd = Math.abs(Math.round(t.x * 7 + t.y * 11)) % 10; ctx.beginPath(); ctx.moveTo(px + sd * 0.4, py + th * 0.15); ctx.bezierCurveTo(px + tw * 0.3, py + th * 0.25, px + tw * 0.65, py + th * 0.55, px + tw - sd, py + th * 0.75); ctx.stroke(); }
      if (tile.type === 'zellige' && tw > 3) { const sh2 = Math.abs(Math.round(t.x * 3 + t.y * 5)) % 4; ctx.globalAlpha = 0.03 + sh2 * 0.008; ctx.fillStyle = '#fff'; ctx.fillRect(px + tw * 0.08, py + th * 0.08, tw * 0.25, th * 0.18); }
    }
    ctx.globalAlpha = 1;
  } else if (t.t === 'rot') {
    const pcx = t.cx * sc, pcy = t.cy * sc, pw = t.w * sc, ph = t.h * sc;
    if (pcx < cL - 60 || pcx > cR + 60 || pcy < cT - 60 || pcy > cB + 60) return;
    const tw = pw - gs, th = ph - gs;
    ctx.save(); ctx.translate(pcx, pcy); ctx.rotate(t.a);
    if (tile.img) { try { ctx.beginPath(); ctx.rect(-pw/2, -ph/2, tw, th); ctx.clip(); ctx.drawImage(tile.img, -pw/2, -ph/2, tw, th); } catch(e) { ctx.fillStyle = tile.color || '#ccc'; ctx.fillRect(-pw/2, -ph/2, tw, th); } }
    else { ctx.fillStyle = t.c; ctx.globalAlpha = 0.9; ctx.fillRect(-pw/2, -ph/2, tw, th); ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff'; ctx.fillRect(-pw/2, -ph/2, tw, 1.5); }
    ctx.globalAlpha = 1; ctx.restore();
  } else if (t.t === 'para') {
    const pts = t.pts.map(p => [p[0] * sc, p[1] * sc]);
    const xs2 = pts.map(p => p[0]), ys2 = pts.map(p => p[1]);
    if (Math.max(...xs2) < cL - bleed || Math.min(...xs2) > cR + bleed || Math.max(...ys2) < cT - bleed || Math.min(...ys2) > cB + bleed) return;
    ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
    if (tile.img) { try { ctx.clip(); const minPx = Math.min(...xs2), minPy = Math.min(...ys2); ctx.drawImage(tile.img, minPx, minPy, Math.max(...xs2) - minPx, Math.max(...ys2) - minPy); } catch(e) { ctx.fillStyle = tile.color || '#ccc'; ctx.fill(); } }
    else { ctx.fillStyle = t.c; ctx.globalAlpha = 0.9; ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
  }
}
