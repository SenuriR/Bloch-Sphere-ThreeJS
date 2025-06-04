// frontend/components/ProtocolPanel.jsx

import React from 'react';

export default function ProtocolPanel({ circuit }) {
  if (!circuit || circuit.length === 0) {
    return (
      <div>
        <h2>Protocol Panel</h2>
        <p>No gates applied yet.</p>
      </div>
    );
  }

  return (
    <div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {circuit.map((op, idx) => {
          let description = "";

          if (op.gate === "CNOT") {
            description = `Time step ${idx + 1}: Apply CNOT gate (control qubit ${op.control}, target qubit ${op.target})`;
          } else if (op.gate === "RX" || op.gate === "RY" || op.gate === "RZ") {
            // Future-proofing for parameterized gates
            description = `Time step ${idx + 1}: Apply ${op.gate}(${op.angle}) to qubit ${op.qubit}`;
          } else {
            description = `Time step ${idx + 1}: Apply ${op.gate} gate to qubit ${op.qubit}`;
          }

          return (
            <li key={idx} style={{ marginBottom: '5px' }}>
              {description}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
