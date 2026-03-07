import React from 'react';

export class SafeView extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e, info) { console.error('TileVision SafeView:', e, info); }
  render() {
    if (this.state.err) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 12, fontFamily: 'inherit', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 20 }}>⚠</span>
        <span>3D unavailable</span>
        <button onClick={() => this.setState({ err: null })} style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 500 }}>Retry</button>
      </div>
    );
    return this.props.children;
  }
}
