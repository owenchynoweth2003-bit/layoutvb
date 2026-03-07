import React, { useState, useEffect } from 'react';
import { toFraction, parseFraction, clamp } from '../../solver/utils.js';

export const FracInp = ({ val, onChg, min = -Infinity, max = Infinity, style }) => {
  const [str, setStr] = useState(toFraction(val));
  const [foc, setFoc] = useState(false);
  useEffect(() => { if (!foc) setStr(toFraction(val)); }, [val, foc]);
  const blur = () => {
    setFoc(false);
    const p = parseFraction(str);
    if (!isNaN(p)) { const clamped = clamp(p, min, max); onChg(clamped); setStr(toFraction(clamped)); }
    else setStr(toFraction(val));
  };
  return (
    <input type="text" value={foc ? str : toFraction(val)}
      onChange={e => setStr(e.target.value)}
      onFocus={() => setFoc(true)} onBlur={blur}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
      style={style} />
  );
};
