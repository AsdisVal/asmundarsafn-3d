/**
 *
 * main.js
 * Initializes the Three.js scene, renderer, and camera, sets up lighting and controls, and ties everything together. It also starts the animation loop.
 * */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { updateSeasonEffects } from './js/seasons';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 40);
camera.lookAt(0, 0, 26);

// Create the WebGL renderer and add it to the document.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // adds the <canvas> to the DOM

// Add OrbitControls to let the user rotate/pan/zoom with the mouse.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 20, 20);
scene.add(directionalLight);

// -----------------------------
// Ground Plane
// -----------------------------
// A simple plane at y=0, rotated so it lies horizontally.
const planeGeometry = new THREE.PlaneGeometry(120, 70);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2; // make it horizontal
ground.position.y = 0;
scene.add(ground);

// -----------------------------
// Building Group
// -----------------------------
const building = new THREE.Group();
scene.add(building);

// 1) Central Box (lengdxbreiddxhæð)=(13x8.5x4.5), extended toward the viewer
const centralBoxGeometry = new THREE.BoxGeometry(9.4, 4.5, 14);
centralBoxGeometry.translate(0, 1.3, 13); // shift so back is at z=-3, front at z=4.5
const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
const centralBox = new THREE.Mesh(centralBoxGeometry, boxMaterial);
centralBox.position.y = 1; // so bottom sits at y=0
building.add(centralBox);

// 2) Hvíta kúlan (hæð)=4.5
const domeRadius = 4.5;
const domeGeometry = new THREE.SphereGeometry(
  domeRadius,
  32,
  16,
  0,
  Math.PI * 2,
  0,
  Math.PI / 1.9
);
const dome = new THREE.Mesh(domeGeometry, boxMaterial);
dome.translateZ(11);
dome.position.y = 4.2;
building.add(dome);

// 3) Trapisurnar h-megin og v-megin (hæð)=2.5
const trapezoidShape = new THREE.Shape();
trapezoidShape.moveTo(-6, 0); // bottom left
trapezoidShape.lineTo(6, 0); // bottom right
trapezoidShape.lineTo(4, 6); // top right
trapezoidShape.lineTo(-4, 6); // top left
trapezoidShape.lineTo(-6, 0); // close the shape

const extrudeSettings = {
  steps: 1,
  depth: 5,
  bevelEnabled: false,
};
const trapezoidGeometry = new THREE.ExtrudeGeometry(
  trapezoidShape,
  extrudeSettings
);
const sideMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

const leftSide = new THREE.Mesh(trapezoidGeometry, sideMaterial);
leftSide.position.set(-9.1, 0, 15.5);
building.add(leftSide);

const rightSide = new THREE.Mesh(trapezoidGeometry.clone(), sideMaterial);
rightSide.position.set(9.1, 0, 15.5);
building.add(rightSide);

// load statues and seasonal effects
//loadStatues(scene, camera); // from statues.js: add statue models and interactions
//initSeasons(scene); // from seasons.js: set up seasonal system (default season)

// Adjust camera and renderer on window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // update orbit controls (for damping)
  updateSeasonEffects(); // update seasonal animations (falling snow/leaves)
  renderer.render(scene, camera);
}
animate();

/**
 * CONCLUSION:
 * We have set up the scene, camera and renderer. We then call loadStatues() and initSeasons() to add the statue models and seasonal effects.
 */

/*
import { load } from 'three/examples/jsm/libs/opentype.module.js';
import { update } from 'three/examples/jsm/libs/tween.module.js';

function init() {
  // Create the scene and set a background color.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Create a perspective camera.
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 12);
  camera.lookAt(0, 0, 0);

  // Create the WebGL renderer and add it to the document.
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add OrbitControls to let the user rotate/pan/zoom with the mouse.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1, 0);

  // Add ambient and directional lights.
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(20, 20, 20);
  scene.add(directionalLight);

  // -----------------------------
  // Ground Plane
  // -----------------------------
  // A simple plane at y=0, rotated so it lies horizontally.
  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const ground = new THREE.Mesh(planeGeometry, planeMaterial);
  ground.rotation.x = -Math.PI / 2; // make it horizontal
  ground.position.y = 0;
  scene.add(ground);

  // -----------------------------
  // Building Group
  // -----------------------------
  const building = new THREE.Group();
  scene.add(building);

  // 1) Central Box (4×2×7.5), extended toward the viewer
  const centralBoxGeometry = new THREE.BoxGeometry(5, 2, 8);
  centralBoxGeometry.translate(0, 0, 0.75); // shift so back is at z=-3, front at z=4.5
  const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const centralBox = new THREE.Mesh(centralBoxGeometry, boxMaterial);
  centralBox.position.y = 1; // so bottom sits at y=0
  building.add(centralBox);

  // 2) Hemispherical Dome (the "circle") on top
  const domeRadius = 2.5;
  const domeGeometry = new THREE.SphereGeometry(
    domeRadius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 3.5
  );
  const dome = new THREE.Mesh(domeGeometry, boxMaterial);
  dome.position.y = 1.8; // top of the box is at y=1.8
  building.add(dome);

  // 3) Trapezoidal Side Pieces (left & right)
  const trapezoidShape = new THREE.Shape();
  trapezoidShape.moveTo(-3.5, 0); // bottom left
  trapezoidShape.lineTo(3.5, 0); // bottom right
  trapezoidShape.lineTo(1.3, 2.5); // top right
  trapezoidShape.lineTo(-1.3, 2.5); // top left
  trapezoidShape.lineTo(-3.5, 0); // close the shape

  const extrudeSettings = {
    steps: 1,
    depth: 2,
    bevelEnabled: false,
  };
  const trapezoidGeometry = new THREE.ExtrudeGeometry(
    trapezoidShape,
    extrudeSettings
  );
  const sideMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const leftSide = new THREE.Mesh(trapezoidGeometry, sideMaterial);
  leftSide.position.set(-4, 0, 3.2);
  building.add(leftSide);

  const rightSide = new THREE.Mesh(trapezoidGeometry.clone(), sideMaterial);
  rightSide.position.set(4, 0, 3.2);
  building.add(rightSide);

  // -----------------------------
  // 4) Two statue boxes in front
  // -----------------------------
  // For simplicity, let's just create two tall boxes and place them in front of the building.
  // Adjust positions/sizes to your taste.
  const statueGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  const statueMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const statue1 = new THREE.Mesh(statueGeometry, statueMaterial);
  statue1.position.set(-2, 0.75, 7); // center at y=0.75 so the bottom sits on y=0
  building.add(statue1);

  const statue2 = statue1.clone();
  statue2.position.set(2, 0.75, 7);
  building.add(statue2);

  // -----------------------------
  // Render loop
  // -----------------------------
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // For smooth orbiting (damping)
    renderer.render(scene, camera);
  }

  animate();

  // Handle window resizing
  window.addEventListener('resize', onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

init();
*/
