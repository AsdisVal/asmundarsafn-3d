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
  summerGroup.visible = true; // default to summer
  currentSeason = 'summer';

  createSeasonMenu();
}

// Frame-by-frame update for animated effects
export function updateSeasonEffects() {
  if (currentSeason === 'winter') {
    // Make snow particles
    winterGroup.children.forEach((p) => {
      p.position.y -= 0.1;
      if (p.position.y < 0) p.position.y = 20; // reset snowflake to top
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
    // Make flowers bloom
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
  // Example: Could add animated birds here
  //left as a placeholder for later...
  return group;
}

function createSummerEffect() {
  const group = new THREE.Group();

  // Define each model with both its file path and a preferred scale
  const modelConfigs = [
    /*
    {
      url: 'data/models/nature/linen_with_flowers/scene.gltf',
      scale: 0.05, // A bit smaller
    },
    
    {
      url: 'data/models/nature/white_flower/scene.gltf',
      scale: 0.02, // Larger still
    },
     {
      url: 'data/models/nature/flower/scene.gltf',
      scale: 0.02, // Make this model slightly bigger
    },
    */
    {
      url: 'data/models/nature/garden_flower_-_vegetation/scene.gltf',
      scale: 0.8, // Adjust as needed
    },
    {
      url: 'data/models/nature/flowers_lib/scene.gltf',
      scale: 0.4, // Adjust as needed
    },
  ];

  const loader = new GLTFLoader();

  modelConfigs.forEach((config) => {
    loader.load(
      config.url,
      (gltf) => {
        // Create multiple instances of each model type
        for (let i = 0; i < 20; i++) {
          const instance = gltf.scene.clone();

          // Random positioning (adjust ranges as needed for your scene)
          instance.position.set(
            Math.random() * 120 - 50, // X range
            0,
            Math.random() * 70 - 50 // Z range
          );
          // Apply the model-specific scale
          instance.scale.set(config.scale, config.scale, config.scale);
          // Optionally add a little random variation:
          const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
          instance.scale.set(
            config.scale * randomFactor,
            config.scale * randomFactor,
            config.scale * randomFactor
          );
          // Random rotation for variety
          instance.rotation.y = Math.random() * Math.PI * 2;

          group.add(instance);
        }
      },
      undefined, // onProgress callback (optional)
      (error) => {
        console.error(`Error loading model from ${config.url}:`, error);
      }
    );
  });

  return group;
}

function createAutumnEffect() {
  const group = new THREE.Group();
  // create flat plane leaves with brownish color
  const leafGeom = new THREE.BoxGeometry(0.5, 0.5, 0.05);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    'data/models/nature/red_fall_leaf/textures/Material.001_baseColor.png',
    (texture) => {
      const leafMat = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
      });
      for (let i = 0; i < 50; i++) {
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.set(
          Math.random() * 40 - 20,
          Math.random() * 15 + 5,
          Math.random() * 40 - 20
        );
        leaf.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        group.add(leaf);
      }
    },
    undefined,
    (error) => {
      console.error('Error loading leaf texture:', error);
    }
  );
  return group;
}
