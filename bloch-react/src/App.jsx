import { useState } from 'react'
import BlochSphere from './components/BlochSphere';
import QubitPanel from './components/QubitPanel';

export default function App() {
  const [qubits, setQubits] = useState([{ id: 'q0',  theta: 0, phi: 0 }]);

  const addQubit = () => {
    const newId = 'q${qubits.length}';
    setQubits([...qubits, { id: newId, theta: 0, phi: 0 }]);
  };

  const updateQubit = (id, theta, phi) => {
    setQubits(prev => prev.map(q => q.id === id ? { ...q, theta, phi }: q));
  };

  return (
    <div className="app">
      <button onClick={addQubit}>➕ Add Qubit</button>
      <div className='bloch-container'>
        <BlochSphere qubits={qubits}/>
      </div>
      <div className='panel-container'>
        {qubits.map(q => (
          <QubitPanel key={q.id} qubit ={q} updateQubit={updateQubit} />
        ))}
      </div>
    </div>
  );
  
}
