import React from 'react';

export default function QubitPanel({ qubit, updateQubit }) {
    const handleThetaChange = e => updateQubit(qubit.id, parseFloat(e.target.value), qubit.phi);
    const handlePhiChange = e => updateQubit(qubit.id, qubit.theta, parseFloat(e.target.value));

    const reset = () => updateQubit(qubit.id, 0, 0);

    const randomize = () => {
        const theta = Math.random() * Math.PI;
        const phi = Math.random() * (2 * Math.PI);
        updateQubit(qubit.id, theta, phi);
    };

    const applyGate = (gate) => {
        const alpha = math.complex(Math.cos(qubit.theta / 2), 0);
        const beta = math.complex({ abs: Math.sin(qubit.theta / 2), arg: qubit.phi });

        const gates = {
            X: [[0, 1], [1, 0]],
            Y: [[0, math.complex(0, -1)], [math.complex(0, 1), 0]],
            Z: [[1, 0], [0, -1]],
            H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]]
        };

        const m = gates[gate];
        const newAlpha = math.add(math.multiply(m[0][0], alpha), math.multiply(m[0][1], beta));
        const newBeta = math.add(math.multiply(m[1][0], alpha). math.multiply(m[1][1], beta));

        const x = 2 * math.re(math.multiply(math.conj(newAlpha), newBeta));
        const y = 2 * math.im(math.multiply(math.conj(newAlpha), newBeta));
        const z = Math.pow(math.abs(newAlpha), 2) - Math.pow(math.abs(newBeta), 2);
        const r = Math.sqrt(x * x + y * y + z * z);

        const theta = Math.acos(z / r);
        const phi = Math.atan2(y, x);
        updateQubit(qubit.id, theta, phi);
    };

    return (
        <div className="qubit-panel">
            <strong>{qubit.id}</strong>
            <button onClick={reset}>Reset</button>
            <button onClick={randomize}>Randomize</button>
            <div>
            <strong>Gates:</strong><br />
            <button onClick={() => applyGate('X')}>X</button>
            <button onClick={() => applyGate('Y')}>Y</button>
            <button onClick={() => applyGate('Z')}>Z</button>
            <button onClick={() => applyGate('H')}>H</button>
            </div>
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