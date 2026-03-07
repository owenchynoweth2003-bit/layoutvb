import { useState, useCallback } from 'react';
import { WALLPRESETS } from '../domain/walls.js';

export function useSpaceConfig() {
<<<<<<< HEAD
  const [wallType, setWallType]         = useState('single');
  const [walls, setWalls]               = useState(WALLPRESETS[0].p.map(p => ({ ...p })));
  const [aw, setAw]                     = useState(0);
  const [feats, setFeats]               = useState([]);
  const [wallPatterns, setWallPatterns]  = useState({});
  const [wallVisible, setWallVisible]   = useState({});
  const [usePerWallPat, setUsePerWallPat] = useState(false);
  const [wallConnection, setWallConnection] = useState('independent');

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

  return {
    wallType, setWallType, walls, setWalls, aw, setAw, feats, setFeats,
    wallPatterns, setWallPatterns, setWallPattern,
    wallVisible, setWallVisible, toggleWallVisible, isWallVisible,
    usePerWallPat, setUsePerWallPat, getWallPattern,
    wallConnection, setWallConnection,
  };
}
=======
  const [wallType, setWallType] = useState('single');
  const [walls, setWalls]       = useState(WALLPRESETS[0].p.map(p => ({ ...p })));
  const [aw, setAw]             = useState(0);
  const [feats, setFeats]       = useState([]);

  return { wallType, setWallType, walls, setWalls, aw, setAw, feats, setFeats };
}
>>>>>>> 1f1fec14fe1d31287d660e823928e29b1f4fc30d
