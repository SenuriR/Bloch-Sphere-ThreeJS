import React, { useState, useEffect } from 'react';
import QubitPanel from './components/QubitPanel';
import MultiQubitControls from './components/MultiQubitControls';
import CircuitDiagram from './components/CircuitDiagram';

export default function App() {
  const [numQubits, setNumQubits] = useState(2);
  const [circuit, setCircuit] = useState([]);
  const [latexSteps, setLatexSteps] = useState([]);

  const updateCircuit = (qubitIndex, gate) => {
    setCircuit(prev => [...prev, { gate, qubit: qubitIndex }]);
  };

  const applyMultiQubitGate = (gate, control, target) => {
    setCircuit(prev => [...prev, { gate, control, target }]);
  };

  const runStateEvolution = async () => {
    try {
      const response = await fetch('http://localhost:3001/state-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit })
      });

      const data = await response.json();
      if (data.steps) {
        setLatexSteps(data.steps);
      }
    } catch (err) {
      console.error('State evolution request failed:', err);
    }
  };

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [latexSteps]);

  return (
    <div>
      <h1>Quantum System Simulator</h1>

      <button onClick={() => setNumQubits(numQubits + 1)}>➕ Add Qubit</button>

      <div style={{ display: 'flex', gap: '10px' }}>
        {[...Array(numQubits)].map((_, i) => (
          <QubitPanel
            key={i}
            qubitIndex={i}
            updateCircuit={updateCircuit}
            applyMultiQubitGate={applyMultiQubitGate}
          />
        ))}
      </div>

      <MultiQubitControls applyMultiQubitGate={applyMultiQubitGate} numQubits={numQubits} />

      <button onClick={runStateEvolution} style={{ marginTop: '20px' }}>
        Run State Evolution
      </button>

      <h2>Quantum Circuit</h2>
      <CircuitDiagram circuit={circuit} />

      <h2>State Vector Evolution</h2>
      <div>
        {latexSteps.map((line, idx) => (
          <div key={idx}>
            <div dangerouslySetInnerHTML={{ __html: `\\(${line}\\)` }} />
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}
