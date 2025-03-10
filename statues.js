/**
 * Statues.js
 * Handles loading and placement of statue models in the scene.
 * It implements interactivity like hovering and clicking on statues.
 * This module uses Three.js loaders and raycasting to create an interactive experience.
 *
 */

// @ts-ignore
import * as THREE from 'https://unpkg.com/browse/three@0.174.0/build/three.module.js';
// @ts-ignore
import { GLTFLoader } from 'https://unpkg.com/browse/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import { GLTFLoader } from 'https://unpkg.com/browse/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';

// Array to keep track of statue objects in the scene for interactions
const statueObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// References to tooltip and info panel elements from the DOM, they are hidden initially
const tooltipEl = document.getElementById('tooltip');
const infoPanelEl = document.getElementById('info-panel');

// Load all statues into the scene
function loadStatues(scene, camera) {
  // Fetch statue data from the JSON via data.js
  getStatuesData().then((statues) => {
    statues.forEach((st) => {
      // Load each statue model using GLTFLoader
      const loader = new GLTFLoader();
      loader.load(st.model, (gltf) => {
        const model = gltf.scene;
        model.position.set(st.position.x, st.position.y, st.position.z);
        model.userData = { name: st.name, info: st }; // store statue info for reference
        scene.add(model);
        statueObjects.push(model); // keep track for raycasting
      });
    });
  });
}
