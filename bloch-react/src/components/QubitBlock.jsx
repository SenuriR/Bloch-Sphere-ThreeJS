// src/components/QubitBlock.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { create, all } from 'mathjs';

const math = create(all);

export default function QubitBlock() {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const mountRef = useRef();
  const arrowRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true })
    );
    scene.add(sphere);

    const axesColors = [0xff0000, 0x00ff00, 0x0000ff];
    const dirs = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
    dirs.forEach((dir, i) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          dir.clone().multiplyScalar(-1.2),
          dir.clone().multiplyScalar(1.2)
        ]),
        new THREE.LineBasicMaterial({ color: axesColors[i] })
      );
      scene.add(line);
    });

    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0xffff00);
    arrowRef.current = arrow;
    scene.add(arrow);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        if (canvas && canvas.parentNode === mountRef.current) {
          mountRef.current.removeChild(canvas);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (arrowRef.current) {
      const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(theta)
      ).normalize();
      arrowRef.current.setDirection(dir);
    }
  }, [theta, phi]);

  const reset = () => {
    setTheta(0);
    setPhi(0);
  };

  const randomize = () => {
    setTheta(Math.random() * Math.PI);
    setPhi(Math.random() * 2 * Math.PI);
  };

  const applyGate = (gate) => {
    const alpha = math.complex(Math.cos(theta / 2), 0);
    const beta = math.complex({ abs: Math.sin(theta / 2), arg: phi });

    const gates = {
      X: [[0, 1], [1, 0]],
      Y: [[0, math.complex(0, -1)], [math.complex(0, 1), 0]],
      Z: [[1, 0], [0, -1]],
      H: [[1 / Math.sqrt(2), 1 / Math.sqrt(2)], [1 / Math.sqrt(2), -1 / Math.sqrt(2)]]
    };

    const m = gates[gate];
    const newAlpha = math.add(math.multiply(m[0][0], alpha), math.multiply(m[0][1], beta));
    const newBeta = math.add(math.multiply(m[1][0], alpha), math.multiply(m[1][1], beta));

    const x = 2 * math.re(math.multiply(math.conj(newAlpha), newBeta));
    const y = 2 * math.im(math.multiply(math.conj(newAlpha), newBeta));
    const z = Math.pow(math.abs(newAlpha), 2) - Math.pow(math.abs(newBeta), 2);
    const r = Math.sqrt(x * x + y * y + z * z);

    const newTheta = Math.acos(z / r);
    const newPhi = Math.atan2(y, x);

    setTheta(newTheta);
    setPhi(newPhi);
  };

  return (
    <div className="qubit-block">
      <div ref={mountRef} style={{ width: '100%', height: '300px' }} />
      <div className="qubit-panel">
        <strong>Qubit</strong>
        <label>
          θ:
          <input type="range" min="0" max="3.1415" step="0.01" value={theta} onChange={(e) => setTheta(parseFloat(e.target.value))} />
        </label>
        <label>
          φ:
          <input type="range" min="0" max="6.283" step="0.01" value={phi} onChange={(e) => setPhi(parseFloat(e.target.value))} />
        </label>
        <div style={{ marginTop: '8px' }}>
          <button onClick={reset}>Reset</button>
          <button onClick={randomize}>Randomize</button>
        </div>
        <div>
          <strong>Gates:</strong><br />
          <button onClick={() => applyGate('X')}>X</button>
          <button onClick={() => applyGate('Y')}>Y</button>
          <button onClick={() => applyGate('Z')}>Z</button>
          <button onClick={() => applyGate('H')}>H</button>
        </div>
      </div>
    </div>
  );
}
