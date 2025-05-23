// src/components/QuantumSystemPanel.jsx
import React from 'react';
import QubitPanel from './QubitPanel';

export default function QuantumSystemPanel({ qubits, updateCircuit, addStateVectorStep }) {
  return (
    <div className="quantum-system-panel" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      {qubits.map((qubit, index) => (
        <QubitPanel
          key={qubit.id}
          id={qubit.id}
          qubitIndex={index}
          updateCircuit={updateCircuit}
          addStateVectorStep={addStateVectorStep}
        />
      ))}
    </div>
  );
}
