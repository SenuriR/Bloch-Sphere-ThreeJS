import React from 'react';

export default function QubitPanel({ qubit, updateQubit }) {
    const handleThetaChange = e => updateQubit(qubit.id, parseFloat(e.target.value), qubit.phi);
    const handlePhiChange = e => updateQubit(qubit.id, qubit.theta, parseFloat(e.target.value));

    return (
        <div className="qubit-panel">
            <strong>{qubit.id}</strong>
            <label>
                θ:
                <input type="range" min="0" max="3.1415" step="0.01" value={qubit.theta} onChange={handleThetaChange} />
            </label>
            <label>
                φ:
                <input type="range" min="0" max="6.283" step="0.01" value={qubit.phi} onChange={handlePhiChange} />
            </label>
        </div>
    );
}