import React, { useRef, useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function QubitPanel({ qubitIndex, blochData, updateCircuit }) {
  const mountRef = useRef();
  const arrowRef = useRef();
  const sphereRef = useRef();
  const sceneRef = useRef();

  // Initialize Three.js scene
  useLayoutEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

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
    sphereRef.current = sphere;
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
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // This fires AFTER Three.js objects exist
  useEffect(() => {
    if (!blochData || !sphereRef.current || !arrowRef.current) return;

    const { bloch_vector, purity } = blochData;

    const radius = purity;
    sphereRef.current.scale.set(radius, radius, radius);

    // Change sphere color based on purity
    const newColor = (purity >= 0.99) ? 0x00aaff : 0xffcc00;  // blue for pure, yellow for mixed
    sphereRef.current.material.color.setHex(newColor);

    if (purity < 0.55) {
      arrowRef.current.visible = false;
    } else {
      arrowRef.current.visible = true;
      const dir = new THREE.Vector3(
        bloch_vector[0],
        bloch_vector[1],
        bloch_vector[2]
      ).normalize();
      arrowRef.current.setDirection(dir);
      arrowRef.current.setLength(radius);
    }
  }, [blochData]);


  return (
    <div className="qubit-panel" style={{ maxWidth: '320px' }}>
      <div ref={mountRef} />

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => updateCircuit(qubitIndex, 'X')}>X</button>
        <button onClick={() => updateCircuit(qubitIndex, 'Y')}>Y</button>
        <button onClick={() => updateCircuit(qubitIndex, 'Z')}>Z</button>
        <button onClick={() => updateCircuit(qubitIndex, 'H')}>H</button>
        <button onClick={() => updateCircuit(qubitIndex, 'S')}>S</button>
        <button onClick={() => updateCircuit(qubitIndex, 'T')}>T</button>
      </div>
    </div>
  );
}
