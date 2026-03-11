import React from 'react';

export const Pill = ({ s }) => {
  const c = s >= 80 ? '#059669' : s >= 60 ? '#d97706' : '#dc2626';
  return <span style={{ background: `${c}0a`, border: `1px solid ${c}20`, borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 600, color: c, letterSpacing: 0.3 }}>{s}</span>;
};
