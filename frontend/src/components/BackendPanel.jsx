// src/components/BackendPanel.jsx
import React, { useState } from 'react';

export default function BackendPanel({ circuit }) {
  const [statevector, setStatevector] = useState([]);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    try {
      const res = await fetch('http://localhost:3001/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit })
      });
      const data = await res.json();
      if (data.statevector) {
        setStatevector(data.statevector);
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
      setStatevector([]);
    }
  };

  return (
    <div className="backend-panel">
      <button onClick={runSimulation}>Run on PennyLane</button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {statevector.length > 0 && (
        <div style={{ marginTop: '1em' }}>
          <strong>Final Statevector:</strong>
          <div>
            {statevector.map((amp, i) => {
              const n = Math.log2(statevector.length);
              const ket = `|${i.toString(2).padStart(n, '0')}\rangle`;
              return <div key={i}><span>{`ψ_${i} = `}</span><span>{`${amp} ${ket}`}</span></div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
