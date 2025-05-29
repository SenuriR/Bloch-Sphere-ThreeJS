// src/components/AsciiCircuitPanel.jsx
import React, { useEffect, useState } from 'react';

export default function AsciiCircuitPanel({ circuit }) {
  const [diagram, setDiagram] = useState('');

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const res = await fetch('http://localhost:3001/circuit-diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ circuit })
        });
        const data = await res.json();
        setDiagram(data.diagram || '');
      } catch (err) {
        console.error('Failed to fetch circuit diagram:', err);
        setDiagram('[ error rendering circuit ]');
      }
    };

    if (circuit.length > 0) {
      fetchDiagram();
    } else {
      setDiagram('');
    }
  }, [circuit]);

  return (
    <div className="ascii-circuit-panel" style={{ marginTop: '1em' }}>
      <h2>Circuit Diagram (ASCII via PennyLane)</h2>
      <pre style={{ background: '#111', color: '#0f0', padding: '1em' }}>{diagram}</pre>
    </div>
  );
}
