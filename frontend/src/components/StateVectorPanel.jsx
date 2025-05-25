// src/components/StateVectorPanel.jsx
import React, { useEffect } from 'react';

export default function StateVectorPanel({ latexLines }) {
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [latexLines]);

  return (
    <div className="statevector-panel" style={{ marginTop: '2rem' }}>
      <h3>State Vector Evolution</h3>
      <div id="mathjax-output">
        {latexLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
