// src/App.jsx

import React, { useState, useEffect } from 'react';
import QubitPanel from './components/QubitPanel';
import MultiQubitControls from './components/MultiQubitControls';
import CircuitDiagram from './components/CircuitDiagram';

export default function App() {
  const [numQubits, setNumQubits] = useState(1);  // Start with 1 qubit
  const [circuit, setCircuit] = useState([]);
  const [stateVectorSteps, setStateVectorSteps] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState('');

  const addQubit = () => {
    setNumQubits(prev => prev + 1);
  };

  const updateCircuit = (qubitIndex, gate) => {
    setCircuit(prev => [...prev, { gate, qubit: qubitIndex }]);
  };

  const addStateVectorStep = (latexLine) => {
    setStateVectorSteps(prev => [...prev, latexLine]);
  };

  const applyMultiQubitGate = (gate, control, target) => {
    setCircuit(prev => [...prev, { gate, control, target }]);
  };

  const runSimulation = async () => {
    try {
      const response = await fetch('http://localhost:3001/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit })
      });

      const data = await response.json();

      if (data.statevector) {
        setSimulationResult(data.statevector);
        setError('');
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError('Simulation failed. Please check backend.');
      console.error(err);
    }
  };

  // Handle MathJax rerender on state vector update
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [stateVectorSteps]);

  return (
    <div>
      <h1>Quantum System Simulator</h1>

      <button onClick={addQubit}>➕ Add Qubit</button>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[...Array(numQubits)].map((_, i) => (
          <QubitPanel
            key={i}
            qubitIndex={i}
            updateCircuit={updateCircuit}
            addStateVectorStep={addStateVectorStep}
            applyMultiQubitGate={applyMultiQubitGate}
          />
        ))}
      </div>

      <MultiQubitControls applyMultiQubitGate={applyMultiQubitGate} numQubits={numQubits} />

      <button onClick={runSimulation} style={{ marginTop: '20px' }}>
        Run Simulation
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {simulationResult && (
        <div>
          <h2>Final Statevector:</h2>
          <pre>{JSON.stringify(simulationResult, null, 2)}</pre>
        </div>
      )}

      <CircuitDiagram circuit={circuit} />

      <h2>State Vector Evolution</h2>
      <div>
        {stateVectorSteps.map((step, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: step }} />
        ))}
      </div>
    </div>
  );
}
