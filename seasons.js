/**
 * seasons.js
 * Implements the seasonal effects system.
 * It creates visual effect for winter, spring, summer and autumn,
 * and allows the user to switch between seasons.
 * It also handles any ongoing animations for these effects.
 */

// @ts-ignore
import * as THREE from 'https://unpkg.com/browse/three@0.174.0/build/three.module.js';

let winterGroup, springGroup, summerGroup, autumnGroup;
let currentSeason = null;

// Initialize seasonal effects and UI
function initSeasons(scene) {
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

// Frame-by-frame update for animated effects
function updateSeasonEffects() {
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
