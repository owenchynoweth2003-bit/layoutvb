// ─── THREE.JS SCENE HOOK ─────────────────────────────────────────────────────
// Initializes scene, camera, orbit controls, HUD viewcube, event handlers.
// Uses window.THREE (loaded via CDN script tag).

import { useState, useEffect, useRef } from 'react';
import { clamp } from '../../solver/utils.js';

export function useThreeScene(mountRef, hudRef) {
  const sceneRef     = useRef(null);
  const rendererRef  = useRef(null);
  const groupRef     = useRef(null);
  const texCacheRef  = useRef(new Map());
  const [loaded, setLoaded] = useState(typeof window.THREE !== 'undefined');

  // Load Three.js CDN
  useEffect(() => {
    if (loaded) return;
    const script   = document.createElement('script');
    script.src     = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload  = () => setLoaded(true);
    document.head.appendChild(script);
  }, [loaded]);

  // Init scenes
  useEffect(() => {
    if (!loaded || !mountRef.current || !hudRef.current || sceneRef.current) return;
    const THREE  = window.THREE;
    const width  = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Main scene
    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f3f7);
    const camera   = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    camera.position.set(0, 100, 300);
    scene.add(camera);

<<<<<<< HEAD
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
=======
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(100, 250, 180);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xf0f4ff, 0.2);
    fill.position.set(-80, 50, -100);
    scene.add(fill);

    const group = new THREE.Group();
    group.rotation.order = 'YXZ';
    scene.add(group);
    group.rotation.set(0, 0, 0);

    sceneRef.current    = scene;
    rendererRef.current = renderer;
    groupRef.current    = group;

    // HUD scene
    const hudScene    = new THREE.Scene();
    const hudCamera   = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    hudCamera.position.set(0, 0, 4);

    const hudRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    hudRenderer.setSize(120, 120);
    hudRef.current.appendChild(hudRenderer.domElement);

    hudScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const hudDir = new THREE.DirectionalLight(0xffffff, 0.7);
    hudDir.position.set(2, 5, 4);
    hudScene.add(hudDir);

    const createFaceTex = (text) => {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, 244, 244);
      ctx.fillStyle = '#e2e8f0';
      const tri = 36;
      ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(6+tri, 6); ctx.lineTo(6, 6+tri); ctx.fill();
      ctx.beginPath(); ctx.moveTo(250, 6); ctx.lineTo(250-tri, 6); ctx.lineTo(250, 6+tri); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6, 250); ctx.lineTo(6+tri, 250); ctx.lineTo(6, 250-tri); ctx.fill();
      ctx.beginPath(); ctx.moveTo(250, 250); ctx.lineTo(250-tri, 250); ctx.lineTo(250, 250-tri); ctx.fill();
      ctx.fillStyle = '#334155'; ctx.font = '900 50px -apple-system, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      if (hudRenderer.capabilities.getMaxAnisotropy) tex.anisotropy = hudRenderer.capabilities.getMaxAnisotropy();
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1 });
    };

    const hudMats = [
      createFaceTex('RIGHT'), createFaceTex('LEFT'),
      createFaceTex('TOP'), createFaceTex('BOTTOM'),
      createFaceTex('FRONT'), createFaceTex('BACK')
    ];

    const hudBox = new THREE.Mesh(new THREE.BoxGeometry(1.98, 1.98, 1.98), hudMats);
    hudBox.rotation.order = 'YXZ';
    const hudEdges = new THREE.EdgesGeometry(hudBox.geometry);
    const hudLines = new THREE.LineSegments(hudEdges, new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 }));
    hudBox.add(hudLines);

    const interactGroup = new THREE.Group();
    const hbMatTemplate = new THREE.MeshBasicMaterial({ color: 0x33aaff, transparent: true, opacity: 0, depthWrite: false });
    const s = 2.0 / 3;
    for (let x of [-1, 0, 1]) {
      for (let y of [-1, 0, 1]) {
        for (let z of [-1, 0, 1]) {
          if (x===0 && y===0 && z===0) continue;
          const hbGeo = new THREE.BoxGeometry(s * 1.01, s * 1.01, s * 1.01);
          const mesh = new THREE.Mesh(hbGeo, hbMatTemplate.clone());
          mesh.position.set(x * s, y * s, z * s);
          mesh.userData = { dir: {x, y, z} };
          interactGroup.add(mesh);
        }
      }
    }
    hudBox.add(interactGroup);
    hudScene.add(hudBox);

    // Orbit state
    const orbit = {
      theta: 0.3, phi: Math.PI/2 - 0.15, distance: 300,
      panX: 0, panY: 0,
      tTheta: 0.3, tPhi: Math.PI/2 - 0.15, tDist: 300, tPanX: 0, tPanY: 0,
      animating: false, needsUpdate: true,
    };

    const updateCamera = () => {
      const sinPhi = Math.sin(orbit.phi), cosPhi = Math.cos(orbit.phi);
      camera.position.set(
        orbit.distance * sinPhi * Math.sin(orbit.theta) + orbit.panX,
        orbit.distance * cosPhi + orbit.panY,
        orbit.distance * sinPhi * Math.cos(orbit.theta) + 0
      );
      camera.lookAt(orbit.panX, orbit.panY, 0);
    };

    const snapOrbit = (theta, phi, resetPan = true) => {
      orbit.tTheta = theta;
      orbit.tPhi = clamp(phi, 0.05, Math.PI - 0.05);
      if (resetPan) { orbit.tPanX = 0; orbit.tPanY = 0; }
      orbit.animating = true;
    };

    const resetView = () => {
      orbit.tTheta = 0.3; orbit.tPhi = Math.PI / 2 - 0.15;
      orbit.tPanX = 0; orbit.tPanY = 0;
      orbit.tDist = orbit.defaultDist || 300;
      orbit.animating = true;
    };

    // Interaction state
    let isOrbiting = false, isPanning = false, prevX = 0, prevY = 0;
    let isHudDragging = false, hudHasDragged = false, hudPrevX = 0, hudPrevY = 0;

    const onMainDown = e => {
      if (e.button === 1 || e.button === 2 || (e.button === 0 && (e.shiftKey || e.ctrlKey))) {
        isPanning = true;
      } else {
        isOrbiting = true;
      }
      orbit.animating = false;
      prevX = e.clientX; prevY = e.clientY;
      if (mountRef.current) mountRef.current.style.cursor = isPanning ? 'move' : 'grabbing';
      e.preventDefault();
    };

    const onContextMenu = e => e.preventDefault();

    const onWheel = e => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      orbit.distance = clamp(orbit.distance * factor, 20, 2000);
      orbit.tDist = orbit.distance;
      orbit.needsUpdate = true;
    };

    let touchStartDist = 0, touchStartOrbitDist = 0;
    const getTouchDist = e => {
      if (e.touches.length < 2) return 0;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const onTouchStart = e => {
      if (e.touches.length === 2) { touchStartDist = getTouchDist(e); touchStartOrbitDist = orbit.distance; return; }
      if (e.touches.length === 1) { isOrbiting = true; orbit.animating = false; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }
    };
    const onTouchMove = e => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = getTouchDist(e);
        orbit.distance = clamp(touchStartOrbitDist * (touchStartDist / dist), 20, 2000);
        orbit.tDist = orbit.distance; orbit.needsUpdate = true; return;
      }
      if (e.touches.length === 1 && isOrbiting) {
        const dx = e.touches[0].clientX - prevX, dy = e.touches[0].clientY - prevY;
        orbit.theta -= dx * 0.008;
        orbit.phi = clamp(orbit.phi + dy * 0.008, 0.05, Math.PI - 0.05);
        orbit.tTheta = orbit.theta; orbit.tPhi = orbit.phi;
        orbit.needsUpdate = true;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => { isOrbiting = false; isPanning = false; touchStartDist = 0; };

    const onHudDown = e => {
      isHudDragging = true; hudHasDragged = false;
      orbit.animating = false;
      hudPrevX = e.clientX; hudPrevY = e.clientY;
      if (hudRef.current) hudRef.current.style.cursor = 'grabbing';
      e.stopPropagation();
    };

    const onGlobalUp = () => {
      isOrbiting = false; isPanning = false; isHudDragging = false;
      if (mountRef.current) mountRef.current.style.cursor = 'grab';
    };

    const onGlobalMove = e => {
      const dx = e.clientX - prevX, dy = e.clientY - prevY;
      if (isOrbiting) {
        orbit.theta -= dx * 0.006;
        orbit.phi = clamp(orbit.phi + dy * 0.006, 0.05, Math.PI - 0.05);
        orbit.tTheta = orbit.theta; orbit.tPhi = orbit.phi;
        orbit.needsUpdate = true; prevX = e.clientX; prevY = e.clientY;
      }
      if (isPanning) {
        const panSpeed = orbit.distance * 0.002;
        orbit.panX -= dx * panSpeed * Math.cos(orbit.theta);
        orbit.panY += dy * panSpeed;
        orbit.tPanX = orbit.panX; orbit.tPanY = orbit.panY;
        orbit.needsUpdate = true; prevX = e.clientX; prevY = e.clientY;
      }
      if (isHudDragging) {
        hudHasDragged = true;
        orbit.theta -= (e.clientX - hudPrevX) * 0.008;
        orbit.phi = clamp(orbit.phi + (e.clientY - hudPrevY) * 0.008, 0.05, Math.PI - 0.05);
        orbit.tTheta = orbit.theta; orbit.tPhi = orbit.phi;
        orbit.needsUpdate = true; hudPrevX = e.clientX; hudPrevY = e.clientY;
      }
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onHudMove = (e) => {
      if (isHudDragging) return;
      const rect = hudRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, hudCamera);
      const intersects = raycaster.intersectObjects(interactGroup.children);
      interactGroup.children.forEach(c => c.material.opacity = 0);
      if (intersects.length > 0) { intersects[0].object.material.opacity = 0.35; hudRef.current.style.cursor = 'pointer'; }
      else { hudRef.current.style.cursor = 'default'; }
    };

    const onHudClick = (e) => {
      if (hudHasDragged) return;
      const rect = hudRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, hudCamera);
      const intersects = raycaster.intersectObjects(interactGroup.children);
      if (intersects.length > 0) {
        const dir = intersects[0].object.userData.dir;
        const thetaNew = Math.atan2(dir.x, dir.z);
        const phiNew = Math.acos(clamp(dir.y / Math.sqrt(dir.x*dir.x + dir.y*dir.y + dir.z*dir.z + 0.001), -0.99, 0.99));
        snapOrbit(thetaNew, phiNew);
      }
    };

    const onHudLeave = () => { interactGroup.children.forEach(c => c.material.opacity = 0); };

    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth, nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    // Expose via window for cross-component communication
    window._snapView = (phi, theta) => snapOrbit(theta, Math.PI/2 - phi, true);
    window._resetView = resetView;
    window._orbitRef = orbit;

    const mDom = mountRef.current;
    const hDom = hudRef.current;
    mDom.addEventListener('mousedown', onMainDown);
    mDom.addEventListener('contextmenu', onContextMenu);
    mDom.addEventListener('wheel', onWheel, { passive: false });
    mDom.addEventListener('touchstart', onTouchStart, { passive: true });
    mDom.addEventListener('touchmove', onTouchMove, { passive: true });
    mDom.addEventListener('touchend', onTouchEnd);
    hDom.addEventListener('mousedown', onHudDown);
    hDom.addEventListener('mousemove', onHudMove);
    hDom.addEventListener('click', onHudClick);
    hDom.addEventListener('mouseleave', onHudLeave);
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('resize', onResize);

    let req;
    const animate = () => {
      req = requestAnimationFrame(animate);
      if (!mountRef.current?.offsetParent) return;
      if (orbit.animating) {
        const sp = 0.12;
        let diffT = orbit.tTheta - orbit.theta;
        diffT = Math.atan2(Math.sin(diffT), Math.cos(diffT));
        orbit.theta += diffT * sp;
        orbit.phi += (orbit.tPhi - orbit.phi) * sp;
        orbit.distance += (orbit.tDist - orbit.distance) * sp;
        orbit.panX += (orbit.tPanX - orbit.panX) * sp;
        orbit.panY += (orbit.tPanY - orbit.panY) * sp;
        if (Math.abs(diffT) < 0.001 && Math.abs(orbit.tPhi - orbit.phi) < 0.001 &&
            Math.abs(orbit.tDist - orbit.distance) < 0.1 &&
            Math.abs(orbit.tPanX - orbit.panX) < 0.01 && Math.abs(orbit.tPanY - orbit.panY) < 0.01) {
          orbit.theta = orbit.tTheta; orbit.phi = orbit.tPhi;
          orbit.distance = orbit.tDist; orbit.panX = orbit.tPanX; orbit.panY = orbit.tPanY;
          orbit.animating = false;
        }
        orbit.needsUpdate = true;
      }
      if (orbit.needsUpdate) { updateCamera(); orbit.needsUpdate = false; }
      hudBox.rotation.set(0, 0, 0);
      hudBox.rotation.order = 'YXZ';
      hudBox.rotation.y = -orbit.theta;
      hudBox.rotation.x = -(orbit.phi - Math.PI / 2);
      renderer.render(scene, camera);
      hudRenderer.render(hudScene, hudCamera);
    };
    animate();

    return () => {
      cancelAnimationFrame(req);
      mDom.removeEventListener('mousedown', onMainDown);
      mDom.removeEventListener('contextmenu', onContextMenu);
      mDom.removeEventListener('wheel', onWheel);
      mDom.removeEventListener('touchstart', onTouchStart);
      mDom.removeEventListener('touchmove', onTouchMove);
      mDom.removeEventListener('touchend', onTouchEnd);
      hDom.removeEventListener('mousedown', onHudDown);
      hDom.removeEventListener('mousemove', onHudMove);
      hDom.removeEventListener('click', onHudClick);
      hDom.removeEventListener('mouseleave', onHudLeave);
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('mousemove', onGlobalMove);
      window.removeEventListener('resize', onResize);
      delete window._snapView; delete window._resetView; delete window._orbitRef;
      if (hDom && hDom.contains(hudRenderer.domElement)) hDom.removeChild(hudRenderer.domElement);
      if (mDom && mDom.contains(renderer.domElement)) mDom.removeChild(renderer.domElement);
      renderer.dispose(); hudRenderer.dispose();
      texCacheRef.current.forEach(tex => tex.dispose());
      texCacheRef.current.clear();
      sceneRef.current = null; rendererRef.current = null; groupRef.current = null;
    };
  }, [loaded]);

  return { loaded, sceneRef, rendererRef, groupRef, texCacheRef };
}
