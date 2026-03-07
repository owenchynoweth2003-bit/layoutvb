import React from 'react';

export const Stat = ({ l, v, u, c, sm }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: sm ? '5px 10px' : '8px 12px', minWidth: sm ? 0 : 55, transition: 'all .2s ease', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
    <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3, fontWeight: 500 }}>{l}</div>
    <div style={{ fontSize: sm ? 12 : 15, fontWeight: 600, color: c || '#1e293b', lineHeight: 1.1 }}>{v}{u && <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 2, fontWeight: 500 }}>{u}</span>}</div>
  </div>
);
