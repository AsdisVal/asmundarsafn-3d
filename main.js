/**
 *
 * main.js
 * Initializes the Three.js scene, renderer, and camera, sets up lighting and controls, and ties everything together. It also starts the animation loop.
 * */
import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { updateSeasonEffects } from './js/seasons';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#c');
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

// Renderer : renders the scene
if (!canvas) {
  throw new Error('Canvas element not found');
}
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // adds the <canvas> to the DOM

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 5);
light.target.position.set(-5, 0, 0);
scene.add(light);

const lightHelper = new THREE.DirectionalLightHelper(light);
const gridHelper = new THREE.GridHelper(200, 70);
scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 20, 20);
scene.add(directionalLight);

// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;

// Info Panel
const infoPanel = document.createElement('div');
infoPanel.style.position = 'absolute';
infoPanel.style.bottom = '10px';
infoPanel.style.left = '10px';
infoPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
infoPanel.style.color = 'white';
infoPanel.style.padding = '10px';
infoPanel.style.borderRadius = '5px';
infoPanel.style.display = 'none';
document.body.appendChild(infoPanel);

// Load 3D Model
const loader = new GLTFLoader();
let loadedObject = null;

loader.load(
  'data/models/maple_tree/scene.gltf',
  function (gltf) {
    loadedObject = gltf.scene;
    loadedObject.scale.set(0.05, 0.05, 0.05);
    loadedObject.position.set(-20, -0.25, 6);
    scene.add(loadedObject);

    // Assign custom user data
    loadedObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = {
          name: child.name || 'Unknown Object',
          description: 'This is a detailed description of the object.',
        };
      }
    });
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Hover & Click Events
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    if (INTERSECTED !== intersects[0].object) {
      if (INTERSECTED) INTERSECTED.material = INTERSECTED.originalMaterial;
      INTERSECTED = intersects[0].object;
      if (INTERSECTED instanceof THREE.Mesh) {
        INTERSECTED.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      }
    }
  } else {
    if (INTERSECTED) INTERSECTED.material = INTERSECTED.originalMaterial;
    INTERSECTED = null;
  }
});

window.addEventListener('click', (event) => {
  if (!INTERSECTED) return;

  // Show Info Panel
  infoPanel.style.display = 'block';
  infoPanel.innerHTML = `<strong>${INTERSECTED.userData.name}</strong><br>${INTERSECTED.userData.description}`;
});

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
