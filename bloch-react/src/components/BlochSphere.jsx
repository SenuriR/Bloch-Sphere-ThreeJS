// src/components/BlochSphere.jsx
// TODO 5/19: mvp on sila
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function BlochSphere({ qubits }) {
    const mountRef = useRef();
    const sceneRef = useRef(new THREE.Scene());
    const arrowsRef = useRef([]);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true })
        );
        scene.add(sphere);

        const axesColors = [0xff0000, 0x00ff00, 0x0000ff];
        const dirs = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)];
        dirs.forEach((dir, i) => {
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(-1.2), dir.clone().multiplyScalar(1.2)]),
            new THREE.LineBasicMaterial({ color: axesColors[i] })
        );
        scene.add(line);
        });

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

    useEffect(() => {
        const scene = sceneRef.current;

        //remove prev arrows
        arrowsRef.current = qubits.map(q => {
            const dir = new THREE.Vector3(
                Math.sin(q.theta) * Math.cos(q.phi),
                Math.sin(q.theta) * Math.sin(q.phi),
                Math.cos(q.theta)
            ).normalize();
            const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1, 0xffff00);
            scene.add(arrow);
            return arrow;
            });
        }, [qubits]);

    return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
}
