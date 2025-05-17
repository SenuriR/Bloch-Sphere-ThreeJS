import * as THREE from  'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';
const math = window.Math;

let qubits = [];
let qubitIndex = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '0';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true });

function createFullAxis(origin, dir, color) {
    const lineMaterial = new THREE.LineBasicMaterial({ color });
    const points = [dir.clone().multiplyScalar(-1.2).add(origin), dir.clone().multiplyScalar(1.2).add(origin)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, lineMaterial);
}

function addQubit(id, theta = 0, phi = 0, offsetX = 0) {
    const origin = new THREE.Vector3(offsetX, 0, 0);
    const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(theta)
    ).normalize();

    const vector = new THREE.ArrowHelper(dir, origin, 1, 0xffff00, 0.15, 0.08);
    scene.add(vector);

    const sphere = new THREE.Mesh(sphereGeometry.clone(), sphereMaterial.clone());
    sphere.position.set(offsetX, 0, 0);
    scene.add(sphere);

    scene.add(createFullAxis(origin, new THREE.Vector3(1, 0, 0), 0xff0000));
    scene.add(createFullAxis(origin, new THREE.Vector3(0, 1, 0), 0x00ff00));
    scene.add(createFullAxis(origin, new THREE.Vector3(0, 0, 1), 0x0000ff));

    qubits.push({ id, theta, phi, vector, offsetX });

    
}

function updateQubit(index, theta, phi) {
    const qb = qubits[index];
    qb.theta = theta;
    qb.phi = phi;

    const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(theta)
    ).normalize();

    scene.remove(qb.vector);
    qb.vector = new THREE.ArrowHelper(dir, new THREE.Vector3(qb.offsetX, 0, 0), 1, 0xffff00, 0.15, 0.08);
    scene.add(qb.vector);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById("addQubitBtn");
    addBtn.addEventListener("click", () => {
        const offsetX = qubitIndex * 2;
        addQubit('q${qubitIndex}', 0, 0, offsetX);
        qubitIndex++;
    });
    
    addQubit("q0", 0, 0, 0);
    qubitIndex++;
});