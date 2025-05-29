// src/components/MultiQubitControls.jsx
import React, { useState } from 'react';

export default function MultiQubitControls({ applyMultiQubitGate, numQubits }) {
  const [control, setControl] = useState(0);
  const [target, setTarget] = useState(1);

  const handleApplyCNOT = () => {
    if (control === target) {
      alert("Control and target must be different.");
      return;
    }
    applyMultiQubitGate('CNOT', control, target);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Multi-Qubit Gate</h3>
      <label>
        Control Qubit:
        <select value={control} onChange={e => setControl(Number(e.target.value))}>
          {[...Array(numQubits)].map((_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>
      <label style={{ marginLeft: '10px' }}>
        Target Qubit:
        <select value={target} onChange={e => setTarget(Number(e.target.value))}>
          {[...Array(numQubits)].map((_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>
      <button onClick={handleApplyCNOT} style={{ marginLeft: '10px' }}>
        Apply CNOT
      </button>
    </div>
  );
}
