import React from 'react';
import { formatInches } from '../../solver/utils.js';

export const CutBadge = ({ label, val, min }) => {
  const v = parseFloat(val) || 0, ok = v < 0.01 || v >= min;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '6px 8px', background: ok ? '#eff6ff' : '#fef2f2', border: `1px solid ${ok ? '#bfdbfe' : '#fecaca'}`, borderRadius: 8, transition: 'all .2s ease' }}>
      <span style={{ color: ok ? '#2563eb' : '#dc2626', fontWeight: 600, fontSize: 10, minWidth: 12 }}>{label}</span>
      <span style={{ color: '#1e293b', fontWeight: 500 }}>{formatInches(v)}</span>
      {!ok && v > 0.01 && <span style={{ color: '#dc2626', fontSize: 9, fontWeight: 600 }}>✗</span>}
      {ok  && v > 0.01 && <span style={{ color: '#059669', fontSize: 9 }}>✓</span>}
    </div>
  );
};
