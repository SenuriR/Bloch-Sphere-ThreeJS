// src/components/QubitPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { create, all } from 'mathjs';

const math = create(all);

export default function QubitPanel({ id, qubitIndex, updateCircuit, addStateVectorStep }) {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [alpha, setAlpha] = useState('1');
  const [beta, setBeta] = useState('0');
  const [error, setError] = useState('');
  const mountRef = useRef();
  const arrowRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 300);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true })
    );
    scene.add(sphere);

    const axes = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)];
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    axes.forEach((dir, i) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          dir.clone().multiplyScalar(-1.2),
          dir.clone().multiplyScalar(1.2)
        ]),
        new THREE.LineBasicMaterial({ color: colors[i] })
      );
      scene.add(line);
    });

    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0xffff00);
    arrowRef.current = arrow;
    scene.add(arrow);

    const animate = () => {
      requestAnimationFrame(animate);
      const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(theta)
      ).normalize();
      arrow.setDirection(dir);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [theta, phi]);

    const formatComplex = (z) => {
        const re = z.re.toFixed(2);
        const im = z.im.toFixed(2);
        if (Math.abs(z.im) < 1e-2) return `${re}`;
        if (Math.abs(z.re) < 1e-2) return `${im}i`;
        return `(${re} ${z.im < 0 ? '-' : '+'} ${Math.abs(im)}i)`;
    };


  const applyGate = (gate) => {
    const alphaComplex = math.complex(Math.cos(theta / 2), 0);
    const betaComplex = math.complex({ abs: Math.sin(theta / 2), arg: phi });

    const gates = {
      X: [[0, 1], [1, 0]],
      Y: [[0, math.complex(0, -1)], [math.complex(0, 1), 0]],
      Z: [[1, 0], [0, -1]],
      H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]]
    };

    const gateMatrix = gates[gate];
    const newAlpha = math.add(math.multiply(gateMatrix[0][0], alphaComplex), math.multiply(gateMatrix[0][1], betaComplex));
    const newBeta = math.add(math.multiply(gateMatrix[1][0], alphaComplex), math.multiply(gateMatrix[1][1], betaComplex));

    const x = 2 * math.re(math.multiply(math.conj(newAlpha), newBeta));
    const y = 2 * math.im(math.multiply(math.conj(newAlpha), newBeta));
    const z = Math.pow(math.abs(newAlpha), 2) - Math.pow(math.abs(newBeta), 2);
    const r = Math.sqrt(x*x + y*y + z*z);

    setTheta(Math.acos(z / r));
    setPhi(Math.atan2(y, x));
    setAlpha(newAlpha.toString());
    setBeta(newBeta.toString());

    updateCircuit(qubitIndex, gate);
    
    const gateLatex = {
    X: '\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}',
    Y: '\\begin{bmatrix} 0 & -i \\\\ i & 0 \\end{bmatrix}',
    Z: '\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}',
    H: '\\frac{1}{\\sqrt{2}} \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}'
    };

    const formatComplex = (z) => {
    const re = math.re(z).toFixed(2);
    const im = math.im(z).toFixed(2);
    if (Math.abs(im) < 1e-2) return `${re}`;
    if (Math.abs(re) < 1e-2) return `${im}i`;
    return `${re}${im < 0 ? ' - ' : ' + '}${Math.abs(im)}i`;
    };

    const αStr = formatComplex(alphaComplex);
    const βStr = formatComplex(betaComplex);
    const αpStr = formatComplex(newAlpha);
    const βpStr = formatComplex(newBeta);

    const latexLine = `\\[|\\psi\\rangle = ${gate} |\\psi\\rangle = ${gateLatex[gate]} \\begin{bmatrix} ${αStr} \\\\ ${βStr} \\end{bmatrix} = \\begin{bmatrix} ${αpStr} \\\\ ${βpStr} \\end{bmatrix}\\]`;

    addStateVectorStep(latexLine);


  };

  return (
    <div className="qubit-panel" style={{ maxWidth: '320px' }}>
      <div ref={mountRef} />
      <label>
        θ: <input type="range" min="0" max={Math.PI} step="0.01" value={theta} onChange={e => setTheta(parseFloat(e.target.value))} />
      </label>
      <label>
        φ: <input type="range" min="0" max={2*Math.PI} step="0.01" value={phi} onChange={e => setPhi(parseFloat(e.target.value))} />
      </label>
      <div>
        α: <input value={alpha} onChange={e => setAlpha(e.target.value)} style={{ width: '80px' }} />
        β: <input value={beta} onChange={e => setBeta(e.target.value)} style={{ width: '80px' }} />
      </div>
      <div>
        <button onClick={() => applyGate('X')}>X</button>
        <button onClick={() => applyGate('Y')}>Y</button>
        <button onClick={() => applyGate('Z')}>Z</button>
        <button onClick={() => applyGate('H')}>H</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
