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
import { updateSeasonEffects, initSeasons } from './js/seasons';
import { loadPlaceholderStatues } from './js/statues';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let firstPersonMode = false;
let fpControls;
let keys = {};
let direction = new THREE.Vector3();

const canvas = document.querySelector('#mainCanvas');
if (!canvas) {
  throw new Error('Canvas element not found');
}
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 45, 45);
camera.lookAt(0, 0, -26);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);

scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(20, 20, 20);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
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

const planeGeometry = new THREE.PlaneGeometry(250, 110);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x3b5f3b });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2; // make it horizontal
ground.position.y = 0;
ground.position.z = -29;
scene.add(ground);

const mtlLoader = new MTLLoader();
mtlLoader.load('asmundarsafn/update_museum_22_07.mtl', (materials) => {
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('asmundarsafn/update_museum_22_07.obj', (object) => {
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

// Handle key events
window.addEventListener('keydown', (e) => {
  if (e.key === '1') {
    firstPersonMode = !firstPersonMode;

    if (firstPersonMode) {
      controls.enabled = false;

      if (!fpControls) {
        fpControls = new PointerLockControls(camera, document.body);

        camera.position.set(0, 2, 10);

        // Only attach the click event once
        document.body.addEventListener(
          'click',
          () => {
            if (fpControls) {
              fpControls.lock();
            }
          },
          { once: true }
        ); // Only once, so we don’t stack up multiple listeners
      }

      const instr = document.getElementById('instructions');
      if (instr) instr.style.display = 'none';
    } else {
      controls.enabled = true;

      if (fpControls) {
        fpControls.unlock();
        fpControls = null;
      }
    }
  }

  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Handle intro start button
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const introOverlay = document.getElementById('introOverlay');
  const mainElement = document.querySelector('main');

  if (startBtn && introOverlay && mainElement) {
    startBtn.addEventListener('click', () => {
      introOverlay.style.display = 'none';
      mainElement.hidden = false;
    });
  } else {
    console.warn('Intro elements not found in DOM.');
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (firstPersonMode && fpControls && fpControls.isLocked) {
    const speed = 0.2;
    direction.set(0, 0, 0);

    if (keys['w']) direction.z += 1;
    if (keys['s']) direction.z -= 1;
    if (keys['a']) direction.x -= 1;
    if (keys['d']) direction.x += 1;

    direction.normalize().multiplyScalar(speed);

    fpControls.moveRight(direction.x);
    fpControls.moveForward(direction.z);
  } else {
    controls.update();
  }

  updateSeasonEffects();
  renderer.render(scene, camera);
}
animate();

export { ground, scene };
