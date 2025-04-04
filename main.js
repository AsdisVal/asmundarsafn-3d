/*****************************************************************************************
 * Main.js
 *
 * @author Ásdís Valtýsdóttir
 * @version 1.0
 *
 * Initializes the Three.js scene, renderer, camera, lighting, and controls.
 * Sets up the building, seasonal effects, and loads lightweight placeholders for statues.
 ****************************************************************************************/

import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { updateSeasonEffects } from './js/seasons';
import { initSeasons } from './js/seasons';
import { loadPlaceholderStatues } from './js/statues';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const canvas = document.querySelector('#c');
if (!canvas) {
  throw new Error('Canvas element not found');
}
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa1e3d8);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 45, 45);
camera.lookAt(0, 0, 26);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(20, 20, 20);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(0, 10, 5);
directionalLight2.target.position.set(-5, 0, 0);
scene.add(directionalLight2);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-15, 20, -15);
scene.add(fillLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x3b5f3b });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2; // make it horizontal
ground.position.y = -0.55;
ground.position.z = -22;
scene.add(ground);

const mtlLoader = new MTLLoader();
mtlLoader.load('asmundarsafn/nyasta_asmundarsafnid_7.mtl', (materials) => {
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('asmundarsafn/nyasta_asmundarsafnid_7.obj', (object) => {
    object.position.set(0, 0.2, 10);
    object.scale.set(1.5, 1.5, 1.5);
    object.rotation.y = Math.PI;
    scene.add(object);
  });
});

initSeasons(scene, camera);
loadPlaceholderStatues(scene, camera, controls);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateSeasonEffects();
  renderer.render(scene, camera);
}
animate();
