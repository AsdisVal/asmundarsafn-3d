/**
 * seasons.js
 * Implements the seasonal effects system.
 * It creates visual effect for winter, spring, summer and autumn,
 * and allows the user to switch between seasons.
 * It also handles any ongoing animations for these effects.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
console.log('seasons.js loaded');
let winterGroup, springGroup, summerGroup, autumnGroup;
let currentSeason = null;

// Initialize seasonal effects and UI
export function initSeasons(scene) {
  //Create effect objects for each season
  winterGroup = createWinterEffect();
  springGroup = createSpringEffect();
  summerGroup = createSummerEffect();
  autumnGroup = createAutumnEffect();

  // Add all groups to the scene but keep them hidden initially
  scene.add(winterGroup, springGroup, summerGroup, autumnGroup);
  winterGroup.visible =
    springGroup.visible =
    summerGroup.visible =
    autumnGroup.visible =
      false;
  springGroup.visible = true; // default to summer
  currentSeason = 'spring';

  createSeasonMenu();
}

// Frame-by-frame update for animated effects
export function updateSeasonEffects() {
  if (currentSeason === 'winter') {
    winterGroup.children.forEach((p) => {
      p.position.y -= 0.1;
      p.position.x += Math.sin(p.rotation.y) * 0.01; // drift
      p.rotation.y += 0.01; // spin
      if (p.position.y < 0) p.position.y = 20;
    });
  }
  if (currentSeason === 'autumn') {
    // Make leaves fall and maybe rotate slowly
    autumnGroup.children.forEach((leaf) => {
      leaf.position.y -= 0.05;
      if (leaf.position.y < 0) leaf.position.y = 15;
      leaf.rotation.z += 0.01;
    });
  }
  if (currentSeason === 'spring') {
    springGroup.children.forEach((flower) => {
      const s = flower.scale.x;
      if (s < 1) {
        const newScale = s + 0.01;
        flower.scale.set(newScale, newScale, newScale);
      }
    });
  }
  if (currentSeason === 'summer') {
    // Have birds fly around
  }
  // (Spring and Summer could have their own minor animations if needed)
}

function createSeasonMenu() {
  // Create simple UI butons to switch seasons
  const menu = document.createElement('div');
  menu.id = 'season-menu';
  document.body.appendChild(menu);
  ['winter', 'spring', 'summer', 'autumn'].forEach((seasonName) => {
    const btn = document.createElement('button');
    btn.textContent = seasonName;
    btn.onclick = () => setSeason(seasonName.toLowerCase());
    menu.appendChild(btn);
  });
}

//Function to switch the visible season
function setSeason(season) {
  currentSeason = season;
  // Toggle visibility of each season's group based on selection
  winterGroup.visible = season === 'winter';
  springGroup.visible = season === 'spring';
  summerGroup.visible = season === 'summer';
  autumnGroup.visible = season === 'autumn';
}

// --- Helper functions to create seasonal effect groups ---

function createWinterEffect() {
  const group = new THREE.Group();
  const geom = new THREE.SphereGeometry(0.1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 200; i++) {
    const snowflake = new THREE.Mesh(geom, mat);
    // Randomly position snowflakes in a broad volume above the scene
    snowflake.position.set(
      Math.random() * 50 - 25, // x in [-25, 25]
      Math.random() * 20 + 10, // y in [10, 30] (some height above ground)
      Math.random() * 50 - 25 // z in [-25, 25]
    );
    group.add(snowflake);
  }
  return group;
}

function createSpringEffect() {
  const group = new THREE.Group();

  const flowerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });

  for (let i = 0; i < 30; i++) {
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial.clone());
    flower.position.set(Math.random() * 40 - 20, 0, Math.random() * 40 - 20);
    flower.scale.set(0.01, 0.01, 0.01); // Start tiny for bloom effect
    group.add(flower);
  }

  return group;
}

function createSummerEffect() {
  const group = new THREE.Group();

  const birdGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.2);
  const birdMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const bird = new THREE.Mesh(birdGeometry, birdMaterial);
  bird.position.set(0, 10, 0);
  group.add(bird);

  let angle = 0;
  const radius = 10;
  function animateBird() {
    angle += 0.01;
    bird.position.set(
      Math.cos(angle) * radius,
      10 + Math.sin(angle * 2) * 2,
      Math.sin(angle) * radius
    );
    requestAnimationFrame(animateBird);
  }
  animateBird();

  return group;
}

function createAutumnEffect() {
  const group = new THREE.Group(); // Initialize the group
  const leafGeom = new THREE.PlaneGeometry(0.5, 0.5); // Define leaf geometry

  for (let i = 0; i < 50; i++) {
    const leafMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.05, 1, 0.5),
      transparent: true,
      opacity: Math.random() * 0.5 + 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(
      Math.random() * 50 - 25,
      Math.random() * 15 + 5,
      Math.random() * 50 - 25
    );
    leaf.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    group.add(leaf);
  }
  return group;
}
