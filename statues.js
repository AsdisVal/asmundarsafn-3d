/**
 * Statues.js
 * Handles loading and placement of statue models in the scene.
 * It implements interactivity like hovering and clicking on statues.
 * This module uses Three.js loaders and raycasting to create an interactive experience.
 *
 */

import * as THREE from 'three';

// Array to keep track of statue objects in the scene for interactions
const statueObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
