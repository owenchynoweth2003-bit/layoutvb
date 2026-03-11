// ─── BUILD WALLS FOR 3D SCENE ────────────────────────────────────────────────
import { posOr } from '../../solver/utils.js';
import { tileBB } from '../../solver/tileBB.js';
import { generateTiles } from '../../solver/generateTiles.js';
import { FEAT_TYPES } from '../../domain/features.js';
import { invalidateCache } from './textureCache.js';

const SCALE = 40;

function paintWallTexture(cv, wall, sec, allTiles, tile, grout, groutColor, maxH) {
  const ctx = cv.getContext('2d');
  const sc = SCALE, gs = Math.max(0.6, grout * sc * 0.45);
  ctx.fillStyle = groutColor || '#c8ccd2';
  ctx.fillRect(0, 0, cv.width, cv.height);
  const drawT = t => {
    if (t.t === 'r') {
      const px = t.x * sc, py = t.y * sc, pw = t.w * sc, ph = t.h * sc, tw = pw - gs, th = ph - gs;
      if (tile.img) {
        try { ctx.save(); ctx.beginPath(); ctx.rect(px, py, tw, th); ctx.clip(); ctx.drawImage(tile.img, px, py, tw, th); ctx.restore(); }
        catch(e) { ctx.fillStyle = t.c; ctx.fillRect(px, py, tw, th); }
      } else {
        ctx.fillStyle = t.c; ctx.globalAlpha = 0.92; ctx.fillRect(px, py, tw, th);
        ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff'; ctx.fillRect(px, py, tw, Math.max(1, th * 0.02));
        ctx.fillStyle = '#000'; ctx.globalAlpha = 0.04; ctx.fillRect(px, py + th - 1, tw, 1);
        if (tile.type === 'marble' && tw > 6) { ctx.globalAlpha = 0.04; ctx.strokeStyle = tile.accent; ctx.lineWidth = 0.5; const sd = Math.abs(Math.round(t.x * 7 + t.y * 11)) % 10; ctx.beginPath(); ctx.moveTo(px + sd * 0.4, py + th * 0.15); ctx.bezierCurveTo(px + tw * 0.3, py + th * 0.25, px + tw * 0.65, py + th * 0.55, px + tw - sd, py + th * 0.75); ctx.stroke(); }
        if (tile.type === 'penny') { ctx.globalAlpha = 0.06; ctx.strokeStyle = tile.accent || '#999'; ctx.lineWidth = 0.3; const r = Math.min(tw, th) * 0.45; ctx.beginPath(); ctx.arc(px + tw/2, py + th/2, r, 0, Math.PI*2); ctx.stroke(); }
        if (tile.type === 'ledge' && tw > 4) { const seed = Math.abs(Math.round(t.x*5+t.y*9))%8; const strips = 3+(seed%3), sH = th/strips; for(let s=0;s<strips;s++){ctx.globalAlpha=0.04+(s%2)*0.03;ctx.fillStyle=s%2===0?'#000':'#fff';ctx.fillRect(px+0.5,py+s*sH+0.5,tw-1,sH-0.8);}}
      }
      ctx.globalAlpha = 1;
    } else if (t.t === 'rot') {
      const pcx = t.cx * sc, pcy = t.cy * sc, pw = t.w * sc, ph = t.h * sc;
      ctx.save(); ctx.translate(pcx, pcy); ctx.rotate(t.a);
      if (tile.img) { try { ctx.drawImage(tile.img, -pw/2, -ph/2, pw-gs, ph-gs); } catch(e) { ctx.fillStyle = t.c; ctx.fillRect(-pw/2, -ph/2, pw-gs, ph-gs); } }
      else { ctx.fillStyle = t.c; ctx.globalAlpha = 0.9; ctx.fillRect(-pw/2, -ph/2, pw-gs, ph-gs); }
      ctx.globalAlpha = 1; ctx.restore();
    } else if (t.t === 'para') {
      const pts = t.pts.map(p => [p[0]*sc, p[1]*sc]);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for(let k=1;k<pts.length;k++) ctx.lineTo(pts[k][0], pts[k][1]); ctx.closePath();
      if (tile.img) { try { ctx.save(); ctx.clip(); const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]); ctx.drawImage(tile.img, Math.min(...xs), Math.min(...ys), Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys)); ctx.restore(); } catch(e) { ctx.fillStyle = t.c; ctx.fill(); } }
      else { ctx.fillStyle = t.c; ctx.globalAlpha = 0.9; ctx.fill(); }
      ctx.globalAlpha = 1;
    }
  };
  const yOff = (maxH - wall.h) * sc;
  ctx.save(); ctx.translate(-sec.xTile * sc, -yOff);
  const wL = sec.xTile, wR = sec.xTile + sec.w, wT = maxH - wall.h, wB = maxH, pad = Math.max(tile.w, tile.h) * 2;
  allTiles.forEach(t => { const bb = tileBB(t); if (bb[2] < wL - pad || bb[0] > wR + pad || bb[3] < wT - pad || bb[1] > wB + pad) return; drawT(t); });
  ctx.restore();
}

function classifyWall(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('floor')) return 'floor';
  if (n.includes('ceiling') || n.includes('ceil')) return 'ceiling';
  if (n.includes('left')) return 'left';
  if (n.includes('right')) return 'right';
  if (n.includes('back')) return 'back';
  if (n.includes('front')) return 'front';
  return 'wall';
}

// ─── FLOOR: always face UP (tiles visible from above) ────────────────────────
function buildFloorTransform(w, backW, depth, maxH) {
  // rx=-π/2: (x,y,0)→(x,0,-y), normal→(0,+1,0)=UP.
  // Floor sits at ground level y=0, spanning x and z to connect wall bases.
  // pz=depth (not w.h) ensures floor aligns with room depth even if floor dimensions differ.
  return { rx: -Math.PI / 2, ry: 0, px: 0, py: 0, pz: Math.max(w.h, depth) };
}

// ─── CEILING: always face DOWN (tiles visible from below) ────────────────────
function buildCeilingTransform(w, backW, depth, maxH) {
  // rx=+π/2: (x,y,0)→(x,0,y), normal→(0,-1,0)=DOWN. py=maxH elevates to top.
  return { rx: Math.PI / 2, ry: 0, px: 0, py: maxH, pz: 0 };
}

// ─── WALL: rotated to form room enclosure ────────────────────────────────────
function buildWallTransform(role, idx, w, backW, depth, outside) {
  // Inside: tile face points INWARD. Outside: tile face points OUTWARD.
  if (outside) {
    // Outside view: front face (tile) points away from room center
    switch (role) {
      case 'left':  return { rx: 0, ry: -Math.PI/2, px: 0,     py: 0, pz: 0 };
      case 'back':  return { rx: 0, ry: Math.PI,    px: backW,  py: 0, pz: 0 };
      case 'right': return { rx: 0, ry: Math.PI/2,  px: backW,  py: 0, pz: depth };
      case 'front': return { rx: 0, ry: 0,          px: 0,      py: 0, pz: depth };
      default:
        if (idx===0) return { rx: 0, ry: -Math.PI/2, px: 0,    py: 0, pz: 0 };
        if (idx===1) return { rx: 0, ry: Math.PI,    px: backW, py: 0, pz: 0 };
        if (idx===2) return { rx: 0, ry: Math.PI/2,  px: backW, py: 0, pz: depth };
        if (idx===3) return { rx: 0, ry: 0,          px: 0,     py: 0, pz: depth };
        return null;
    }
  } else {
    // Inside view: front face (tile) points inward toward room center
    switch (role) {
      case 'left':  return { rx: 0, ry: Math.PI/2,  px: 0,     py: 0, pz: w.w };
      case 'back':  return { rx: 0, ry: 0,          px: 0,     py: 0, pz: 0 };
      case 'right': return { rx: 0, ry: -Math.PI/2, px: backW,  py: 0, pz: 0 };
      case 'front': return { rx: 0, ry: Math.PI,    px: backW,  py: 0, pz: w.w };
      default:
        if (idx===0) return { rx: 0, ry: Math.PI/2,  px: 0,    py: 0, pz: w.w };
        if (idx===1) return { rx: 0, ry: 0,          px: 0,     py: 0, pz: 0 };
        if (idx===2) return { rx: 0, ry: -Math.PI/2, px: backW, py: 0, pz: 0 };
        if (idx===3) return { rx: 0, ry: Math.PI,    px: backW, py: 0, pz: w.w };
        return null;
    }
  }
}

export function buildWalls(group, walls, feats, wrap, activeWallIdx, tile, pat, grout, groutColor, pro, viewMode, texCacheRef, rendererRef, usePerWallPat, getWallPattern, usePerWallTile, getWallTile) {
  const THREE = window.THREE;
  while (group.children.length) { const c = group.children[0]; group.remove(c); c.traverse(m => { if(m.geometry)m.geometry.dispose(); if(m.material){if(m.material.map)m.material.map.dispose();m.material.dispose();}}); }

  const sections = []; let txAcc = 0;
  walls.forEach((w, i) => { sections.push({ xTile: txAcc, w: posOr(w.w, 1), h: posOr(w.h, 1), idx: i }); txAcc += posOr(w.w, 1); });
  const totalTW = sections.reduce((s, sec) => s + sec.w, 0);
  const maxH = Math.max(1, ...sections.map(s => s.h));
  const gxo = pro?.globalXOff || 0, gyo = pro?.globalYOff || 0;

  const globalCacheTag = `${tile.id}-${pat}-${grout}-${groutColor}-${gxo.toFixed(4)}-${gyo.toFixed(4)}-${maxH}`;
  invalidateCache(texCacheRef, globalCacheTag);

  // Enclosure dimensions
  const classified = walls.map((w, i) => ({ ...w, idx: i, role: classifyWall(w.name) }));
  const wallsOnly = classified.filter(c => c.role !== 'floor' && c.role !== 'ceiling');
  const maxWallH = Math.max(1, ...wallsOnly.map(c => posOr(c.h, 1)));
  const backWall = classified.find(c => c.role === 'back');
  const leftWall = classified.find(c => c.role === 'left');
  const rightWall = classified.find(c => c.role === 'right');
  const backW = backWall ? posOr(backWall.w, 60) : classified.length >= 3 ? posOr(classified[1].w, 60) : posOr(classified[0]?.w, 60);
  const depth = leftWall ? posOr(leftWall.w, 36) : rightWall ? posOr(rightWall.w, 36) : classified.length >= 3 ? posOr(classified[0].w, 36) : 36;
  const outside = viewMode === 'outside';

  let curX = 0;
  walls.forEach((w, i) => {
    const role = classifyWall(w.name);
    const surfaceTile = (usePerWallTile && getWallTile) ? getWallTile(i, tile) : tile;
    const surfacePat = (usePerWallPat && getWallPattern) ? getWallPattern(i, pat) : pat;

    // Generate tiles with THIS surface's tile dimensions and pattern
    const surfaceTiles = generateTiles(totalTW, maxH, surfaceTile, surfacePat, grout, gxo, gyo);

    const isCustom = w.isCustom && w.points?.length > 2;
    const shape = new THREE.Shape();
    const flipY = y => w.h - y;
    if (isCustom) { shape.moveTo(w.points[0][0], flipY(w.points[0][1])); for (let p = 1; p < w.points.length; p++) shape.lineTo(w.points[p][0], flipY(w.points[p][1])); shape.closePath(); }
    else { shape.moveTo(0, 0); shape.lineTo(w.w, 0); shape.lineTo(w.w, w.h); shape.lineTo(0, w.h); shape.closePath(); }

    feats.filter(f => f.wi === i).forEach(f => {
      const ft = FEAT_TYPES.find(t => t.id === f.type);
      if (ft?.isHole || f.type === 'window' || f.type === 'niche') {
        const hole = new THREE.Path(); hole.moveTo(f.x, flipY(f.y)); hole.lineTo(f.x+f.w, flipY(f.y)); hole.lineTo(f.x+f.w, flipY(f.y+f.h)); hole.lineTo(f.x, flipY(f.y+f.h)); hole.closePath(); shape.holes.push(hole);
      }
    });

    const geometry = new THREE.ShapeGeometry(shape);
    const posAttr = geometry.attributes.position;
    const uvs = new Float32Array(posAttr.count * 2);
    for (let j = 0; j < posAttr.count; j++) { uvs[j*2] = posAttr.getX(j) / w.w; uvs[j*2+1] = posAttr.getY(j) / w.h; }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const sec = sections.find(s => s.idx === i);
    const backMat = new THREE.MeshStandardMaterial({ color: outside ? 0xe8ecf1 : 0xdde3ec, side: THREE.BackSide, roughness: 0.9, metalness: 0.05 });

    let frontMat;
    if (sec && surfaceTiles) {
      const cacheKey = `w${i}-${w.w}x${w.h}-${role}-${surfacePat}-${surfaceTile.id}-${surfaceTile.img?'i':'n'}-${surfaceTile.w}x${surfaceTile.h}`;
      let tex = texCacheRef.current.get(cacheKey);
      if (!tex) {
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.ceil(w.w * SCALE)); cv.height = Math.max(1, Math.ceil(w.h * SCALE));
        paintWallTexture(cv, w, sec, surfaceTiles, surfaceTile, grout, groutColor, maxH);
        tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
        if (rendererRef.current?.capabilities?.getMaxAnisotropy) tex.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
        tex.needsUpdate = true; texCacheRef.current.set(cacheKey, tex);
      }
      frontMat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.FrontSide, roughness: 0.3, metalness: 0.02 });
      if (i !== activeWallIdx && !wrap) frontMat.color.setHex(0xcccccc);
    } else {
      frontMat = new THREE.MeshStandardMaterial({ color: 0xd0d7e2, side: THREE.FrontSide, roughness: 0.8 });
    }

    const wallGroup = new THREE.Group();
    wallGroup.add(new THREE.Mesh(geometry, frontMat));
    wallGroup.add(new THREE.Mesh(geometry, backMat));
    wallGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: i === activeWallIdx ? 0x3b82f6 : 0xbbc5d3, linewidth: 2 })));

    if (wrap) {
      let tf;
      if (role === 'floor') tf = buildFloorTransform(w, backW, depth, maxWallH);
      else if (role === 'ceiling') tf = buildCeilingTransform(w, backW, depth, maxWallH);
      else tf = buildWallTransform(role, i, w, backW, depth, outside);
      if (tf) { wallGroup.rotation.set(tf.rx, tf.ry, 0); wallGroup.position.set(tf.px, tf.py, tf.pz); }
      else { wallGroup.position.set(curX, 0, 0); curX += w.w; }
    } else {
      if (outside) { wallGroup.rotation.y = Math.PI; wallGroup.position.set(curX + w.w, 0, 0); }
      else { wallGroup.position.set(curX, 0, 0); }
      curX += w.w + 10;
    }
    group.add(wallGroup);
  });

  const bbox = new THREE.Box3().setFromObject(group);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  group.position.set(-center.x, -center.y, -center.z);
  const orb = window._orbitRef;
  if (orb) { const d = Math.max(size.x, size.y, size.z) * 1.8; orb.distance = d; orb.tDist = d; orb.defaultDist = d; orb.panX = 0; orb.panY = 0; orb.tPanX = 0; orb.tPanY = 0; orb.needsUpdate = true; }
}
