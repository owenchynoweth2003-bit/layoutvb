import React, { useState } from 'react';

export const Sc = ({ title, children, color = '#94a3b8', defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 18 }}>
      <div onClick={() => setOpen(!open)} style={{ fontSize: 9, color: '#94a3b8', letterSpacing: 1.5, marginBottom: open ? 8 : 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 2, height: 12, background: color, borderRadius: 1, opacity: 0.4 }} />
        {title}
        <span style={{ marginLeft: 'auto', fontSize: 8, color: '#cbd5e1', transition: 'transform 0.15s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
      </div>
      {open && children}
    </div>
  );
};
