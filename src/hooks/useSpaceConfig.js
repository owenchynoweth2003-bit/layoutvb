import { useState, useCallback } from 'react';
import { WALLPRESETS } from '../domain/walls.js';

export function useSpaceConfig() {
  const [wallType, setWallType]         = useState('single');
  const [walls, setWalls]               = useState(WALLPRESETS[0].p.map(p => ({ ...p })));
  const [aw, setAw]                     = useState(0);
  const [feats, setFeats]               = useState([]);
  const [wallPatterns, setWallPatterns]  = useState({});
  const [wallVisible, setWallVisible]   = useState({});
  const [usePerWallPat, setUsePerWallPat] = useState(false);
  const [wallConnection, setWallConnection] = useState('independent');
  const [wallTiles, setWallTiles]       = useState({});
  const [usePerWallTile, setUsePerWallTile] = useState(false);
  // Custom uploads library
  const [customTiles, setCustomTiles]   = useState([]);
  // Per-wall min cut overrides
  const [wallMinCuts, setWallMinCuts]   = useState({});
  const [usePerWallMinCut, setUsePerWallMinCut] = useState(false);

  const getWallMinCut = useCallback((wallIdx, globalMcw, globalMch) => {
    if (!usePerWallMinCut || !wallMinCuts[wallIdx]) return { mcw: globalMcw, mch: globalMch };
    return { mcw: wallMinCuts[wallIdx].mcw ?? globalMcw, mch: wallMinCuts[wallIdx].mch ?? globalMch };
  }, [usePerWallMinCut, wallMinCuts]);

  const setWallMinCut = useCallback((wallIdx, mcw, mch) => {
    setWallMinCuts(prev => ({ ...prev, [wallIdx]: { mcw, mch } }));
  }, []);

  const getWallPattern = useCallback((wallIdx, globalPat) => {
    if (!usePerWallPat) return globalPat;
    return wallPatterns[wallIdx] || globalPat;
  }, [usePerWallPat, wallPatterns]);

  const setWallPattern = useCallback((wallIdx, patId) => {
    setWallPatterns(prev => ({ ...prev, [wallIdx]: patId }));
  }, []);

  const isWallVisible = useCallback((wallIdx) => {
    return wallVisible[wallIdx] !== false;
  }, [wallVisible]);

  const toggleWallVisible = useCallback((wallIdx) => {
    setWallVisible(prev => ({ ...prev, [wallIdx]: prev[wallIdx] === false ? true : false }));
  }, []);

  const getWallTile = useCallback((wallIdx, globalTile) => {
    if (!usePerWallTile) return globalTile;
    return wallTiles[wallIdx] || globalTile;
  }, [usePerWallTile, wallTiles]);

  const setWallTile = useCallback((wallIdx, tile) => {
    setWallTiles(prev => ({ ...prev, [wallIdx]: tile }));
  }, []);

  const addCustomTile = useCallback((tile) => {
    setCustomTiles(prev => [...prev, { ...tile, id: -(prev.length + 100), isCustomUpload: true }]);
  }, []);

  const removeCustomTile = useCallback((idx) => {
    setCustomTiles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  return {
    wallType, setWallType, walls, setWalls, aw, setAw, feats, setFeats,
    wallPatterns, setWallPatterns, setWallPattern,
    wallVisible, setWallVisible, toggleWallVisible, isWallVisible,
    usePerWallPat, setUsePerWallPat, getWallPattern,
    wallConnection, setWallConnection,
    wallTiles, setWallTiles, setWallTile, getWallTile,
    usePerWallTile, setUsePerWallTile,
    customTiles, setCustomTiles, addCustomTile, removeCustomTile,
    wallMinCuts, setWallMinCuts, setWallMinCut, getWallMinCut,
    usePerWallMinCut, setUsePerWallMinCut,
  };
}
