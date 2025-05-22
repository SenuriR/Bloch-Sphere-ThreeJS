// src/App.jsx
import React, { useState } from 'react';
import QuantumSystemPanel from './components/QuantumSystemPanel';
import CircuitPanel from './components/CircuitPanel';
import StateVectorPanel from './components/StateVectorPanel';

export default function App() {
  const [qubits, setQubits] = useState([{ id: 'q0' }]);
  const [circuit, setCircuit] = useState(['q_0: ──']);
  const [stateVectors, setStateVectors] = useState([]);

  const addQubit = () => {
    if (qubits.length >= 3) return;
    const newId = `q${qubits.length}`;
    setQubits([...qubits, { id: newId }]);
    setCircuit([...circuit, `q_${qubits.length}: ──`]);
  };

  const updateCircuit = (index, gate) => {
    setCircuit(prev => {
      const updated = [...prev];
      updated[index] = updated[index].trimEnd() + `─${gate}─`;
      return updated;
    });
  };

  const addStateVectorStep = (latexLine) => {
    setStateVectors(prev => [...prev, latexLine]);
  };

  return (
    <div className="app-container">
      <button onClick={addQubit} disabled={qubits.length >= 3}>➕ Add Qubit</button>
      <QuantumSystemPanel 
        qubits={qubits} 
        updateCircuit={updateCircuit} 
        addStateVectorStep={addStateVectorStep} 
      />
      <CircuitPanel circuit={circuit} />
      <StateVectorPanel latexLines={stateVectors} />
    </div>
  );
}
