// ─── BUILD WALLS FOR 3D SCENE ────────────────────────────────────────────────
// Creates Three.js meshes for each wall with tile texture from canvas rendering.
// Uses window.THREE.

import { posOr } from '../../solver/utils.js';
import { tileBB } from '../../solver/tileBB.js';
import { generateTiles } from '../../solver/generateTiles.js';
import { FEAT_TYPES } from '../../domain/features.js';
import { invalidateCache } from './textureCache.js';

const SCALE = 40; // pixels per inch for texture resolution

function paintWallTexture(cv, wall, sec, allTiles, tile, grout, groutColor, maxH) {
  const ctx = cv.getContext('2d');
  const sc = SCALE;
  const gs = Math.max(0.6, grout * sc * 0.45);

  ctx.fillStyle = groutColor || '#c8ccd2';
  ctx.fillRect(0, 0, cv.width, cv.height);

  const drawT = t => {
    if (t.t === 'r') {
      const px = t.x * sc, py = t.y * sc, pw = t.w * sc, ph = t.h * sc;
<<<<<<< HEAD
      if (tile.img) {
        try { ctx.drawImage(tile.img, px, py, pw - gs, ph - gs); } catch(e) { ctx.fillStyle = t.c; ctx.fillRect(px, py, pw - gs, ph - gs); }
      } else {
        ctx.fillStyle = t.c; ctx.globalAlpha = 0.92;
        ctx.fillRect(px, py, pw - gs, ph - gs);
        ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff';
        ctx.fillRect(px, py, pw - gs, Math.max(1, ph * 0.018));
        ctx.fillStyle = '#000'; ctx.globalAlpha = 0.06;
        ctx.fillRect(px, py + ph - gs - 1, pw - gs, 1);
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.02;
        ctx.fillRect(px, py, 0.8, ph - gs);
        if (tile.type === 'marble' && pw > 6) {
          ctx.globalAlpha = 0.04; ctx.strokeStyle = tile.accent; ctx.lineWidth = 0.5;
          const sd = Math.abs(Math.round(t.x * 7 + t.y * 11)) % 10;
          ctx.beginPath(); ctx.moveTo(px + sd * 0.4, py + ph * 0.15);
          ctx.bezierCurveTo(px + pw * 0.3, py + ph * (0.2 + sd * 0.02), px + pw * 0.65, py + ph * (0.5 + sd * 0.01), px + pw - sd, py + ph * 0.75);
          ctx.stroke();
        }
        if (tile.type === 'zellige' && pw > 3) {
          const sh2 = Math.abs(Math.round(t.x * 3 + t.y * 5)) % 4;
          ctx.globalAlpha = 0.03 + sh2 * 0.008; ctx.fillStyle = '#fff';
          ctx.fillRect(px + pw * 0.08, py + ph * 0.08, pw * 0.25, ph * 0.18);
        }
=======
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.92;
      ctx.fillRect(px, py, pw - gs, ph - gs);
      ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff';
      ctx.fillRect(px, py, pw - gs, Math.max(1, ph * 0.018));
      ctx.fillStyle = '#000'; ctx.globalAlpha = 0.06;
      ctx.fillRect(px, py + ph - gs - 1, pw - gs, 1);
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.02;
      ctx.fillRect(px, py, 0.8, ph - gs);
      if (tile.type === 'marble' && pw > 6) {
        ctx.globalAlpha = 0.04; ctx.strokeStyle = tile.accent; ctx.lineWidth = 0.5;
        const sd = Math.abs(Math.round(t.x * 7 + t.y * 11)) % 10;
        ctx.beginPath(); ctx.moveTo(px + sd * 0.4, py + ph * 0.15);
        ctx.bezierCurveTo(px + pw * 0.3, py + ph * (0.2 + sd * 0.02), px + pw * 0.65, py + ph * (0.5 + sd * 0.01), px + pw - sd, py + ph * 0.75);
        ctx.stroke();
      }
      if (tile.type === 'zellige' && pw > 3) {
        const sh2 = Math.abs(Math.round(t.x * 3 + t.y * 5)) % 4;
        ctx.globalAlpha = 0.03 + sh2 * 0.008; ctx.fillStyle = '#fff';
        ctx.fillRect(px + pw * 0.08, py + ph * 0.08, pw * 0.25, ph * 0.18);
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      }
      ctx.globalAlpha = 1;
    } else if (t.t === 'rot') {
      const pcx = t.cx * sc, pcy = t.cy * sc, pw = t.w * sc, ph = t.h * sc;
      ctx.save(); ctx.translate(pcx, pcy); ctx.rotate(t.a);
<<<<<<< HEAD
      if (tile.img) {
        try { ctx.drawImage(tile.img, -pw / 2, -ph / 2, pw - gs, ph - gs); } catch(e) { ctx.fillStyle = t.c; ctx.fillRect(-pw / 2, -ph / 2, pw - gs, ph - gs); }
      } else {
        ctx.fillStyle = t.c; ctx.globalAlpha = 0.9;
        ctx.fillRect(-pw / 2, -ph / 2, pw - gs, ph - gs);
        ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff';
        ctx.fillRect(-pw / 2, -ph / 2, pw - gs, 1.5);
      }
      ctx.globalAlpha = 1; ctx.restore();
    } else if (t.t === 'para') {
      const pts = t.pts.map(p => [p[0] * sc, p[1] * sc]);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.closePath();
      if (tile.img) {
        try {
          ctx.save(); ctx.clip();
          const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
          ctx.drawImage(tile.img, Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
          ctx.restore();
        } catch(e) { ctx.fillStyle = t.c; ctx.fill(); }
      } else {
        ctx.fillStyle = t.c; ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
=======
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.9;
      ctx.fillRect(-pw / 2, -ph / 2, pw - gs, ph - gs);
      ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff';
      ctx.fillRect(-pw / 2, -ph / 2, pw - gs, 1.5);
      ctx.globalAlpha = 1; ctx.restore();
    } else if (t.t === 'para') {
      const pts = t.pts.map(p => [p[0] * sc, p[1] * sc]);
      ctx.fillStyle = t.c; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    }
  };

  const yOffset = (maxH - wall.h) * sc;
  ctx.save();
  ctx.translate(-sec.xTile * sc, -yOffset);
  const wallL = sec.xTile, wallR = sec.xTile + sec.w;
  const wallT = maxH - wall.h, wallB = maxH;
  const pad3d = Math.max(tile.w, tile.h) * 2;
  allTiles.forEach(t => {
    const bb = tileBB(t);
    if (bb[2] < wallL - pad3d || bb[0] > wallR + pad3d) return;
    if (bb[3] < wallT - pad3d || bb[1] > wallB + pad3d) return;
    drawT(t);
  });
  ctx.restore();
}

export function buildWalls(group, walls, feats, wrap, activeWallIdx, tile, pat, grout, groutColor, pro, viewMode, texCacheRef, rendererRef) {
  const THREE = window.THREE;

  // Dispose old meshes
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (c.material.map) c.material.map.dispose();
        c.material.dispose();
      }
    });
  }

  const sections = [];
  let txAcc = 0;
  walls.forEach((w, i) => { sections.push({ xTile: txAcc, w: posOr(w.w, 1), h: posOr(w.h, 1), idx: i }); txAcc += posOr(w.w, 1); });
  const totalTW = sections.reduce((s, sec) => s + sec.w, 0);
  const maxH = Math.max(1, ...sections.map(s => s.h));
  const gxo = pro?.globalXOff || 0, gyo = pro?.globalYOff || 0;
  const allTiles = generateTiles(totalTW, maxH, tile, pat, grout, gxo, gyo);

  const globalCacheTag = `${tile.id}-${pat}-${grout}-${groutColor}-${gxo.toFixed(4)}-${gyo.toFixed(4)}-${maxH}`;
  invalidateCache(texCacheRef, globalCacheTag);

  let curX = 0;
  walls.forEach((w, i) => {
    const isCustom = w.isCustom && w.points?.length > 2;
    const shape = new THREE.Shape();
    const flipY = y => w.h - y;

    if (isCustom) {
      shape.moveTo(w.points[0][0], flipY(w.points[0][1]));
      for (let p = 1; p < w.points.length; p++) shape.lineTo(w.points[p][0], flipY(w.points[p][1]));
      shape.closePath();
    } else {
      shape.moveTo(0, flipY(w.h)); shape.lineTo(w.w, flipY(w.h));
      shape.lineTo(w.w, flipY(0)); shape.lineTo(0, flipY(0)); shape.closePath();
    }

    feats.filter(f => f.wi === i).forEach(f => {
      const ft = FEAT_TYPES.find(t => t.id === f.type);
      if (ft?.isHole || f.type === 'window' || f.type === 'niche') {
        const hole = new THREE.Path();
        hole.moveTo(f.x, flipY(f.y)); hole.lineTo(f.x + f.w, flipY(f.y));
        hole.lineTo(f.x + f.w, flipY(f.y + f.h)); hole.lineTo(f.x, flipY(f.y + f.h));
        hole.closePath();
        shape.holes.push(hole);
      }
    });

    const geometry = new THREE.ShapeGeometry(shape);
    const posAttr = geometry.attributes.position;
    const uvs = new Float32Array(posAttr.count * 2);
    for (let j = 0; j < posAttr.count; j++) {
      uvs[j * 2] = posAttr.getX(j) / w.w;
      uvs[j * 2 + 1] = posAttr.getY(j) / w.h;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const sec = sections.find(s => s.idx === i);
    const outside = viewMode === 'outside';
    const backMat = new THREE.MeshStandardMaterial({
      color: outside ? 0xe8ecf1 : 0xdde3ec,
      side: THREE.BackSide, roughness: 0.9, metalness: 0.05
    });

    let frontMat;
    if (sec && allTiles) {
      const cacheKey = `wall${i}-${w.w}x${w.h}`;
      let tex = texCacheRef.current.get(cacheKey);
      if (!tex) {
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.ceil(w.w * SCALE));
        cv.height = Math.max(1, Math.ceil(w.h * SCALE));
        paintWallTexture(cv, w, sec, allTiles, tile, grout, groutColor, maxH);
        tex = new THREE.CanvasTexture(cv);
        tex.encoding = THREE.sRGBEncoding;
        if (rendererRef.current?.capabilities?.getMaxAnisotropy) {
          tex.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
        }
        tex.needsUpdate = true;
        texCacheRef.current.set(cacheKey, tex);
      }
      frontMat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.FrontSide, roughness: 0.3, metalness: 0.02 });
      if (i !== activeWallIdx && !wrap) frontMat.color.setHex(0xcccccc);
    } else {
      frontMat = new THREE.MeshStandardMaterial({ color: 0xd0d7e2, side: THREE.FrontSide, roughness: 0.8 });
    }

    const wallGroup = new THREE.Group();
    wallGroup.add(new THREE.Mesh(geometry, frontMat));
    wallGroup.add(new THREE.Mesh(geometry, backMat));
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: i === activeWallIdx ? 0x3b82f6 : 0xbbc5d3, linewidth: 2 })
    );
    wallGroup.add(wire);
<<<<<<< HEAD
    
    const isFloor = w.name?.toLowerCase().includes('floor');
    const isCeiling = w.name?.toLowerCase().includes('ceiling');

    if (isFloor) {
      wallGroup.rotation.x = -Math.PI / 2;
      wallGroup.position.set(0, 0, 0);
      if (wrap) {
        const backW = walls.find(ww => ww.name?.toLowerCase().includes('back'))?.w || walls[1]?.w || 60;
        wallGroup.position.set(0, 0, backW);
      }
    } else if (isCeiling) {
      const maxWallH = Math.max(...walls.filter(ww => !ww.name?.toLowerCase().includes('floor') && !ww.name?.toLowerCase().includes('ceiling')).map(ww => ww.h || 0), 96);
      wallGroup.rotation.x = -Math.PI / 2;
      wallGroup.position.set(0, maxWallH, 0);
      if (wrap) {
        const backW = walls.find(ww => ww.name?.toLowerCase().includes('back'))?.w || walls[1]?.w || 60;
        wallGroup.position.set(0, maxWallH, backW);
      }
    } else if (wrap) {
=======

    if (wrap) {
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
      if (outside) {
        const w1w = walls[1]?.w || 60, w0w = walls[0]?.w || 36;
        if      (i === 0) { wallGroup.rotation.y = -Math.PI / 2;  wallGroup.position.set(0, 0, 0); }
        else if (i === 1) { wallGroup.rotation.y = Math.PI;       wallGroup.position.set(w1w, 0, 0); }
        else if (i === 2) { wallGroup.rotation.y = Math.PI / 2;   wallGroup.position.set(w1w, 0, w0w); }
        else if (i === 3) { wallGroup.rotation.y = 0;             wallGroup.position.set(0, 0, w0w); }
        else              { wallGroup.position.set(curX, 0, 0); curX += w.w; }
      } else {
        if      (i === 0) { wallGroup.rotation.y = Math.PI / 2;   wallGroup.position.set(0, 0, w.w); }
        else if (i === 1) { wallGroup.rotation.y = 0;             wallGroup.position.set(0, 0, 0); }
        else if (i === 2) { wallGroup.rotation.y = -Math.PI / 2;  wallGroup.position.set(walls[1]?.w || 0, 0, 0); }
        else if (i === 3) { wallGroup.rotation.y = Math.PI;       wallGroup.position.set(walls[1]?.w || 0, 0, w.w); }
        else              { wallGroup.position.set(curX, 0, 0); curX += w.w; }
      }
    } else {
      if (outside) {
        wallGroup.rotation.y = Math.PI;
        wallGroup.position.set(curX + w.w, 0, 0); curX += w.w + 10;
      } else {
        wallGroup.position.set(curX, 0, 0); curX += w.w + 10;
      }
    }
    group.add(wallGroup);
  });

  // Recenter and fit camera
  const bbox = new THREE.Box3().setFromObject(group);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  group.position.set(-center.x, -center.y, -center.z);

  const orb = window._orbitRef;
  if (orb) {
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitDist = maxDim * 1.8;
    orb.distance = fitDist; orb.tDist = fitDist; orb.defaultDist = fitDist;
    orb.panX = 0; orb.panY = 0; orb.tPanX = 0; orb.tPanY = 0;
    orb.needsUpdate = true;
  }
}
