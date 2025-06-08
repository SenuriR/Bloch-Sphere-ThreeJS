import React, { useState, useEffect } from 'react';
import QubitPanel from './components/QubitPanel';
import MultiQubitControls from './components/MultiQubitControls';
import CircuitDiagram from './components/CircuitDiagram';
import ProtocolPanel from './components/ProtocolPanel';
import './styles.css';

export default function App() {
  const [numQubits, setNumQubits] = useState(2);

  // 🔧 New undo/redo state system
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState([]);
  const [future, setFuture] = useState([]);

  const [latexSteps, setLatexSteps] = useState([]);
  const [blochData, setBlochData] = useState({});

  const updateCircuit = (qubitIndex, gate) => {
    const newGate = { gate, qubit: qubitIndex };
    setPast(prev => [...prev, present]);
    setPresent([...present, newGate]);
    setFuture([]);  // Clear redo stack when new gate applied
  };

  const applyMultiQubitGate = (gate, control, target) => {
    const newGate = { gate, control, target };
    setPast(prev => [...prev, present]);
    setPresent([...present, newGate]);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const prevPast = [...past];
    const last = prevPast.pop();
    setPast(prevPast);
    setFuture(f => [present, ...f]);
    setPresent(last);
  };

  const redo = () => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setPast(p => [...p, present]);
    setPresent(next);
    setFuture(rest);
  };

  const reset = () => {
    setPast([]);
    setPresent([]);
    setFuture([]);
  };

  const runStateEvolution = async () => {
    try {
      const response = await fetch('http://localhost:3001/state-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit: present })
      });

      const data = await response.json();
      if (data.steps) {
        setLatexSteps(data.steps);
      }
    } catch (err) {
      console.error('State evolution request failed:', err);
    }
  };

  const updateBlochSpheres = async () => {
    try {
      const response = await fetch('http://localhost:3001/state-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit: present })
      });

      const data = await response.json();
      if (data.bloch_spheres) {
        setBlochData(data.bloch_spheres);
      }
    } catch (err) {
      console.error('Bloch sphere update failed:', err);
    }
  };

  useEffect(() => {
    updateBlochSpheres();
  }, [present]);

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [latexSteps]);

  return (
    <div className="app-wrapper">
      <h1>Quantum Research Control Console</h1>

      <div className="container">
        <div className="panel">
          <h2>Qubit Controls</h2>
          <button 
            onClick={() => setNumQubits(numQubits + 1)} 
            disabled={present.length > 0}
          >
            ➕ Add Qubit
          </button>
          <button onClick={reset} style={{ marginLeft: '10px' }}>🔄 Reset</button>
          <button onClick={undo} disabled={past.length === 0} style={{ marginLeft: '10px' }}>↩ Undo</button>
          <button onClick={redo} disabled={future.length === 0} style={{ marginLeft: '10px' }}>↪ Redo</button>

          {[...Array(numQubits)].map((_, i) => (
            <QubitPanel
              key={i}
              qubitIndex={i}
              blochData={blochData[i]}
              updateCircuit={updateCircuit}
              applyMultiQubitGate={applyMultiQubitGate}
            />
          ))}

          <MultiQubitControls applyMultiQubitGate={applyMultiQubitGate} numQubits={numQubits} />
        </div>

        <div className="panel">
          <ProtocolPanel circuit={present} />
        </div>

        <div className="panel">
          <h2>Quantum Circuit</h2>
          <CircuitDiagram circuit={present} />

          <h2>State Evolution</h2>
          <button onClick={runStateEvolution}>🧮 Run State Evolution</button>
          {latexSteps.map((line, idx) => (
            <div key={idx}>
              <div dangerouslySetInnerHTML={{ __html: `\\(${line}\\)` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
