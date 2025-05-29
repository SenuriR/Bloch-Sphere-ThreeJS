import React, { useEffect, useState } from 'react';

export default function CircuitDiagram({ circuit }) {
  const [diagram, setDiagram] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const response = await fetch('http://localhost:3001/circuit-diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ circuit })
        });

        const data = await response.json();
        if (data.diagram) {
          setDiagram(data.diagram);
          setError('');
        } else {
          setError(data.error || 'Failed to generate diagram.');
        }
      } catch (err) {
        setError('Backend error.');
      }
    };

    if (circuit.length > 0) fetchDiagram();
  }, [circuit]);

  return (
    <div>
      <h2>Quantum Circuit</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <pre>{diagram}</pre>
    </div>
  );
}
