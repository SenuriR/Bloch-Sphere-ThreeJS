// src/components/QubitPanel.jsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function QubitPanel({ qubitIndex, updateCircuit }) {
  const mountRef = useRef();
  const arrowRef = useRef();

  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);

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

    const axes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
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

  return (
    <div className="qubit-panel" style={{ maxWidth: '320px' }}>
      <div ref={mountRef} />
      <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
        <span style={{ width: '20px', textAlign: 'right', marginRight: '8px' }}>θ:</span>
        <input type="range" min="0" max={Math.PI} step="0.01" value={theta} onChange={e => setTheta(parseFloat(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
        <span style={{ width: '20px', textAlign: 'right', marginRight: '8px' }}>φ:</span>
        <input type="range" min="0" max={2 * Math.PI} step="0.01" value={phi} onChange={e => setPhi(parseFloat(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div>
        <button onClick={() => updateCircuit(qubitIndex, 'X')}>X</button>
        <button onClick={() => updateCircuit(qubitIndex, 'Y')}>Y</button>
        <button onClick={() => updateCircuit(qubitIndex, 'Z')}>Z</button>
        <button onClick={() => updateCircuit(qubitIndex, 'H')}>H</button>
      </div>
    </div>
  );
}
