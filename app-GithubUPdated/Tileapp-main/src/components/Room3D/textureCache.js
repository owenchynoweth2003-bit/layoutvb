// ─── TEXTURE CACHE ──────────────────────────────────────────────────────────
// Simple ref-based cache for Three.js CanvasTexture objects.

export function clearCache(cacheRef) {
  cacheRef.current.forEach(tex => tex.dispose());
  cacheRef.current.clear();
}

export function invalidateCache(cacheRef, tag) {
  if (cacheRef.current._tag !== tag) {
    clearCache(cacheRef);
    cacheRef.current._tag = tag;
  }
}
