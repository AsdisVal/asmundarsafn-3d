/**
 * main.js
 * Initializes the Three.js scene, renderer, camera, lighting, and controls.
 * Sets up the building, seasonal effects, and loads lightweight placeholders for statues.
 */
import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { updateSeasonEffects } from './js/seasons';
import { initSeasons } from './js/seasons';
import { loadPlaceholderStatues, loadStatues } from './js/statues';

const canvas = document.querySelector('#c');
if (!canvas) {
  throw new Error('Canvas element not found');
}
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

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(20, 20, 20);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(0, 10, 5);
directionalLight2.target.position.set(-5, 0, 0);
scene.add(directionalLight2);

const lightHelper = new THREE.DirectionalLightHelper(directionalLight2);
const gridHelper = new THREE.GridHelper(200, 70);
scene.add(lightHelper, gridHelper);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// Overview Toggle Button
const overviewToggleButton = document.getElementById('overview-toggle-button');
if (overviewToggleButton) {
  overviewToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('overview-mode');
  });
} else {
  console.warn('Overview toggle button not found');
}

//Ground Plane

const planeGeometry = new THREE.PlaneGeometry(200, 150);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x9acd32 }); // grass green
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2; // make it horizontal
ground.position.y = 0;
scene.add(ground);

// -----------------------------
// Building Group
// -----------------------------
const building = new THREE.Group();
scene.add(building);

const textureLoader = new THREE.TextureLoader();

const frontWallTexture = textureLoader.load('texture/front_wall.jpg');
const otherTexture = textureLoader.load('texture/asmundarsafn_white.jpg');
const leftWallTexture = textureLoader.load('texture/left_side_wall.jpg');
const rightWallTexture = textureLoader.load('texture/right_side_wall.jpg');

const frontMaterial = new THREE.MeshLambertMaterial({ map: frontWallTexture });
const otherMaterial = new THREE.MeshLambertMaterial({ map: otherTexture });
const leftMaterial = new THREE.MeshLambertMaterial({ map: leftWallTexture });
const rightMaterial = new THREE.MeshLambertMaterial({ map: rightWallTexture });

const materials = [
  rightMaterial, // Right side
  leftMaterial, // Left side
  otherMaterial, // Top side
  otherMaterial, // Bottom side
  frontMaterial, // Front side
  otherMaterial, // Back side
];
const boxGeometry = new THREE.BoxGeometry(9.4, 4.5, 14);
boxGeometry.translate(0, 1.3, 13); // shift so back is at z=-3, front at z=4.5
const boxmesh = new THREE.Mesh(boxGeometry, materials);
boxmesh.position.y = 1; // so bottom sits at y=0
building.add(boxmesh);

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
const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
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

const patternTexture = textureLoader.load('texture/asmundarsafn_white.jpg');
patternTexture.wrapS = THREE.RepeatWrapping;
patternTexture.wrapT = THREE.RepeatWrapping;
patternTexture.repeat.set(1, 1);

const patternMaterial = new THREE.MeshLambertMaterial({ map: patternTexture });

const leftSide = new THREE.Mesh(trapezoidGeometry, patternMaterial);
leftSide.position.set(-9.1, 0, 15.5);
building.add(leftSide);

const rightSide = new THREE.Mesh(trapezoidGeometry.clone(), patternMaterial);
rightSide.position.set(9.1, 0, 15.5);
building.add(rightSide);

// aftari parturinn
const backBox = new THREE.BoxGeometry(9.4, 3, 16);
backBox.translate(0, 1, 0); // shift so back is at z=-3, front at z=4.5
const backBoxMesh = new THREE.Mesh(backBox, materials);
backBoxMesh.position.y = 1; // so bottom sits at y=0
backBoxMesh.position.z = -1;
building.add(backBoxMesh);
// Create a circle geometry that covers 70% of a full circle
const radius = 5;
const segments = 32;
const thetaStart = 0;
const thetaLength = 2 * Math.PI * 0.4; // 70% of 2π

const geometry = new THREE.CircleGeometry(
  radius,
  segments,
  thetaStart,
  thetaLength
);
const material = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide,
});
const circleMesh = new THREE.Mesh(geometry, material);
circleMesh.rotateX(Math.PI / 2);
circleMesh.rotateZ(Math.PI * 1.1);
// make circle bigger
circleMesh.scale.set(4, 4, 4);
circleMesh.position.set(0, 2.5, 8);
building.add(circleMesh);

// Seasonal Effects
initSeasons(scene);

// Load Placeholder Statues (lazy-loading)
loadPlaceholderStatues(scene, camera, controls);

// Adjust on window resize
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
