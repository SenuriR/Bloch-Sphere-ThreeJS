// src/components/CircuitPanel.jsx
import React from 'react';

export default function CircuitPanel({ circuit }) {
  return (
    <div className="circuit-panel" style={{ marginTop: '2rem', fontFamily: 'monospace', whiteSpace: 'pre' }}>
      <h3>Quantum Circuit</h3>
      <div>
        {circuit.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}
