// src/components/MultiQubitControls.jsx
import React, { useState } from 'react';

export default function MultiQubitControls({ applyMultiQubitGate, numQubits }) {
  const [control, setControl] = useState(0);
  const [target, setTarget] = useState(1);

  const handleApplyCNOT = () => {
    if (control !== target) {
      applyMultiQubitGate('CNOT', control, target);
    }
  };

  return (
    <div style={{ border: '1px solid gray', padding: '10px', marginTop: '20px' }}>
      <h3>Multi-Qubit Gates</h3>
      <label>
        Control Qubit:
        <select value={control} onChange={e => setControl(parseInt(e.target.value))}>
          {[...Array(numQubits)].map((_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>
      <label style={{ marginLeft: '10px' }}>
        Target Qubit:
        <select value={target} onChange={e => setTarget(parseInt(e.target.value))}>
          {[...Array(numQubits)].map((_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>
      <button onClick={handleApplyCNOT} style={{ marginLeft: '10px' }}>Apply CNOT</button>
    </div>
  );
}
